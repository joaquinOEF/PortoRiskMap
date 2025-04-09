import React from 'react';
import RiskIndicator from './RiskIndicator';

const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 z-10 m-4 bg-white shadow-lg rounded p-3 text-sm max-h-[80vh] overflow-y-auto">
      <h4 className="font-medium mb-2">Risk Legend</h4>
      
      <div className="mb-3">
        <h5 className="text-xs font-medium mb-1">Map Elements</h5>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center">
            <RiskIndicator risk="very-high" />
            <span>Very High Risk</span>
          </div>
          <div className="flex items-center">
            <RiskIndicator risk="high" />
            <span>High Risk</span>
          </div>
          <div className="flex items-center">
            <RiskIndicator risk="medium" />
            <span>Medium Risk</span>
          </div>
          <div className="flex items-center">
            <RiskIndicator risk="low" />
            <span>Low Risk</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 border-2 border-white bg-gray-800 rounded-full mr-2"></span>
            <span>Neighborhood</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 border-2 border-white bg-gray-800 transform rotate-45 mr-2"></span>
            <span>Critical Asset</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 border-2 border-white bg-[#F4A261] rounded-full mr-2"></span>
            <span>Past Event</span>
          </div>
        </div>
      </div>
      
      <div className="mb-3">
        <h5 className="text-xs font-medium mb-1">Landslide Risk Zones</h5>
        <div className="grid grid-cols-1 gap-x-4 gap-y-1">
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
        <div className="grid grid-cols-1 gap-x-4 gap-y-1">
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
    </div>
  );
};

export default MapLegend;
