import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { neighborhoods, assets, historicalEvents, getRiskColor } from '@/lib/mockData';
import { useAppContext } from '@/contexts/AppContext';
import MapControls from './MapControls';
import MapLegend from './MapLegend';
import InfoPanel from './InfoPanel';

const MapView: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { filters, selectedItem } = state;
  const [map, setMap] = useState<L.Map | null>(null);
  const [markersLayer, setMarkersLayer] = useState<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mapInstance = L.map('map', {
        center: [state.mapView.center.lat, state.mapView.center.lng],
        zoom: state.mapView.zoom,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      const newMarkersLayer = L.layerGroup().addTo(mapInstance);
      
      setMap(mapInstance);
      setMarkersLayer(newMarkersLayer);

      return () => {
        mapInstance.remove();
      };
    }
  }, []);

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
          const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color:${color}; width:14px; height:14px; transform:rotate(45deg); border:2px solid white;"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          
          const marker = L.marker([a.location.lat, a.location.lng], { icon }).addTo(markersLayer!);
          
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
