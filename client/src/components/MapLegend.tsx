import React from 'react';
import RiskIndicator from './RiskIndicator';

const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-0 left-0 z-10 m-4 bg-white shadow-lg rounded p-3 text-sm">
      <h4 className="font-medium mb-2">Risk Legend</h4>
      
      <div>
        <h5 className="text-xs font-medium mb-1">Map Elements</h5>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
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
          <div className="flex items-center">
            <span className="w-5 h-3 border border-[#E76F51] bg-[#E76F51] opacity-50 mr-2" style={{ borderStyle: 'dashed' }}></span>
            <span>Landslide Risk Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
