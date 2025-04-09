import { Neighborhood, Asset, HistoricalEvent, RiskLevel, AssetType } from "@/types";

// Mock data for neighborhoods
export const neighborhoods: Neighborhood[] = [
  {
    id: 1,
    name: "Centro Histórico",
    floodRisk: "high",
    landslideRisk: "medium",
    populationAtRisk: 48500,
    location: { lat: -30.0346, lng: -51.2177 }
  },
  {
    id: 2,
    name: "Cidade Baixa",
    floodRisk: "high",
    landslideRisk: "low",
    populationAtRisk: 23700,
    location: { lat: -30.0413, lng: -51.2227 }
  },
  {
    id: 3,
    name: "Menino Deus",
    floodRisk: "medium",
    landslideRisk: "low",
    populationAtRisk: 32100,
    location: { lat: -30.0542, lng: -51.2211 }
  },
  {
    id: 4,
    name: "Bom Fim",
    floodRisk: "medium",
    landslideRisk: "medium",
    populationAtRisk: 15800,
    location: { lat: -30.0311, lng: -51.2069 }
  },
  {
    id: 5,
    name: "Sarandi",
    floodRisk: "high",
    landslideRisk: "medium",
    populationAtRisk: 52300,
    location: { lat: -29.9927, lng: -51.1092 }
  },
  {
    id: 6,
    name: "Ipanema",
    floodRisk: "medium",
    landslideRisk: "low",
    populationAtRisk: 18400,
    location: { lat: -30.1362, lng: -51.2121 }
  },
  {
    id: 7,
    name: "Moinhos de Vento",
    floodRisk: "low",
    landslideRisk: "low",
    populationAtRisk: 9200,
    location: { lat: -30.0256, lng: -51.2034 }
  }
];

// Mock data for assets
export const assets: Asset[] = [
  {
    id: 1,
    name: "Hospital de Clínicas",
    type: "healthcare",
    floodRisk: "high",
    landslideRisk: "medium",
    location: { lat: -30.0389, lng: -51.2097 }
  },
  {
    id: 2,
    name: "Banrisul Headquarters",
    type: "financial",
    floodRisk: "high",
    landslideRisk: "low",
    location: { lat: -30.0327, lng: -51.2265 }
  },
  {
    id: 3,
    name: "Trensurb Mercado Station",
    type: "transportation",
    floodRisk: "medium",
    landslideRisk: "low",
    location: { lat: -30.0244, lng: -51.2214 }
  },
  {
    id: 4,
    name: "Usina do Gasômetro",
    type: "cultural",
    floodRisk: "high",
    landslideRisk: "low",
    location: { lat: -30.0338, lng: -51.2414 }
  },
  {
    id: 5,
    name: "Porto Alegre Airport",
    type: "transportation",
    floodRisk: "medium",
    landslideRisk: "low",
    location: { lat: -29.9939, lng: -51.1731 }
  },
  {
    id: 6,
    name: "CEEE Power Substation",
    type: "utility",
    floodRisk: "medium",
    landslideRisk: "medium",
    location: { lat: -30.0475, lng: -51.2022 }
  },
  {
    id: 7,
    name: "UFRGS Campus Centro",
    type: "education",
    floodRisk: "low",
    landslideRisk: "low",
    location: { lat: -30.0345, lng: -51.2185 }
  },
  {
    id: 8,
    name: "Water Treatment Plant",
    type: "utility",
    floodRisk: "high",
    landslideRisk: "medium",
    location: { lat: -30.0572, lng: -51.2343 }
  }
];

// Mock data for historical events
export const historicalEvents: HistoricalEvent[] = [
  {
    id: 1,
    title: "January 2023 Major Flooding",
    type: "flood",
    date: "2023-01-15",
    description: "Severe flooding in Centro Histórico and Cidade Baixa following intense rainfall. Affected approximately 32,000 residents.",
    areasAffected: ["Centro Histórico", "Cidade Baixa", "Menino Deus"],
    location: { lat: -30.0370, lng: -51.2227 }
  },
  {
    id: 2,
    title: "March 2022 Landslide",
    type: "landslide",
    date: "2022-03-08",
    description: "Multiple landslides near Morro Santana following a week of persistent rain. Damaged infrastructure and roads.",
    areasAffected: ["Morro Santana", "Sarandi"],
    location: { lat: -29.9927, lng: -51.1092 }
  },
  {
    id: 3,
    title: "November 2021 Flash Flood",
    type: "flood",
    date: "2021-11-25",
    description: "Flash flooding along Guaíba riverfront caused by sudden rainfall and river level rise. Damaged waterfront infrastructure.",
    areasAffected: ["Centro Histórico", "Cidade Baixa", "Menino Deus"],
    location: { lat: -30.0400, lng: -51.2300 }
  },
  {
    id: 4,
    title: "July 2020 Storm Surge",
    type: "flood",
    date: "2020-07-12",
    description: "Storm surge along Guaíba Lake caused flooding in low-lying areas. Water levels rose 2.4 meters above normal.",
    areasAffected: ["Ipanema", "Centro Histórico"],
    location: { lat: -30.1362, lng: -51.2121 }
  },
  {
    id: 5,
    title: "April 2020 Landslide",
    type: "landslide",
    date: "2020-04-03",
    description: "Moderate landslide in hillside areas following heavy rainfall. Some property damage reported.",
    areasAffected: ["Sarandi", "northern hillsides"],
    location: { lat: -29.9927, lng: -51.1092 }
  },
  {
    id: 6,
    title: "October 2019 Heavy Rains",
    type: "flood",
    date: "2019-10-17",
    description: "Sustained heavy rainfall caused flooding in low-lying neighborhoods. Several streets made impassable.",
    areasAffected: ["Cidade Baixa", "Menino Deus", "Bom Fim"],
    location: { lat: -30.0413, lng: -51.2227 }
  }
];

// Helper functions
export const getRiskColor = (risk: RiskLevel): string => {
  switch (risk) {
    case "high":
      return "#E76F51"; // risk-high
    case "medium":
      return "#F4A261"; // risk-medium
    case "low":
      return "#2A9D8F"; // risk-low
    default:
      return "#2A9D8F";
  }
};

export const getAssetTypeLabel = (type: AssetType): string => {
  switch (type) {
    case "healthcare":
      return "Healthcare";
    case "financial":
      return "Financial";
    case "transportation":
      return "Transportation";
    case "cultural":
      return "Cultural";
    case "utility":
      return "Utility";
    case "education":
      return "Education";
    default:
      return "Other";
  }
};
