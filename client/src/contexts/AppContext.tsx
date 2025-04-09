import React, { createContext, useContext, useState, useReducer } from "react";
import { 
  AppContextState, 
  FilterState, 
  SelectedItem, 
  MapViewState, 
  TabType 
} from "@/types";

// Define the initial state
const initialState: AppContextState = {
  activeTab: "assets",
  filters: {
    showHigh: true,
    showMedium: true,
    showLow: true,
    showFloodRisk: true,
    showLandslideRisk: true
  },
  selectedItem: {
    type: null,
    id: null
  },
  mapView: {
    center: { lat: -30.0346, lng: -51.2177 },
    zoom: 12
  }
};

// Define action types
type AppAction = 
  | { type: "SET_ACTIVE_TAB"; payload: TabType }
  | { type: "SET_FILTER"; payload: Partial<FilterState> }
  | { type: "RESET_FILTERS" }
  | { type: "SELECT_ITEM"; payload: SelectedItem }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_MAP_VIEW"; payload: Partial<MapViewState> };

// Define reducer function
function appReducer(state: AppContextState, action: AppAction): AppContextState {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_FILTER":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "RESET_FILTERS":
      return { ...state, filters: initialState.filters };
    case "SELECT_ITEM":
      return { ...state, selectedItem: action.payload };
    case "CLEAR_SELECTION":
      return { ...state, selectedItem: initialState.selectedItem };
    case "SET_MAP_VIEW":
      return { ...state, mapView: { ...state.mapView, ...action.payload } };
    default:
      return state;
  }
}

// Create context
type AppContextType = {
  state: AppContextState;
  dispatch: React.Dispatch<AppAction>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
