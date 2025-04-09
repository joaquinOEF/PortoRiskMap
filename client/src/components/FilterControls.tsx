import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { X, Droplets, Mountain } from "lucide-react";

const FilterControls: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { filters } = state;
  
  const toggleAssetFilter = (filterName: 'showFloodRisk' | 'showLandslideRisk') => {
    dispatch({
      type: "SET_FILTER",
      payload: {
        [filterName]: !filters[filterName]
      }
    });
  };
  
  const resetFilters = () => {
    dispatch({ type: "RESET_FILTERS" });
  };
  
  return (
    <div className="p-4 border-b border-neutral-200 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Asset Filters</h3>
        <button 
          className="text-xs text-secondary hover:underline"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>
      
      <div>
        <p className="text-xs text-neutral-600 mb-2">Show Assets By Risk Type:</p>
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={() => toggleAssetFilter('showFloodRisk')}
            className={`px-3 py-1 ${filters.showFloodRisk ? 'bg-[#3B82F6]' : 'bg-neutral-300'} text-white text-xs rounded-full flex items-center`}
          >
            {filters.showFloodRisk && <X className="h-3 w-3 mr-1" />}
            <Droplets className="h-3 w-3 mr-1" />
            Assets at Flood Risk
          </button>
          <button
            onClick={() => toggleAssetFilter('showLandslideRisk')}
            className={`px-3 py-1 ${filters.showLandslideRisk ? 'bg-[#B45309]' : 'bg-neutral-300'} text-white text-xs rounded-full flex items-center`}
          >
            {filters.showLandslideRisk && <X className="h-3 w-3 mr-1" />}
            <Mountain className="h-3 w-3 mr-1" />
            Assets at Landslide Risk
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
