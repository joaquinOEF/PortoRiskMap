import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { neighborhoods, assets, historicalEvents, getRiskColor, getAssetIconSVG } from '@/lib/mockData';
import { useAppContext } from '@/contexts/AppContext';
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import InfoPanel from './InfoPanel';

const MapView: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { filters, selectedItem } = state;
  const [map, setMap] = useState<L.Map | null>(null);
  const [markersLayer, setMarkersLayer] = useState<L.LayerGroup | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

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

  // Add grid overlay when map is ready
  useEffect(() => {
    if (!map || !isMapReady) return;
    
    // Create grid overlay for risk visualization
    const gridLayer = L.layerGroup().addTo(map);
    
    // Center area around Porto Alegre
    const centerLat = -30.0346;
    const centerLng = -51.2177;
    
    // Create a grid of cells
    const cellSize = 0.01; // roughly 1km
    const gridWidth = 25;
    const gridHeight = 25;
    
    for (let i = 0; i < gridWidth; i++) {
      for (let j = 0; j < gridHeight; j++) {
        const cellLat = centerLat - (gridHeight/2 * cellSize) + (j * cellSize);
        const cellLng = centerLng - (gridWidth/2 * cellSize) + (i * cellSize);
        
        // Generate a risk value for each cell (mock data)
        // This creates a pattern with higher risk closer to the river
        const distanceFromCenter = Math.sqrt(
          Math.pow(cellLat - centerLat, 2) + 
          Math.pow(cellLng - centerLng, 2)
        );
        
        // Generate pattern of risk (mock data)
        const isRiverArea = (i > 10 && i < 15) || (j > 10 && j < 15); // "river" area
        const floodRiskFactor = isRiverArea ? 0.9 : Math.max(0, 1 - distanceFromCenter * 10);
        
        // Create risk overlay color
        const getOverlayColor = (risk: number) => {
          if (risk > 0.7) return 'rgba(231, 111, 81, 0.5)'; // high - red
          if (risk > 0.4) return 'rgba(244, 162, 97, 0.3)'; // medium - orange
          return 'rgba(42, 157, 143, 0.2)'; // low - green
        };
        
        // Create rectangle for the cell
        const rectBounds = [
          [cellLat, cellLng],
          [cellLat + cellSize, cellLng + cellSize]
        ];
        
        L.rectangle(rectBounds as L.LatLngBoundsExpression, {
          color: 'transparent',
          fillColor: getOverlayColor(floodRiskFactor),
          fillOpacity: 0.6,
          weight: 0
        }).addTo(gridLayer);
      }
    }
    
    return () => {
      map.removeLayer(gridLayer);
    };
  }, [map, isMapReady]);

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
  }, [map, markersLayer, filters, dispatch]);

  // Update map view when state changes
  useEffect(() => {
    if (map) {
      map.setView([state.mapView.center.lat, state.mapView.center.lng], state.mapView.zoom);
    }
  }, [map, state.mapView]);

  return (
    <div className="md:w-2/3 lg:w-3/4 relative order-1 md:order-2 h-[60vh] md:h-auto">
      <div id="map" className="w-full h-full bg-gray-200 relative">
        <MapControls map={map} />
        <MapLegend />
        {selectedItem.id !== null && <InfoPanel />}
      </div>
    </div>
  );
};

export default MapView;
