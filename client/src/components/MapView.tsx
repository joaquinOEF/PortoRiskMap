import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchCriticalAssets } from '@/lib/osmService';
import { useAppContext } from '@/contexts/AppContext';
import { Asset } from '@/types';
import { getRiskColor, getAssetIconSVG } from '@/lib/mapUtils';
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
    if (map && markersLayer && assets.length > 0) {
      markersLayer.clearLayers();
      
      // Filter assets based on the selected asset risk types 
      const filteredAssets = assets.filter(asset => {
        // Check hazard type filters - we only show medium and high risk assets
        const floodVisible = filters.showFloodRisk && 
          (asset.floodRisk === 'high' || asset.floodRisk === 'medium');
          
        const landslideVisible = filters.showLandslideRisk && 
          (asset.landslideRisk === 'high' || asset.landslideRisk === 'medium');
        
        // Asset passes if it meets at least one of the selected hazard type filters
        return floodVisible || landslideVisible;
      });
      
      // Add filtered assets to the map
      filteredAssets.forEach(asset => {
        // Determine color based on the highest risk level
        const color = getRiskColor(
          asset.floodRisk === 'high' || asset.landslideRisk === 'high' 
            ? 'high' 
            : asset.floodRisk === 'medium' || asset.landslideRisk === 'medium'
              ? 'medium'
              : 'low'
        );
        
        // Get the appropriate SVG paths for the asset type
        const svgPaths = getAssetIconSVG(asset.type);
        
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
        
        // Create marker and add to map
        const marker = L.marker([asset.location.lat, asset.location.lng], { icon }).addTo(markersLayer!);
        
        // Calculate combined risk level for display
        const getCombinedRiskLabel = (asset: Asset): string => {
          const floodValue = asset.floodRisk === 'high' ? 3 : asset.floodRisk === 'medium' ? 2 : 1;
          const landslideValue = asset.landslideRisk === 'high' ? 3 : asset.landslideRisk === 'medium' ? 2 : 1;
          const combinedScore = floodValue + landslideValue;
          
          if (combinedScore >= 6) return 'Critical Risk';
          if (combinedScore >= 5) return 'Severe Risk';
          if (combinedScore >= 4) return 'High Risk';
          if (combinedScore >= 3) return 'Moderate Risk';
          return 'Low Risk';
        };
        
        // Create tooltip content for assets
        const tooltipContent = `
          <div class="marker-tooltip">
            <strong>${asset.name}</strong>
            <div>Type: <span class="capitalize">${asset.type}</span></div>
            <div class="font-semibold">${getCombinedRiskLabel(asset)}</div>
            <div class="tooltip-risks">
              <span>Flood: <span class="capitalize" style="color: ${getRiskColor(asset.floodRisk)}">${asset.floodRisk}</span></span>
              <span>Landslide: <span class="capitalize" style="color: ${getRiskColor(asset.landslideRisk)}">${asset.landslideRisk}</span></span>
            </div>
          </div>
        `;
        
        // Add tooltip to marker
        marker.bindTooltip(tooltipContent, { 
          direction: 'top',
          offset: L.point(0, -8)
        });
        
        // Add click handler to select this asset
        marker.on('click', () => {
          dispatch({
            type: 'SELECT_ITEM',
            payload: { type: 'asset', id: asset.id }
          });
        });
      });
    }
  }, [map, markersLayer, filters, dispatch, assets]);

  // Load and display GeoJSON risk zones
  useEffect(() => {
    if (!map || !isMapReady) return;

    // Create a layer group to hold all risk zone layers
    const riskZonesGroup = L.layerGroup().addTo(map);

    // First load all the background risk zones (non-interactive)
    const loadBackgroundLayers = async () => {
      try {
        console.log("Loading GeoJSON risk zone data...");
        
        // Load landslide risk zones first (bottom layer)
        // --------- Low risk landslide zones ---------
        const landslideRiskLowResponse = await fetch('/data/landslide_low.geojson');
        const landslideRiskLowData = await landslideRiskLowResponse.json();
        console.log("Loaded", landslideRiskLowData.features.length, "low risk landslide zones");
        L.geoJSON(landslideRiskLowData, {
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
        
        // --------- Medium risk landslide zones ---------
        const landslideRiskMediumResponse = await fetch('/data/landslide_medium.geojson');
        const landslideRiskMediumData = await landslideRiskMediumResponse.json();
        console.log("Loaded", landslideRiskMediumData.features.length, "medium risk landslide zones");
        L.geoJSON(landslideRiskMediumData, {
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
        
        // --------- High risk landslide zones ---------
        const landslideRiskHighResponse = await fetch('/data/landslide_high.geojson');
        const landslideRiskHighData = await landslideRiskHighResponse.json();
        console.log("Loaded", landslideRiskHighData.features.length, "high risk landslide zones");
        L.geoJSON(landslideRiskHighData, {
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
        
        // Now load the flood risk zones on top of landslide zones
        // --------- Low risk flood zones ---------
        const floodRiskLowResponse = await fetch('/data/flooding_low.geojson');
        const floodRiskLowData = await floodRiskLowResponse.json();
        console.log("Loaded", floodRiskLowData.features.length, "low risk flood zones");
        L.geoJSON(floodRiskLowData, {
          style: () => ({
            color: 'none', // No border
            weight: 0,
            fillColor: '#ADD8E6', // Light blue for low risk
            fillOpacity: 0.5,
          }),
          onEachFeature: (feature, layer) => {
            // No tooltip or click handlers for background layers
          }
        }).addTo(riskZonesGroup);
        
        // --------- Medium risk flood zones ---------
        const floodRiskMediumResponse = await fetch('/data/flooding_medium.geojson');
        const floodRiskMediumData = await floodRiskMediumResponse.json();
        console.log("Loaded", floodRiskMediumData.features.length, "medium risk flood zones");
        L.geoJSON(floodRiskMediumData, {
          style: () => ({
            color: 'none', // No border
            weight: 0,
            fillColor: '#1E90FF', // Blue for medium risk
            fillOpacity: 0.5,
          }),
          onEachFeature: (feature, layer) => {
            // No tooltip or click handlers for background layers
          }
        }).addTo(riskZonesGroup);
        
        // --------- High risk flood zones ---------
        const floodRiskHighResponse = await fetch('/data/flooding_high.geojson');
        const floodRiskHighData = await floodRiskHighResponse.json();
        console.log("Loaded", floodRiskHighData.features.length, "high risk flood zones");
        L.geoJSON(floodRiskHighData, {
          style: () => ({
            color: 'none', // No border
            weight: 0,
            fillColor: '#000080', // Dark blue for high risk
            fillOpacity: 0.5,
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
          {selectedItem.id !== null && <InfoPanel />}
        </div>
        {/* Position MapLegend as a direct child of the container div for better positioning */}
        <MapLegend />
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
