import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { neighborhoods, assets, historicalEvents } from '@/lib/mockData';
import RiskIndicator from './RiskIndicator';
import { X } from 'lucide-react';

const InfoPanel: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { selectedItem } = state;
  
  const closePanel = () => {
    dispatch({ type: "CLEAR_SELECTION" });
  };
  
  if (!selectedItem.id || !selectedItem.type) {
    return null;
  }
  
  let content;
  
  if (selectedItem.type === 'neighborhood') {
    const neighborhood = neighborhoods.find(n => n.id === selectedItem.id);
    if (!neighborhood) return null;
    
    content = (
      <>
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{neighborhood.name}</h3>
          <button 
            className="text-gray-600 hover:text-red-500"
            onClick={closePanel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 text-sm">
          <div className="mb-1">
            <span className="font-medium">Population at risk:</span> {neighborhood.populationAtRisk.toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs">Flood Risk:</span>
              <div className="flex items-center">
                <RiskIndicator risk={neighborhood.floodRisk} />
                <span className="capitalize">{neighborhood.floodRisk}</span>
              </div>
            </div>
            <div>
              <span className="text-xs">Landslide Risk:</span>
              <div className="flex items-center">
                <RiskIndicator risk={neighborhood.landslideRisk} />
                <span className="capitalize">{neighborhood.landslideRisk}</span>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <button className="text-secondary text-xs hover:underline">View detailed report</button>
          </div>
        </div>
      </>
    );
  } else if (selectedItem.type === 'asset') {
    const asset = assets.find(a => a.id === selectedItem.id);
    if (!asset) return null;
    
    content = (
      <>
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{asset.name}</h3>
          <button 
            className="text-gray-600 hover:text-red-500"
            onClick={closePanel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 text-sm">
          <div className="mb-1">
            <span className="font-medium">Type:</span> <span className="capitalize">{asset.type}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs">Flood Risk:</span>
              <div className="flex items-center">
                <RiskIndicator risk={asset.floodRisk} />
                <span className="capitalize">{asset.floodRisk}</span>
              </div>
            </div>
            <div>
              <span className="text-xs">Landslide Risk:</span>
              <div className="flex items-center">
                <RiskIndicator risk={asset.landslideRisk} />
                <span className="capitalize">{asset.landslideRisk}</span>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <button className="text-secondary text-xs hover:underline">View asset details</button>
          </div>
        </div>
      </>
    );
  } else if (selectedItem.type === 'event') {
    const event = historicalEvents.find(e => e.id === selectedItem.id);
    if (!event) return null;
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    content = (
      <>
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{event.title}</h3>
          <button 
            className="text-gray-600 hover:text-red-500"
            onClick={closePanel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 text-sm">
          <div className="mb-1">
            <span className="font-medium">Date:</span> {formatDate(event.date)}
          </div>
          <div className="mb-1">
            <span className="font-medium">Type:</span> <span className="capitalize">{event.type}</span>
          </div>
          <p className="text-xs mb-1">{event.description}</p>
          <div>
            <span className="font-medium text-xs">Areas affected:</span> <span className="text-xs">{event.areasAffected.join(', ')}</span>
          </div>
          <div className="mt-2">
            <button className="text-secondary text-xs hover:underline">View event details</button>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <div className="absolute top-4 left-4 bg-white shadow-lg rounded p-3 max-w-xs z-10">
      {content}
    </div>
  );
};

export default InfoPanel;
