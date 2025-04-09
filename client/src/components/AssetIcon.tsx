import React from 'react';
import { AssetType } from '@/types';
import { getAssetIconSVG } from '@/lib/mapUtils';

interface AssetIconProps {
  assetType: AssetType;
  className?: string;
  color?: string;
  size?: number;
}

const AssetIcon: React.FC<AssetIconProps> = ({ 
  assetType, 
  className = '', 
  color = "currentColor",
  size = 16 
}) => {
  const iconPaths = getAssetIconSVG(assetType);
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {iconPaths && <g dangerouslySetInnerHTML={{ __html: iconPaths }} />}
      </svg>
    </div>
  );
};

export default AssetIcon;