import React, { useState } from 'react';
import RiskIndicator from './RiskIndicator';

const MapLegend: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[1000] bg-white shadow-lg rounded p-3 text-xs max-h-[80vh] overflow-y-auto max-w-[200px]">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Risk Legend</h4>
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-xs p-1 hover:bg-gray-100 rounded"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      {expanded ? (
        <>
          <div className="mb-2">
            <h5 className="text-xs font-medium mb-1">Map Elements</h5>
            <div className="grid grid-cols-1 gap-y-1">
              <div className="flex items-center">
                <span className="w-3 h-3 border-2 border-white bg-gray-800 transform rotate-45 mr-2"></span>
                <span>Critical Asset</span>
              </div>
            </div>
          </div>
          
          <div className="mb-2">
            <h5 className="text-xs font-medium mb-1">Asset Risk Classification</h5>
            <div className="grid grid-cols-1 gap-y-1">
              <div className="flex items-center">
                <span className="w-5 h-3 bg-[#7E22CE] mr-2"></span>
                <span>Critical Risk</span>
              </div>
              <div className="flex items-center">
                <span className="w-5 h-3 bg-[#E76F51] mr-2"></span>
                <span>Severe Risk</span>
              </div>
              <div className="flex items-center">
                <span className="w-5 h-3 bg-[#F4A261] mr-2"></span>
                <span>High Risk</span>
              </div>
              <div className="flex items-center">
                <span className="w-5 h-3 bg-[#2A9D8F] mr-2"></span>
                <span>Moderate/Low Risk</span>
              </div>
            </div>
          </div>
          
          <div className="mb-2">
            <h5 className="text-xs font-medium mb-1">Landslide Risk Zones</h5>
            <div className="grid grid-cols-1 gap-y-1">
              <div className="flex items-center">
                <span className="w-5 h-3 bg-[#FFA500] opacity-60 mr-2"></span>
                <span>High Landslide Risk</span>
              </div>
              <div className="flex items-center">
                <span className="w-5 h-3 bg-[#FFFF00] opacity-60 mr-2"></span>
                <span>Medium Landslide Risk</span>
              </div>
              <div className="flex items-center">
                <span className="w-5 h-3 bg-[#FFFFCC] opacity-60 mr-2"></span>
                <span>Low Landslide Risk</span>
              </div>
              <div className="flex items-center">
                <span className="w-5 h-3 border border-[#7E22CE] bg-[#7E22CE] opacity-70 mr-2" style={{ borderStyle: 'dashed' }}></span>
                <span>Very High Risk (Muito alto)</span>
              </div>
              <div className="flex items-center">
                <span className="w-5 h-3 border border-[#DC2626] bg-[#DC2626] opacity-70 mr-2" style={{ borderStyle: 'dashed' }}></span>
                <span>High Risk (Alto)</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-xs font-medium mb-1">Flood Risk Zones</h5>
            <div className="grid grid-cols-1 gap-y-1">
              <div className="flex items-center">
                <span className="w-5 h-3 bg-[#000080] opacity-50 mr-2"></span>
                <span>High Flood Risk</span>
              </div>
              <div className="flex items-center">
                <span className="w-5 h-3 bg-[#1E90FF] opacity-50 mr-2"></span>
                <span>Medium Flood Risk</span>
              </div>
              <div className="flex items-center">
                <span className="w-5 h-3 bg-[#ADD8E6] opacity-50 mr-2"></span>
                <span>Low Flood Risk</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-[#FFA500] opacity-60 mr-1"></span>
            <span>Landslide</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-[#1E90FF] opacity-50 mr-1"></span>
            <span>Flood</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLegend;
