import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { neighborhoods } from "@/lib/mockData";
import RiskIndicator from "./RiskIndicator";

const NeighborhoodsTab: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { filters } = state;
  
  // Filter neighborhoods based on current filters
  const filteredNeighborhoods = neighborhoods.filter(n => {
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
  // Sort by risk level (high to low)
  .sort((a, b) => {
    // Risk level priority: high (3) > medium (2) > low (1)
    const riskLevelValue = (risk: 'high' | 'medium' | 'low') => {
      if (risk === 'high') return 3;
      if (risk === 'medium') return 2;
      return 1;
    };
    
    // First sort by flood risk
    const aFloodValue = riskLevelValue(a.floodRisk);
    const bFloodValue = riskLevelValue(b.floodRisk);
    
    if (aFloodValue !== bFloodValue) {
      return bFloodValue - aFloodValue; // Descending order
    }
    
    // If flood risks are equal, sort by landslide risk
    return riskLevelValue(b.landslideRisk) - riskLevelValue(a.landslideRisk);
  });
  
  const handleNeighborhoodClick = (id: number) => {
    const neighborhood = neighborhoods.find(n => n.id === id);
    if (neighborhood) {
      dispatch({
        type: "SELECT_ITEM",
        payload: { type: "neighborhood", id }
      });
      
      dispatch({
        type: "SET_MAP_VIEW",
        payload: { 
          center: neighborhood.location,
          zoom: 14
        }
      });
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Neighborhoods at Risk</h3>
        <span className="text-sm text-neutral-700">{filteredNeighborhoods.length} neighborhoods</span>
      </div>
      
      {filteredNeighborhoods.map(neighborhood => (
        <div 
          key={neighborhood.id}
          className={`bg-white rounded shadow-sm p-3 mb-3 border-l-4 border-[${
            neighborhood.floodRisk === 'high' ? '#E76F51' : 
            neighborhood.floodRisk === 'medium' ? '#F4A261' : '#2A9D8F'
          }] hover:shadow-md transition duration-200 cursor-pointer`}
          onClick={() => handleNeighborhoodClick(neighborhood.id)}
          style={{ 
            borderLeftColor: neighborhood.floodRisk === 'high' ? '#E76F51' : 
                            neighborhood.floodRisk === 'medium' ? '#F4A261' : '#2A9D8F' 
          }}
        >
          <div className="flex justify-between">
            <h4 className="font-medium">{neighborhood.name}</h4>
            <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">
              {neighborhood.populationAtRisk.toLocaleString()} at risk
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-xs text-neutral-700">Flood Risk:</span>
              <div className="flex items-center">
                <RiskIndicator risk={neighborhood.floodRisk} />
                <span className="capitalize">{neighborhood.floodRisk}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-neutral-700">Landslide Risk:</span>
              <div className="flex items-center">
                <RiskIndicator risk={neighborhood.landslideRisk} />
                <span className="capitalize">{neighborhood.landslideRisk}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {filteredNeighborhoods.length === 0 && (
        <div className="bg-white rounded shadow-sm p-3 mb-3 text-center text-gray-500">
          No neighborhoods match the current filters. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};

export default NeighborhoodsTab;
