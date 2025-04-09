import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { historicalEvents } from "@/lib/mockData";

const HistoryTab: React.FC = () => {
  const { dispatch } = useAppContext();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const handleEventClick = (id: number) => {
    const event = historicalEvents.find(e => e.id === id);
    if (event) {
      dispatch({
        type: "SELECT_ITEM",
        payload: { type: "event", id }
      });
      
      dispatch({
        type: "SET_MAP_VIEW",
        payload: { 
          center: event.location,
          zoom: 14
        }
      });
    }
  };
  
  // Sort historical events by date (most recent first)
  const sortedEvents = [...historicalEvents].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Past Hazard Events</h3>
        <span className="text-sm text-neutral-700">{sortedEvents.length} events</span>
      </div>
      
      {sortedEvents.map(event => (
        <div 
          key={event.id}
          className="bg-white rounded shadow-sm p-3 mb-3 hover:shadow-md transition duration-200 cursor-pointer"
          onClick={() => handleEventClick(event.id)}
        >
          <div className="flex justify-between">
            <h4 className="font-medium">{event.title}</h4>
            <span className={`text-xs ${
              event.type === 'flood' ? 'bg-[#E76F51]' : 'bg-[#F4A261]'
            } text-white px-2 py-0.5 rounded-full capitalize`}>
              {event.type}
            </span>
          </div>
          <p className="text-sm mt-1">{event.description}</p>
          <div className="mt-2 text-xs text-neutral-700">
            <div className="mb-1">
              <span className="font-medium">Date: </span> 
              {formatDate(event.date)}
            </div>
            <div>
              <span className="font-medium">Areas affected: </span>
              {event.areasAffected.join(', ')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryTab;
