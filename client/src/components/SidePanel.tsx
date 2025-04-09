import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import FilterControls from "./FilterControls";
import NeighborhoodsTab from "./NeighborhoodsTab";
import AssetsTab from "./AssetsTab";
import HistoryTab from "./HistoryTab";

const SidePanel: React.FC = () => {
  const { state, dispatch } = useAppContext();
  
  const handleTabChange = (tab: "neighborhoods" | "assets" | "history") => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: tab });
  };
  
  return (
    <div className="md:w-1/3 lg:w-1/4 bg-white shadow-lg z-10 order-2 md:order-1">
      <div className="p-4 bg-primary text-white">
        <h2 className="text-lg font-semibold">Risk Information</h2>
        <p className="text-sm text-neutral-200">View detailed risk data for Porto Alegre</p>
      </div>
      
      <FilterControls />
      
      <div className="flex border-b border-neutral-200">
        <button 
          onClick={() => handleTabChange("neighborhoods")}
          className={`flex-1 py-3 px-2 text-center text-sm ${state.activeTab === "neighborhoods" ? "tab-active font-semibold text-secondary border-b-2 border-secondary" : ""}`}
        >
          Neighborhoods
        </button>
        <button 
          onClick={() => handleTabChange("assets")}
          className={`flex-1 py-3 px-2 text-center text-sm ${state.activeTab === "assets" ? "tab-active font-semibold text-secondary border-b-2 border-secondary" : ""}`}
        >
          Critical Assets
        </button>
        <button 
          onClick={() => handleTabChange("history")}
          className={`flex-1 py-3 px-2 text-center text-sm ${state.activeTab === "history" ? "tab-active font-semibold text-secondary border-b-2 border-secondary" : ""}`}
        >
          Past Events
        </button>
      </div>
      
      <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 230px)" }}>
        {state.activeTab === "neighborhoods" && <NeighborhoodsTab />}
        {state.activeTab === "assets" && <AssetsTab />}
        {state.activeTab === "history" && <HistoryTab />}
      </div>
    </div>
  );
};

export default SidePanel;
