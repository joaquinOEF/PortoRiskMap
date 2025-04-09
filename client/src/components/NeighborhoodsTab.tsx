import React, { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import RiskIndicator from "./RiskIndicator";
import { Users, HelpCircle, Building, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LandslideRiskArea {
  type: string;
  properties: {
    muncipality: string;
    region_code: string;
    neighbourhood: string;
    description: string;
    hazard: string;
    hazard_en: string;
    observation: string | null;
    vulnerability_score: string;
    risk_score: string;
    amount_buildings: number;
    number_of_people: number;
    suggested_intervention: string;
    datasource: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

// Helper function to map risk scores to our risk levels
const mapRiskScoreToLevel = (score: string): 'high' | 'medium' | 'low' => {
  if (score.includes('Alto') || score.includes('Muito alto')) return 'high';
  if (score.includes('Médio')) return 'medium';
  return 'low';
};

// Helper function to calculate the center point of a polygon
const calculateCenter = (coordinates: number[][][]): { lat: number; lng: number } => {
  // For simplicity, take the first point of the first ring of the polygon
  if (coordinates && coordinates.length > 0 && coordinates[0].length > 0) {
    return { 
      lat: coordinates[0][0][1], // Latitude is second value
      lng: coordinates[0][0][0]  // Longitude is first value
    };
  }
  // Fallback to Porto Alegre center
  return { lat: -30.03, lng: -51.23 };
};

const NeighborhoodsTab: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { filters } = state;
  const [loading, setLoading] = useState(true);
  const [neighborhoods, setNeighborhoods] = useState<LandslideRiskArea[]>([]);
  
  // Fetch the landslide risk data from the GeoJSON file
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/deslizamento_alto.geojson');
        const data = await response.json();
        
        if (data && data.features) {
          setNeighborhoods(data.features);
        } else {
          console.error('Invalid GeoJSON data format');
        }
      } catch (error) {
        console.error('Error fetching neighborhood data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNeighborhoods();
  }, []);
  
  // Filter neighborhoods based on current filters
  const filteredNeighborhoods = neighborhoods ? neighborhoods.filter((n: LandslideRiskArea) => {
    // Map the risk_score to our risk levels for filtering
    const riskLevel = mapRiskScoreToLevel(n.properties.risk_score);
    
    return (
      (riskLevel === 'high' && filters.showHigh) ||
      (riskLevel === 'medium' && filters.showMedium) ||
      (riskLevel === 'low' && filters.showLow)
    );
  })
  // First sort by risk level (high to low), then by population count (high to low)
  .sort((a: LandslideRiskArea, b: LandslideRiskArea) => {
    // Risk priority: "Muito alto" > "Alto" > "Médio" > "Baixo"
    const scoreOrder: Record<string, number> = {
      'Muito alto': 4,
      'Alto': 3,
      'Médio': 2,
      'Baixo': 1
    };
    
    const aScore = scoreOrder[a.properties.risk_score as keyof typeof scoreOrder] || 0;
    const bScore = scoreOrder[b.properties.risk_score as keyof typeof scoreOrder] || 0;
    
    // First, compare risk scores
    if (aScore !== bScore) {
      return bScore - aScore; // Sort high to low by risk
    }
    
    // If risk scores are equal, sort by population (number_of_people)
    const aPopulation = a.properties.number_of_people || 0;
    const bPopulation = b.properties.number_of_people || 0;
    
    return bPopulation - aPopulation; // Sort high to low by population
  }) : [];
  
  const handleNeighborhoodClick = (neighborhood: LandslideRiskArea) => {
    // Use index as ID since the data doesn't have explicit IDs
    const id = neighborhoods.findIndex((n: LandslideRiskArea) => 
      n.properties.neighbourhood === neighborhood.properties.neighbourhood);
    
    if (id !== -1) {
      // Calculate the center of the polygon for map navigation
      const center = calculateCenter(neighborhood.geometry.coordinates);
      
      dispatch({
        type: "SELECT_ITEM",
        payload: { type: "neighborhood", id }
      });
      
      dispatch({
        type: "SET_MAP_VIEW",
        payload: { 
          center: center,
          zoom: 16 // Zooming in more since these are specific areas
        }
      });
    }
  };

  // Function to get an appropriate color based on the risk score
  const getRiskColor = (riskScore: string): string => {
    if (riskScore.includes('Muito alto')) return '#DC2626'; // Bright red
    if (riskScore.includes('Alto')) return '#E76F51'; // Red-orange
    if (riskScore.includes('Médio')) return '#F4A261'; // Orange
    return '#2A9D8F'; // Green-teal for low risk
  };
  
  // Format numbers with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };
  
  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Neighborhoods at Risk</h3>
        <span className="text-sm text-neutral-700">
          {loading ? 'Loading...' : `${filteredNeighborhoods.length} areas`}
        </span>
      </div>
      
      {loading ? (
        // Loading skeleton
        Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white rounded shadow-sm p-3 mb-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))
      ) : (
        <>
          {filteredNeighborhoods.map((neighborhood, index) => {
            const riskColor = getRiskColor(neighborhood.properties.risk_score);
            return (
              <div 
                key={index}
                className="bg-white rounded shadow-sm p-3 mb-3 border-l-4 hover:shadow-md transition duration-200 cursor-pointer"
                onClick={() => handleNeighborhoodClick(neighborhood)}
                style={{ borderLeftColor: riskColor }}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm md:text-base">
                    {truncateText(neighborhood.properties.neighbourhood, 50)}
                  </h4>
                  
                  <div className="flex flex-col items-end gap-1">
                    {neighborhood.properties.number_of_people > 0 && (
                      <span className="text-xs md:text-sm bg-gray-100 px-2 py-0.5 rounded-full flex items-center">
                        <Users className="h-3 w-3 mr-1 text-primary" />
                        {formatNumber(neighborhood.properties.number_of_people)} people
                      </span>
                    )}
                    
                    {neighborhood.properties.amount_buildings > 0 && (
                      <span className="text-xs md:text-sm bg-gray-100 px-2 py-0.5 rounded-full flex items-center">
                        <Building className="h-3 w-3 mr-1 text-primary" />
                        {formatNumber(neighborhood.properties.amount_buildings)} buildings
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-neutral-700">Risk Level:</span>
                    <div className="flex items-center">
                      <AlertTriangle 
                        className="h-3 w-3 mr-1" 
                        style={{ color: riskColor }}
                      />
                      <span className="font-medium" style={{ color: riskColor }}>
                        {neighborhood.properties.risk_score}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-neutral-700">Vulnerability:</span>
                    <div className="flex items-center">
                      <span className="capitalize">
                        {neighborhood.properties.vulnerability_score}
                      </span>
                    </div>
                  </div>
                </div>
                
                {neighborhood.properties.description && (
                  <div className="mt-2 text-xs text-gray-600">
                    {truncateText(neighborhood.properties.description, 120)}
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredNeighborhoods.length === 0 && !loading && (
            <div className="bg-white rounded shadow-sm p-3 mb-3 text-center text-gray-500">
              No neighborhoods match the current filters. Try adjusting your filters.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NeighborhoodsTab;
