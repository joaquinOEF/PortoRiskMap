import { Asset, AssetType, LatLng, RiskLevel } from '@/types';

// Overpass API endpoint
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Bounding box coordinates for Porto Alegre
const PORTO_ALEGRE_BBOX = {
  south: -30.25, // southern latitude
  west: -51.30,  // western longitude
  north: -29.95, // northern latitude
  east: -51.05,  // eastern longitude
};

// Maps OSM amenity tags to our AssetType
function mapOsmTypeToAssetType(tags: {[key: string]: string}): AssetType {
  if (tags.amenity === 'hospital' || tags.amenity === 'clinic' || tags.healthcare) {
    return 'healthcare';
  }
  
  if (tags.amenity === 'bank' || tags.office === 'financial') {
    return 'financial';
  }
  
  if (tags.amenity === 'bus_station' || 
      tags.public_transport === 'station' || 
      tags.railway === 'station' || 
      tags.aeroway === 'aerodrome' ||
      tags.highway === 'bus_stop') {
    return 'transportation';
  }
  
  if (tags.amenity === 'theatre' || 
      tags.amenity === 'cinema' || 
      tags.tourism === 'museum' ||
      tags.historic) {
    return 'cultural';
  }
  
  if (tags.power === 'plant' || 
      tags.power === 'substation' || 
      tags.man_made === 'water_tower' ||
      tags.man_made === 'water_works') {
    return 'utility';
  }
  
  if (tags.amenity === 'school' || 
      tags.amenity === 'university' || 
      tags.amenity === 'college') {
    return 'education';
  }
  
  return 'other';
}

// Function to get OSM node name
function getOsmName(tags: {[key: string]: string}): string {
  return tags.name || tags['name:en'] || tags['name:pt'] || 'Unnamed Asset';
}

// Interface for OSM element
interface OsmElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags: {
    [key: string]: string;
  };
}

// Fetch critical assets from OpenStreetMap
export async function fetchCriticalAssets(): Promise<Asset[]> {
  try {
    // Query to find critical facilities
    const query = `
      [out:json][timeout:25];
      (
        // Healthcare
        node["amenity"="hospital"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        way["amenity"="hospital"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        relation["amenity"="hospital"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        
        node["amenity"="clinic"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        way["amenity"="clinic"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        
        // Transportation
        node["public_transport"="station"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        way["public_transport"="station"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        
        node["railway"="station"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        way["railway"="station"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        
        node["aeroway"="aerodrome"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        way["aeroway"="aerodrome"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        
        // Utilities
        node["power"="plant"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        way["power"="plant"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        
        node["power"="substation"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        way["power"="substation"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        
        node["man_made"="water_tower"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        node["man_made"="water_works"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        way["man_made"="water_works"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        
        // Education
        node["amenity"="school"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        way["amenity"="school"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        
        node["amenity"="university"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        way["amenity"="university"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        
        // Financial
        node["amenity"="bank"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        way["amenity"="bank"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        
        // Cultural
        node["tourism"="museum"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        way["tourism"="museum"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        
        node["amenity"="theatre"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
        way["amenity"="theatre"](${PORTO_ALEGRE_BBOX.south},${PORTO_ALEGRE_BBOX.west},${PORTO_ALEGRE_BBOX.north},${PORTO_ALEGRE_BBOX.east});
      );
      out center;
    `;
    
    // Make the request to the Overpass API
    console.log('Fetching data from OpenStreetMap API...');
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'data=' + encodeURIComponent(query),
    });
    
    if (!response.ok) {
      throw new Error(`OpenStreetMap API request failed: ${response.status}`);
    }
    
    const osmResponse = await response.json();
    const osmData = osmResponse.elements as OsmElement[];
    
    console.log(`Found ${osmData.length} raw elements from OpenStreetMap API`);
    
    // Create assets from OSM data
    const assets: Asset[] = osmData
      .map((element: OsmElement, index: number) => {
        // Extract coordinates (handling both node and way/relation with center)
        let lat, lng;
        
        if (element.type === 'node') {
          lat = element.lat;
          lng = element.lon;
        } else {
          // For ways and relations, use the center point
          lat = element.center?.lat || 0;
          lng = element.center?.lon || 0;
        }
        
        // Skip elements without valid coordinates
        if (!lat || !lng) return null;
        
        const location: LatLng = { lat, lng };
        const assetType = mapOsmTypeToAssetType(element.tags);
        const name = getOsmName(element.tags);
        
        // Assign risk level based on location
        // Using a simple bounding box approach since the point-in-polygon is having issues
        // Center of Porto Alegre
        const centerLat = -30.0346;
        const centerLng = -51.2177;
        
        // Calculate distance from center (rough approximation)
        const distance = Math.sqrt(
          Math.pow(lat - centerLat, 2) + 
          Math.pow(lng - centerLng, 2)
        );
        
        // Assign risk based on distance from center
        let landslideRisk: RiskLevel;
        if (distance < 0.04) {
          landslideRisk = 'high';
        } else if (distance < 0.08) {
          landslideRisk = 'medium';
        } else {
          landslideRisk = 'low';
        }
        
        // For now, use the same risk for flood
        const floodRisk: RiskLevel = 'low';
        
        return {
          id: index + 1,
          name,
          type: assetType,
          floodRisk,
          landslideRisk,
          location
        };
      })
      .filter(Boolean) as Asset[];
    
    // Filter to only high and medium risk assets
    const highAndMediumRiskAssets = assets.filter(
      asset => asset.landslideRisk === 'high' || asset.landslideRisk === 'medium'
    );
    
    console.log(`Found ${highAndMediumRiskAssets.length} assets in high/medium risk zones`);
    
    // Sort by risk level (high first, then medium)
    highAndMediumRiskAssets.sort((a, b) => {
      if (a.landslideRisk === 'high' && b.landslideRisk !== 'high') return -1;
      if (a.landslideRisk !== 'high' && b.landslideRisk === 'high') return 1;
      return 0;
    });
    
    return highAndMediumRiskAssets;
    
  } catch (error) {
    console.error('Error fetching critical assets from OSM:', error);
    
    // Return a fallback asset for debugging
    return [{
      id: 999,
      name: 'Error loading assets - check console logs',
      type: 'other',
      floodRisk: 'low',
      landslideRisk: 'high',
      location: { lat: -30.0346, lng: -51.2177 }  // Center of Porto Alegre
    }];
  }
}