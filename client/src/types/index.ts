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
export type TabType = "neighborhoods" | "assets";

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


// Filter state
export interface FilterState {
  showHigh: boolean;
  showMedium: boolean;
  showLow: boolean;
  showFloodRisk: boolean;
  showLandslideRisk: boolean;
}

// Selected item state
export interface SelectedItem {
  type: "neighborhood" | "asset" | null;
  id: number | null;
}

// Map view state
export interface MapViewState {
  center: LatLng;
  zoom: number;
}

// App context state
export interface AppContextState {
  activeTab: TabType;
  filters: FilterState;
  selectedItem: SelectedItem;
  mapView: MapViewState;
}
