import React from "react";
import { recommendations, getPriorityStars, getRiskColor } from "@/lib/mockData";
import { RecommendationCategory } from "@/types";
import { AlertCircle, HardHat, FileText, Users, Leaf } from "lucide-react";

const ActionsTab: React.FC = () => {
  // Sort recommendations by priority (high to low)
  const sortedRecommendations = [...recommendations].sort((a, b) => b.priority - a.priority);
  
  // Get appropriate icon for category
  const getCategoryIcon = (category: RecommendationCategory) => {
    switch (category) {
      case "Emergency Preparedness":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "Infrastructure":
        return <HardHat className="h-4 w-4 text-amber-600" />;
      case "Policy":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "Community Engagement":
        return <Users className="h-4 w-4 text-purple-500" />;
      case "Environmental":
        return <Leaf className="h-4 w-4 text-green-600" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };
  
  // Get color for impact level
  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case "High":
        return "#E76F51"; // Same as high risk
      case "Medium":
        return "#F4A261"; // Same as medium risk 
      case "Low":
        return "#2A9D8F"; // Same as low risk
      default:
        return "#2A9D8F";
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Suggested Risk Mitigation Actions</h3>
        <span className="text-sm text-neutral-700">{recommendations.length} recommendations</span>
      </div>
      
      {sortedRecommendations.map(rec => (
        <div 
          key={rec.id}
          className="bg-white rounded shadow-sm p-4 mb-4 border-l-4 hover:shadow-md transition duration-200"
          style={{ borderLeftColor: getImpactColor(rec.impactLevel) }}
        >
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-base">{rec.title}</h4>
            <div className="flex items-center space-x-1 text-xs bg-background py-1 px-2 rounded-full">
              {getCategoryIcon(rec.category)}
              <span>{rec.category}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
            <div>
              <span className="text-xs text-neutral-700">Impact:</span>
              <div className="font-medium" style={{ color: getImpactColor(rec.impactLevel) }}>
                {rec.impactLevel}
              </div>
            </div>
            <div>
              <span className="text-xs text-neutral-700">Priority:</span>
              <div className="font-medium text-amber-500">
                {getPriorityStars(rec.priority)}
              </div>
            </div>
          </div>
          
          <div className="mt-2">
            <span className="text-xs text-neutral-700">Target neighborhoods:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {rec.neighborhoods.map((neighborhood, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full"
                >
                  {neighborhood}
                </span>
              ))}
            </div>
          </div>
          
          <p className="mt-3 text-sm text-neutral-700">
            {rec.description}
          </p>
          
          <div className="mt-3 flex justify-end">
            <button className="text-xs text-primary hover:text-primary/80 font-medium">
              View detailed plan
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionsTab;