
import React from 'react';
import { AssetType } from '@/types';
import { HeartPulse, Building2, Car, Landmark, Zap, School, HelpCircle } from 'lucide-react';

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
  const iconProps = {
    size,
    color,
    className
  };

  switch (assetType) {
    case 'healthcare':
      return <HeartPulse {...iconProps} />;
    case 'financial':
      return <Building2 {...iconProps} />;
    case 'transportation':
      return <Car {...iconProps} />;
    case 'cultural':
      return <Landmark {...iconProps} />;
    case 'utility':
      return <Zap {...iconProps} />;
    case 'education':
      return <School {...iconProps} />;
    default:
      return <HelpCircle {...iconProps} />;
  }
};

export default AssetIcon;
