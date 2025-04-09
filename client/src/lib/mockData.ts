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
      return '<path d="M4.8 2.3A.3.3 0 0 0 4.5 2H2.5a.5.5 0 0 0-.5.5v1c0 .28.22.5.5.5h2a.3.3 0 0 0 .3-.3V2.3z"/><path d="M8.5 2h-2a.3.3 0 0 0-.3.3v1.4a.3.3 0 0 0 .3.3h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z"/><path d="M9.5 4H2a1 1 0 0 0 0 2h.5a.5.5 0 0 1 .5.5.5.5 0 0 1-.5.5H2a1 1 0 0 0-1 1v3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1h-.5a.5.5 0 0 1-.5-.5.5.5 0 0 1 .5-.5h.5a1 1 0 1 0 0-2zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm1.5 4.5a1.5 1.5 0 1 1-3 0V11h3v1.5z"/>';
    case "financial":
      return '<path d="M1 3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3Z"/><path d="M2 7a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H2Z"/><path d="M6 11h2v5H6v-5Z"/><path d="M10 11h2v5h-2v-5Z"/><path d="M4 11h2v2H4v-2Z"/><path d="M12 11h2v2h-2v-2Z"/>';
    case "transportation":
      return '<path d="M19 17h2v2h-2v-2z"/><path d="M1 6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v11a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H4v1a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6z"/><path d="M4 10a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H4z"/><path d="M5 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M17 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>';
    case "cultural":
      return '<path d="M1 22h22"/><path d="M19 22V6a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v16"/><path d="M5 3v0"/><path d="M19 3v0"/><path d="M12 3v8"/><path d="M5 13v2"/><path d="M19 13v2"/><path d="M5 19v2"/><path d="M19 19v2"/>';
    case "utility":
      return '<path d="M8 2v2"/><path d="M16 2v2"/><path d="M3 6h18"/><path d="M10 10 9 9l-2 2"/><path d="m15 10 1-1 2 2"/><path d="m10 14-1-1-2 2"/><path d="m15 14 1-1 2 2"/><path d="M7 18h10"/><path d="M8 22v-4"/><path d="M16 22v-4"/>';
    case "education":
      return '<path d="M2 10a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10Z"/><path d="M2 8v6"/><path d="M22 8v6"/><path d="m7 15 5-6 5 6"/><path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2"/><path d="M12 12v6"/>';
    default:
      return '<path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h1v1H9z"/><path d="M14 9h1v1h-1z"/><path d="M9 14h1v1H9z"/><path d="M14 14h1v1h-1z"/>';
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
