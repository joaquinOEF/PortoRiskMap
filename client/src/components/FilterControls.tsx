import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { X } from "lucide-react";

const FilterControls: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { filters } = state;
  
  const toggleFilter = (filterName: 'showHigh' | 'showMedium' | 'showLow') => {
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
        <h3 className="font-medium">Risk Filters</h3>
        <button 
          className="text-xs text-secondary hover:underline"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => toggleFilter('showHigh')}
          className={`px-3 py-1 ${filters.showHigh ? 'bg-[#E76F51]' : 'bg-neutral-300'} text-white text-xs rounded-full flex items-center`}
        >
          {filters.showHigh && <X className="h-3 w-3 mr-1" />}
          High Risk
        </button>
        <button
          onClick={() => toggleFilter('showMedium')}
          className={`px-3 py-1 ${filters.showMedium ? 'bg-[#F4A261]' : 'bg-neutral-300'} text-white text-xs rounded-full flex items-center`}
        >
          {filters.showMedium && <X className="h-3 w-3 mr-1" />}
          Medium Risk
        </button>
        <button
          onClick={() => toggleFilter('showLow')}
          className={`px-3 py-1 ${filters.showLow ? 'bg-[#2A9D8F]' : 'bg-neutral-300'} text-white text-xs rounded-full flex items-center`}
        >
          {filters.showLow && <X className="h-3 w-3 mr-1" />}
          Low Risk
        </button>
      </div>
    </div>
  );
};

export default FilterControls;
