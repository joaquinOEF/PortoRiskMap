import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { assets, getAssetTypeLabel } from "@/lib/mockData";
import RiskIndicator from "./RiskIndicator";

const AssetsTab: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { filters } = state;
  
  // Filter assets based on current filters
  const filteredAssets = assets.filter(a => {
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
  
  const handleAssetClick = (id: number) => {
    const asset = assets.find(a => a.id === id);
    if (asset) {
      dispatch({
        type: "SELECT_ITEM",
        payload: { type: "asset", id }
      });
      
      dispatch({
        type: "SET_MAP_VIEW",
        payload: { 
          center: asset.location,
          zoom: 15
        }
      });
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Critical Assets at Risk</h3>
        <span className="text-sm text-neutral-700">{filteredAssets.length} assets</span>
      </div>
      
      {filteredAssets.map(asset => (
        <div 
          key={asset.id}
          className={`bg-white rounded shadow-sm p-3 mb-3 border-l-4 hover:shadow-md transition duration-200 cursor-pointer`}
          onClick={() => handleAssetClick(asset.id)}
          style={{ 
            borderLeftColor: asset.floodRisk === 'high' ? '#E76F51' : 
                            asset.floodRisk === 'medium' ? '#F4A261' : '#2A9D8F' 
          }}
        >
          <div className="flex justify-between">
            <h4 className="font-medium">{asset.name}</h4>
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
              {getAssetTypeLabel(asset.type)}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-xs text-neutral-700">Flood Risk:</span>
              <div className="flex items-center">
                <RiskIndicator risk={asset.floodRisk} />
                <span className="capitalize">{asset.floodRisk}</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-neutral-700">Landslide Risk:</span>
              <div className="flex items-center">
                <RiskIndicator risk={asset.landslideRisk} />
                <span className="capitalize">{asset.landslideRisk}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {filteredAssets.length === 0 && (
        <div className="bg-white rounded shadow-sm p-3 mb-3 text-center text-gray-500">
          No assets match the current filters. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};

export default AssetsTab;
