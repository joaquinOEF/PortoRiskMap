import { RiskLevel, AssetType } from '@/types';

// Helper function to get color based on risk level
export const getRiskColor = (risk: RiskLevel): string => {
  switch (risk) {
    case 'very-high':
      return '#7E22CE'; // Deep purple
    case 'high':
      return '#E76F51'; // Orange-red
    case 'medium':
      return '#F4A261'; // Orange
    case 'low':
    default:
      return '#2A9D8F'; // Teal
  }
};

// Helper function to get SVG path data for asset icons
export const getAssetIconSVG = (type: AssetType): string => {
  switch (type) {
    case 'healthcare':
      return `<path d="M8 16h8M12 8v8M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" />`;
    case 'financial':
      return `<path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4M12 9v6M9 12h6" />`;
    case 'transportation':
      return `<path d="M8 6v12M16 6v12M3 6h18M3 18h18M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6M4 10h16" />`;
    case 'cultural':
      return `<path d="M2 3h20M12 7v14M17 14l-5-5-5 5M2 21h20" />`;
    case 'utility':
      return `<path d="M18 8v9m-9-9H4v9h5m4-9v9m5 0H8m5-9V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2h14" />`;
    case 'education':
      return `<path d="M12 20v-6M9 14l3-3 3 3M12 7A7 7 0 1 0 12 21a7 7 0 0 0 0-14" />`;
    case 'other':
    default:
      return `<path d="M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0M12 8V12M12 16h.01" />`;
  }
};