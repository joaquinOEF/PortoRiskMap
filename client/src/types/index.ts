// Location coordinates
export interface LatLng {
  lat: number;
  lng: number;
}

// Risk levels
export type RiskLevel = "very-high" | "high" | "medium" | "low";

// Asset types
export type AssetType = "healthcare" | "financial" | "transportation" | "cultural" | "utility" | "education" | "other";

// Tab types
export type TabType = "neighborhoods" | "assets" | "history" | "actions";

// Neighborhood data type
export interface Neighborhood {
  id: number;
  name: string;
  floodRisk: RiskLevel;
  landslideRisk: RiskLevel;
  populationAtRisk: number;
  location: LatLng;
}

// Asset data type
export interface Asset {
  id: number;
  name: string;
  type: AssetType;
  floodRisk: RiskLevel;
  landslideRisk: RiskLevel;
  location: LatLng;
}

// Historical event data type
export interface HistoricalEvent {
  id: number;
  title: string;
  type: "flood" | "landslide";
  date: string;
  description: string;
  areasAffected: string[];
  location: LatLng;
}

// Filter state
export interface FilterState {
  showHigh: boolean;
  showMedium: boolean;
  showLow: boolean;
}

// Selected item state
export interface SelectedItem {
  type: "neighborhood" | "asset" | "event" | null;
  id: number | null;
}

// Map view state
export interface MapViewState {
  center: LatLng;
  zoom: number;
}

// Recommendation categories
export type RecommendationCategory = 
  | "Emergency Preparedness" 
  | "Infrastructure" 
  | "Policy" 
  | "Community Engagement" 
  | "Environmental";

// Recommendation priority (1-5)
export type PriorityLevel = 1 | 2 | 3 | 4 | 5;

// Recommendation data type
export interface Recommendation {
  id: number;
  title: string;
  category: RecommendationCategory;
  impactLevel: "High" | "Medium" | "Low";
  priority: PriorityLevel;
  neighborhoods: string[];
  description: string;
}

// App context state
export interface AppContextState {
  activeTab: TabType;
  filters: FilterState;
  selectedItem: SelectedItem;
  mapView: MapViewState;
}
