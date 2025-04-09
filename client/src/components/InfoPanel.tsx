import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { fetchCriticalAssets } from '@/lib/osmService';
import { getRiskColor } from '@/lib/mapUtils';
import { Asset } from '@/types';
import RiskIndicator from './RiskIndicator';
import AssetIcon from './AssetIcon';
import { X } from 'lucide-react';

const InfoPanel: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { selectedItem } = state;
  const [osmAssets, setOsmAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Load OpenStreetMap assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        const assets = await fetchCriticalAssets();
        setOsmAssets(assets);
      } catch (err) {
        console.error('Error loading assets for InfoPanel:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadAssets();
  }, []);
  
  const closePanel = () => {
    dispatch({ type: "CLEAR_SELECTION" });
  };
  
  if (!selectedItem.id || selectedItem.type !== 'asset') {
    return null;
  }
  
  let content;
  
  if (loading) {
    content = (
      <div className="animate-pulse p-2">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  } else {
    const asset = osmAssets.find(a => a.id === selectedItem.id);
    if (!asset) return null;
    
    // Calculate combined risk level for display
    const getCombinedRiskLabel = (asset: Asset): string => {
      const floodValue = asset.floodRisk === 'high' ? 3 : asset.floodRisk === 'medium' ? 2 : 1;
      const landslideValue = asset.landslideRisk === 'high' ? 3 : asset.landslideRisk === 'medium' ? 2 : 1;
      const combinedScore = floodValue + landslideValue;
      
      if (combinedScore >= 6) return 'Critical Risk';
      if (combinedScore >= 5) return 'Severe Risk';
      if (combinedScore >= 4) return 'High Risk';
      if (combinedScore >= 3) return 'Moderate Risk';
      return 'Low Risk';
    };
    
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
          <div className="mb-1 flex items-center">
            <span className="font-medium mr-1">Type:</span> 
            <AssetIcon 
              assetType={asset.type} 
              color={getRiskColor(asset.landslideRisk)} 
              size={16}
              className="mr-1"
            />
            <span className="capitalize">{asset.type}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">{getCombinedRiskLabel(asset)}</span>
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
  }
  
  return (
    <div className="absolute top-4 left-4 bg-white shadow-lg rounded p-3 max-w-xs z-10">
      {content}
    </div>
  );
};

export default InfoPanel;
