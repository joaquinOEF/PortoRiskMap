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
  // Sort by combined risk level (high to low)
  .sort((a, b) => {
    // Risk level priority: very-high (4) > high (3) > medium (2) > low (1)
    const riskLevelValue = (risk: RiskLevel): number => {
      if (risk === 'very-high') return 4;
      if (risk === 'high') return 3;
      if (risk === 'medium') return 2;
      return 1;
    };
    
    // Calculate combined risk score (max 6 points)
    // - Both hazards high = 6
    // - One high, one medium = 5
    // - Both medium or one high, one low = 4/3
    // - One medium, one low = 3
    // - Both low = 2
    const getCombinedScore = (asset: Asset): number => {
      return riskLevelValue(asset.landslideRisk) + riskLevelValue(asset.floodRisk);
    };
    
    const aScore = getCombinedScore(a);
    const bScore = getCombinedScore(b);
    
    if (aScore !== bScore) {
      return bScore - aScore; // Descending order by total risk
    }
    
    // If combined scores are equal, prioritize by asset type
    // Healthcare and utilities are most critical
    const getAssetTypePriority = (type: string): number => {
      if (type === 'healthcare') return 5;
      if (type === 'utility') return 4;
      if (type === 'transportation') return 3;
      if (type === 'education') return 2;
      if (type === 'cultural') return 1;
      return 0;
    };
    
    return getAssetTypePriority(b.type) - getAssetTypePriority(a.type);
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
      
      {filteredAssets.map(asset => {
        // Calculate the combined risk level to determine the card's visual appearance
        const riskLevelValue = (risk: RiskLevel): number => {
          if (risk === 'very-high') return 4;
          if (risk === 'high') return 3;
          if (risk === 'medium') return 2;
          return 1;
        };
        const combinedRiskScore = riskLevelValue(asset.landslideRisk) + riskLevelValue(asset.floodRisk);
        
        // Determine border color based on combined risk
        // Maximum possible score is 6 (high + high)
        let borderColor, bgColor;
        if (combinedRiskScore >= 6) {
          // Both high - critical risk
          borderColor = '#7E22CE'; // Deep purple for critical combined risk
          bgColor = 'bg-purple-50';
        } else if (combinedRiskScore >= 5) {
          // One high, one medium - severe risk
          borderColor = '#DC2626'; // Red for severe combined risk
          bgColor = 'bg-red-50';
        } else if (combinedRiskScore >= 4) {
          // Both medium or one high, one low - high risk
          borderColor = '#E76F51'; // Orange for high combined risk
          bgColor = 'bg-orange-50';
        } else if (combinedRiskScore >= 3) {
          // One medium, one low - moderate risk
          borderColor = '#F4A261'; // Light orange for moderate risk
          bgColor = 'bg-amber-50';
        } else {
          // Both low - low risk
          borderColor = '#2A9D8F'; // Teal for low risk
          bgColor = 'bg-teal-50'; 
        }
        
        // Get risk rating badge text
        let riskRating;
        if (combinedRiskScore >= 6) riskRating = 'Critical Risk';
        else if (combinedRiskScore >= 5) riskRating = 'Severe Risk';
        else if (combinedRiskScore >= 4) riskRating = 'High Risk';
        else if (combinedRiskScore >= 3) riskRating = 'Moderate Risk';
        else riskRating = 'Low Risk';
        
        return (
          <div 
            key={asset.id}
            className={`rounded shadow-sm p-3 mb-3 border-l-4 hover:shadow-md transition duration-200 cursor-pointer ${bgColor}`}
            onClick={() => handleAssetClick(asset.id)}
            style={{ borderLeftColor: borderColor }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{asset.name}</h4>
                <div className="text-xs mt-1" style={{ color: borderColor }}>
                  {riskRating}
                </div>
              </div>
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
        );
      })}
      
      {filteredAssets.length === 0 && (
        <div className="bg-white rounded shadow-sm p-3 mb-3 text-center text-gray-500">
          No assets match the current filters. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};

export default AssetsTab;
