import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { neighborhoods, historicalEvents, getRiskColor, getAssetIconSVG } from '@/lib/mockData';
import { fetchCriticalAssets } from '@/lib/osmService';
import { useAppContext } from '@/contexts/AppContext';
import { Asset } from '@/types';
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import InfoPanel from './InfoPanel';
import RiskDetailModal from './RiskDetailModal';

const MapView: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { filters, selectedItem } = state;
  const [map, setMap] = useState<L.Map | null>(null);
  const [markersLayer, setMarkersLayer] = useState<L.LayerGroup | null>(null);
  const [riskZonesLayer, setRiskZonesLayer] = useState<L.LayerGroup | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRiskData, setSelectedRiskData] = useState<any>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState<boolean>(true);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Create map instance
    const mapInstance = L.map('map', {
      center: [state.mapView.center.lat, state.mapView.center.lng],
      zoom: state.mapView.zoom,
      zoomControl: false
    });

    // Satellite map tiles
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(mapInstance);

    // Add semi-transparent overlay for streets
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      opacity: 0.3
    }).addTo(mapInstance);

    // Create new markers layer
    const newMarkersLayer = L.layerGroup().addTo(mapInstance);
    
    // Set state
    setMap(mapInstance);
    setMarkersLayer(newMarkersLayer);
    
    // Wait for map to be ready
    mapInstance.whenReady(() => {
      setIsMapReady(true);
    });

    return () => {
      mapInstance.remove();
    };
  }, []);

  // Load critical assets from OpenStreetMap
  useEffect(() => {
    if (!isMapReady) return;
    
    const loadAssets = async () => {
      try {
        setAssetsLoading(true);
        const osmAssets = await fetchCriticalAssets();
        setAssets(osmAssets);
      } catch (err) {
        console.error('Error loading critical assets:', err);
      } finally {
        setAssetsLoading(false);
      }
    };
    
    loadAssets();
  }, [isMapReady]);

  // Update markers when filters change
  useEffect(() => {
    if (map && markersLayer) {
      markersLayer.clearLayers();
      
      // Add neighborhood markers
      neighborhoods
        .filter(n => {
          const floodVisible = 
            (n.floodRisk === 'high' && filters.showHigh) ||
            (n.floodRisk === 'medium' && filters.showMedium) ||
            (n.floodRisk === 'low' && filters.showLow);
          
          const landslideVisible = 
            (n.landslideRisk === 'high' && filters.showHigh) ||
            (n.landslideRisk === 'medium' && filters.showMedium) ||
            (n.landslideRisk === 'low' && filters.showLow);
            
          return floodVisible || landslideVisible;
        })
        .forEach(n => {
          const color = getRiskColor(n.floodRisk);
          const marker = L.circleMarker([n.location.lat, n.location.lng], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(markersLayer!);
          
          // Create tooltip content
          const tooltipContent = `
            <div class="marker-tooltip">
              <strong>${n.name}</strong>
              <div>Population at risk: ${n.populationAtRisk.toLocaleString()}</div>
              <div class="tooltip-risks">
                <span>Flood: <span class="capitalize" style="color: ${getRiskColor(n.floodRisk)}">${n.floodRisk}</span></span>
                <span>Landslide: <span class="capitalize" style="color: ${getRiskColor(n.landslideRisk)}">${n.landslideRisk}</span></span>
              </div>
            </div>
          `;
          
          // Add tooltip to marker
          marker.bindTooltip(tooltipContent, { 
            direction: 'top',
            offset: L.point(0, -5)
          });
          
          marker.on('click', () => {
            dispatch({
              type: 'SELECT_ITEM',
              payload: { type: 'neighborhood', id: n.id }
            });
          });
        });

      // Add asset markers
      assets
        .filter(a => {
          const floodVisible = 
            (a.floodRisk === 'high' && filters.showHigh) ||
            (a.floodRisk === 'medium' && filters.showMedium) ||
            (a.floodRisk === 'low' && filters.showLow);
          
          const landslideVisible = 
            (a.landslideRisk === 'high' && filters.showHigh) ||
            (a.landslideRisk === 'medium' && filters.showMedium) ||
            (a.landslideRisk === 'low' && filters.showLow);
            
          return floodVisible || landslideVisible;
        })
        .forEach(a => {
          const color = getRiskColor(a.floodRisk);
          
          // Get the appropriate SVG paths for the asset type
          const svgPaths = getAssetIconSVG(a.type);
          
          // Create the custom HTML for the icon
          const html = `
            <div style="background-color: white; border-radius: 50%; padding: 3px; border: 2px solid ${color}">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${svgPaths}
              </svg>
            </div>
          `;
          
          // Create the icon
          const icon = L.divIcon({
            className: 'custom-asset-marker',
            html: html,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          
          // Create marker
          const marker = L.marker([a.location.lat, a.location.lng], { icon }).addTo(markersLayer!);
          
          // Create tooltip content for assets
          const tooltipContent = `
            <div class="marker-tooltip">
              <strong>${a.name}</strong>
              <div>Type: <span class="capitalize">${a.type}</span></div>
              <div class="tooltip-risks">
                <span>Flood: <span class="capitalize" style="color: ${getRiskColor(a.floodRisk)}">${a.floodRisk}</span></span>
                <span>Landslide: <span class="capitalize" style="color: ${getRiskColor(a.landslideRisk)}">${a.landslideRisk}</span></span>
              </div>
            </div>
          `;
          
          // Add tooltip to marker
          marker.bindTooltip(tooltipContent, { 
            direction: 'top',
            offset: L.point(0, -8)
          });
          
          marker.on('click', () => {
            dispatch({
              type: 'SELECT_ITEM',
              payload: { type: 'asset', id: a.id }
            });
          });
        });

      // Add event markers
      historicalEvents.forEach(e => {
        const marker = L.circleMarker([e.location.lat, e.location.lng], {
          radius: 7,
          fillColor: '#F4A261', // accent color
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(markersLayer!);
        
        // Format date for tooltip
        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        };
        
        // Create tooltip content for events
        const tooltipContent = `
          <div class="marker-tooltip">
            <strong>${e.title}</strong>
            <div>${formatDate(e.date)}</div>
            <div>Type: <span class="capitalize">${e.type}</span></div>
            <div class="text-xs">Click for details</div>
          </div>
        `;
        
        // Add tooltip to marker
        marker.bindTooltip(tooltipContent, { 
          direction: 'top',
          offset: L.point(0, -5)
        });
        
        marker.on('click', () => {
          dispatch({
            type: 'SELECT_ITEM',
            payload: { type: 'event', id: e.id }
          });
        });
      });
    }
  }, [map, markersLayer, filters, dispatch, assets]);

  // Load and display GeoJSON landslide risk zones
  useEffect(() => {
    if (!map || !isMapReady) return;

    // Create a layer group to hold all risk zone layers
    const riskZonesGroup = L.layerGroup().addTo(map);

    // First load all the background risk zones (non-interactive)
    const loadBackgroundLayers = async () => {
      try {
        // Load low risk landslide zones first (bottom layer)
        const lowRiskResponse = await fetch('/data/landslide_low.geojson');
        const lowRiskData = await lowRiskResponse.json();
        L.geoJSON(lowRiskData, {
          style: () => ({
            color: 'none', // No border
            weight: 0,
            fillColor: '#FFFFCC', // Pale yellow for low risk
            fillOpacity: 0.6,
          }),
          onEachFeature: (feature, layer) => {
            // No tooltip or click handlers for background layers
          }
        }).addTo(riskZonesGroup);
        
        // Load medium risk landslide zones next
        const mediumRiskResponse = await fetch('/data/landslide_medium.geojson');
        const mediumRiskData = await mediumRiskResponse.json();
        L.geoJSON(mediumRiskData, {
          style: () => ({
            color: 'none', // No border
            weight: 0,
            fillColor: '#FFFF00', // Yellow for medium risk
            fillOpacity: 0.6,
          }),
          onEachFeature: (feature, layer) => {
            // No tooltip or click handlers for background layers
          }
        }).addTo(riskZonesGroup);
        
        // Load high risk landslide zones next
        const highRiskResponse = await fetch('/data/landslide_high.geojson');
        const highRiskData = await highRiskResponse.json();
        L.geoJSON(highRiskData, {
          style: () => ({
            color: 'none', // No border
            weight: 0,
            fillColor: '#FFA500', // Orange for high risk
            fillOpacity: 0.6,
          }),
          onEachFeature: (feature, layer) => {
            // No tooltip or click handlers for background layers
          }
        }).addTo(riskZonesGroup);
        
        // Finally load the interactive deslizamento_alto data as the top layer
        const detailedResponse = await fetch('/data/deslizamento_alto.geojson');
        const detailedData = await detailedResponse.json();
        L.geoJSON(detailedData, {
          style: (feature) => {
            // Use deep purple for "Muito alto" risk and red for "Alto" risk
            const isMuitoAlto = feature?.properties?.risk_score?.includes('Muito alto');
            return {
              color: isMuitoAlto ? '#7E22CE' : '#DC2626', // Deep purple for "Muito alto", bright red for "Alto"
              weight: 2,
              opacity: 0.9,
              fillColor: isMuitoAlto ? '#7E22CE' : '#DC2626',
              fillOpacity: 0.4,
              dashArray: '2'
            };
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              // Get the risk class for styling
              const riskClass = 
                feature.properties.risk_score?.includes('Muito alto') ? 'risk-very-high' : 
                feature.properties.risk_score?.includes('Alto') ? 'risk-high' : 
                feature.properties.risk_score?.includes('Médio') ? 'risk-medium' : 'risk-low';
                
              // Create a simpler tooltip content for hover
              const tooltipContent = `
                <div class="marker-tooltip landslide-tooltip">
                  <strong>${feature.properties.neighbourhood}</strong>
                  <div class="risk-badge">Risco de Deslizamento: <span class="${riskClass}">${feature.properties.risk_score || 'ALTO'}</span></div>
                  <div class="tooltip-footer">Clique para ver mais detalhes</div>
                </div>
              `;
              
              // Bind tooltip to layer (for hover)
              layer.bindTooltip(tooltipContent, {
                direction: 'top',
                sticky: true,
                opacity: 0.9,
                className: 'risk-zone-tooltip'
              });

              // Add click handler to open the modal
              layer.on('click', () => {
                // Set the selected risk data
                setSelectedRiskData({
                  neighbourhood: feature.properties.neighbourhood,
                  description: feature.properties.description,
                  risk_level: feature.properties.risk_score || 'Alto',
                  observation: feature.properties.observation,
                  vulnerability_score: feature.properties.vulnerability_score,
                  risk_score: feature.properties.risk_score,
                  amount_buildings: feature.properties.amount_buildings,
                  number_of_people: feature.properties.number_of_people,
                  suggested_intervention: feature.properties.suggested_intervention,
                  datasource: feature.properties.datasource
                });
                
                // Open the modal
                setModalOpen(true);
              });
            }
          }
        }).addTo(riskZonesGroup);
        
      } catch (error) {
        console.error("Error loading GeoJSON data:", error);
      }
    };
    
    // Execute the async function to load layers in sequence
    loadBackgroundLayers();

    // Store the layer group reference
    setRiskZonesLayer(riskZonesGroup);

    return () => {
      if (riskZonesGroup) {
        map.removeLayer(riskZonesGroup);
      }
    };
  }, [map, isMapReady]);

  // Update map view when state changes
  useEffect(() => {
    if (map) {
      map.setView([state.mapView.center.lat, state.mapView.center.lng], state.mapView.zoom);
    }
  }, [map, state.mapView]);

  return (
    <>
      <div className="md:w-2/3 lg:w-3/4 relative order-1 md:order-2 h-[60vh] md:h-auto">
        <div id="map" className="w-full h-full bg-gray-200 relative">
          <MapControls map={map} />
          <MapLegend />
          {selectedItem.id !== null && <InfoPanel />}
        </div>
      </div>
      
      {/* Risk Detail Modal - rendered at the root level for proper z-index stacking */}
      {selectedRiskData && (
        <RiskDetailModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          data={selectedRiskData} 
        />
      )}
    </>
  );
};

export default MapView;
