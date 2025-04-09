import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Plus, Minus, Home, Layers } from 'lucide-react';

interface MapControlsProps {
  map: L.Map | null;
}

const MapControls: React.FC<MapControlsProps> = ({ map }) => {
  const { dispatch } = useAppContext();
  
  const handleZoomIn = () => {
    if (map) {
      map.zoomIn();
    }
  };
  
  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
  };
  
  const handleResetView = () => {
    dispatch({
      type: "SET_MAP_VIEW",
      payload: {
        center: { lat: -30.0346, lng: -51.2177 },
        zoom: 12
      }
    });
  };
  
  return (
    <div className="absolute top-0 right-0 z-10 m-4 bg-white shadow-lg rounded p-2">
      <div className="flex flex-col space-y-2">
        <button 
          className="hover:bg-gray-100 p-2 rounded" 
          title="Zoom In"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button 
          className="hover:bg-gray-100 p-2 rounded" 
          title="Zoom Out"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="border-t border-gray-200 my-1"></div>
        <button 
          className="hover:bg-gray-100 p-2 rounded" 
          title="Reset View"
          onClick={handleResetView}
        >
          <Home className="h-4 w-4" />
        </button>
        <button 
          className="hover:bg-gray-100 p-2 rounded" 
          title="Toggle Layers"
        >
          <Layers className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MapControls;
