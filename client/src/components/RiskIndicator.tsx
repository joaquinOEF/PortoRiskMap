import React from "react";
import { RiskLevel } from "@/types";
import { getRiskColor } from "@/lib/mapUtils";

interface RiskIndicatorProps {
  risk: RiskLevel;
}

const RiskIndicator: React.FC<RiskIndicatorProps> = ({ risk }) => {
  const color = getRiskColor(risk);
  
  return (
    <span 
      className="w-3 h-3 rounded-full inline-block mr-1"
      style={{ backgroundColor: color }}
    ></span>
  );
};

export default RiskIndicator;
