import React, { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { getAssetTypeLabel, getRiskColor } from "@/lib/mockData";
import { fetchCriticalAssets } from "@/lib/osmService";
import { Asset, RiskLevel } from "@/types";
import RiskIndicator from "./RiskIndicator";
import AssetIcon from "./AssetIcon";

const AssetsTab: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { filters } = state;
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch assets from OpenStreetMap on component mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        const osmAssets = await fetchCriticalAssets();
        setAssets(osmAssets);
        setError(null);
      } catch (err) {
        console.error('Error loading critical assets:', err);
        setError('Failed to load critical assets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAssets();
  }, []);
  
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
    // Risk level priority: very-high (4) > high (3) > medium (2) > low (1)
    const riskLevelValue = (risk: RiskLevel): number => {
      if (risk === 'very-high') return 4;
      if (risk === 'high') return 3;
      if (risk === 'medium') return 2;
      return 1;
    };
    
    // Sort primarily by landslide risk since we're focusing on landslide data
    const aLandslideValue = riskLevelValue(a.landslideRisk);
    const bLandslideValue = riskLevelValue(b.landslideRisk);
    
    if (aLandslideValue !== bLandslideValue) {
      return bLandslideValue - aLandslideValue; // Descending order
    }
    
    // If landslide risks are equal, sort by flood risk
    return riskLevelValue(b.floodRisk) - riskLevelValue(a.floodRisk);
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
  
  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">Critical Assets at Risk</h3>
          <span className="text-sm text-neutral-700">Loading...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-16 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">Critical Assets at Risk</h3>
        </div>
        <div className="bg-white rounded shadow-sm p-4 mb-3 text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-primary text-white px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
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
            borderLeftColor: asset.landslideRisk === 'high' ? '#E76F51' : 
                            asset.landslideRisk === 'medium' ? '#F4A261' : '#2A9D8F' 
          }}
        >
          <div className="flex justify-between">
            <h4 className="font-medium">{asset.name}</h4>
            <div className="flex items-center text-xs bg-primary text-white px-2 py-0.5 rounded-full">
              <AssetIcon 
                assetType={asset.type} 
                color="white" 
                size={12}
                className="mr-1"
              />
              {getAssetTypeLabel(asset.type)}
            </div>
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
