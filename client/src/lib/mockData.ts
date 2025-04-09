import { Neighborhood, Asset, HistoricalEvent, RiskLevel, AssetType, Recommendation } from "@/types";

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
    case "very-high":
      return "#7E22CE"; // risk-very-high (Deep purple)
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

export const getAssetIconSVG = (type: AssetType): string => {
  switch (type) {
    case "healthcare":
      // HeartPulse icon
      return '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path><path d="M3.22 12H9.5l.5-1 2 4 .5-2h6.1"></path>';
    case "financial":
      // Building icon
      return '<path d="M6 22V2l12 4v16"></path><path d="M6 12h12"></path><path d="M6 7h12"></path><path d="M6 17h12"></path>';
    case "transportation":
      // Car icon
      return '<path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path><circle cx="6.5" cy="16.5" r="2.5"></circle><circle cx="16.5" cy="16.5" r="2.5"></circle>';
    case "cultural":
      // Landmark icon
      return '<path d="M3 22h18"></path><path d="M6 18v-5"></path><path d="M10 18v-5"></path><path d="M14 18v-5"></path><path d="M18 18v-5"></path><path d="m4 10 8-7 8 7"></path><path d="M6 2h12"></path>';
    case "utility":
      // Zap icon
      return '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"></path>';
    case "education":
      // School icon
      return '<path d="m4 6 8-4 8 4"></path><path d="m18 10-8-4-8 4"></path><path d="M4 10v7c0 2 1.5 3 3 3l5-3"></path><path d="M20 10v7c0 2-1.5 3-3 3l-5-3"></path><path d="m4 10 8 4 8-4"></path>';
    default:
      // Building icon
      return '<path d="M6 22V2l12 4v16"></path><path d="M6 12h12"></path><path d="M6 7h12"></path><path d="M6 17h12"></path>';
  }
};

// Mock data for recommendations
// Helper function to generate priority stars
export const getPriorityStars = (priority: number): string => {
  const filled = '★'.repeat(priority);
  const empty = '☆'.repeat(5 - priority);
  return filled + empty;
};

export const recommendations: Recommendation[] = [
  {
    id: 1,
    title: "Install Early Warning Flood Sensors",
    category: "Emergency Preparedness",
    impactLevel: "High",
    priority: 5,
    neighborhoods: ["Cidade Baixa", "Menino Deus", "Centro Histórico"],
    description: "Deploy automated flood sensors along key flood-prone waterways. Integrate sensors with emergency alert systems to provide real-time flood warnings, improving response times and resident safety."
  },
  {
    id: 2,
    title: "Upgrade Drainage Infrastructure",
    category: "Infrastructure",
    impactLevel: "High",
    priority: 4,
    neighborhoods: ["Centro Histórico", "Cidade Baixa"],
    description: "Modernize and expand the current drainage system with larger capacity culverts and stormwater detention areas. Implement regular maintenance protocols to prevent blockages during heavy rainfall events."
  },
  {
    id: 3,
    title: "Develop Community Emergency Response Teams",
    category: "Community Engagement",
    impactLevel: "Medium",
    priority: 3,
    neighborhoods: ["Sarandi", "Cidade Baixa", "Bom Fim"],
    description: "Train neighborhood volunteers in emergency response procedures specific to flood and landslide events. Equip teams with necessary tools and establish clear communication channels with city emergency services."
  },
  {
    id: 4,
    title: "Landslide Risk Mapping and Monitoring",
    category: "Policy",
    impactLevel: "High",
    priority: 4,
    neighborhoods: ["Sarandi", "Morro Santana"],
    description: "Conduct detailed geological surveys of hillside areas to identify potential landslide zones. Implement continuous monitoring systems using ground sensors and satellite imagery to detect early warning signs."
  },
  {
    id: 5,
    title: "Reforestation of Critical Hillsides",
    category: "Environmental",
    impactLevel: "Medium",
    priority: 3,
    neighborhoods: ["Sarandi", "Morro Santana"],
    description: "Restore native vegetation on slopes with high erosion rates to prevent soil destabilization. Focus on deep-rooted species that can help bind soil and improve water retention capacity of hillsides."
  },
  {
    id: 6,
    title: "Healthcare Facility Flood Protection",
    category: "Infrastructure",
    impactLevel: "High",
    priority: 5,
    neighborhoods: ["Centro Histórico", "Menino Deus"],
    description: "Install flood barriers, elevated equipment platforms, and backup power systems at critical healthcare facilities. Develop comprehensive evacuation plans for patients in case of extreme flood events."
  },
  {
    id: 7,
    title: "Revise Building Codes for Flood Zones",
    category: "Policy",
    impactLevel: "Medium",
    priority: 3,
    neighborhoods: ["Centro Histórico", "Cidade Baixa", "Menino Deus", "Ipanema"],
    description: "Update municipal building regulations to require elevated first floors, flood-resistant materials, and improved stormwater management for all new construction in flood-prone areas."
  },
  {
    id: 8,
    title: "Establish Flood Emergency Evacuation Routes",
    category: "Emergency Preparedness",
    impactLevel: "High",
    priority: 4,
    neighborhoods: ["Cidade Baixa", "Centro Histórico", "Menino Deus", "Sarandi"],
    description: "Designate and clearly mark evacuation routes in high-risk neighborhoods. Install informational signage and conduct regular community drills to ensure residents are familiar with safe evacuation procedures."
  }
];
