import { Asset, AssetType, LatLng, RiskLevel } from '@/types';
import * as turf from '@turf/turf';

// Overpass API endpoint
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Bounding box coordinates for Porto Alegre
const PORTO_ALEGRE_BBOX = {
  south: -30.25, // southern latitude
  west: -51.30,  // western longitude
  north: -29.95, // northern latitude
  east: -51.05,  // eastern longitude
};

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

// Helper function to check if a point is inside any polygon in a GeoJSON collection
function isPointInAnyFeature(point: turf.Feature<turf.Point>, features: any[]): boolean {
  // Make sure we have valid features
  if (!features || !Array.isArray(features) || features.length === 0) {
    return false;
  }
  
  // Check each feature
  for (const feature of features) {
    try {
      // Skip features without geometry
      if (!feature.geometry) continue;
      
      // Create a polygon from the feature
      let polygon;
      
      if (feature.geometry.type === 'Polygon') {
        polygon = turf.polygon(feature.geometry.coordinates);
      } else if (feature.geometry.type === 'MultiPolygon') {
        // For MultiPolygon, check each polygon
        for (const coords of feature.geometry.coordinates) {
          polygon = turf.polygon(coords);
          if (turf.booleanPointInPolygon(point, polygon)) {
            return true;
          }
        }
        continue; // Skip to next feature if none of the polygons contain the point
      } else {
        // Skip non-polygon features
        continue;
      }
      
      // Check if point is inside the polygon
      if (turf.booleanPointInPolygon(point, polygon)) {
        return true;
      }
    } catch (error) {
      console.warn('Error checking if point is in feature:', error);
      continue;
    }
  }
  
  return false;
}

// Function to determine the risk level based on location in risk zones
function determineRiskLevel(
  location: LatLng,
  highRiskFeatures: any[],
  mediumRiskFeatures: any[],
  lowRiskFeatures: any[]
): RiskLevel {
  // Create a turf point from the location
  const point = turf.point([location.lng, location.lat]);
  
  // Check if point is in high risk zone
  if (isPointInAnyFeature(point, highRiskFeatures)) {
    return 'high';
  }
  
  // Check if point is in medium risk zone
  if (isPointInAnyFeature(point, mediumRiskFeatures)) {
    return 'medium';
  }
  
  // Check if point is in low risk zone
  if (isPointInAnyFeature(point, lowRiskFeatures)) {
    return 'low';
  }
  
  // If not in any zone, return low risk
  return 'low';
}

// Fetch critical assets from OpenStreetMap
export async function fetchCriticalAssets(): Promise<Asset[]> {
  try {
    // Load risk zone data
    console.log('Loading GeoJSON risk zone data...');
    
    let highRiskZones, mediumRiskZones, lowRiskZones;
    
    try {
      // Load high risk zones
      const highRiskResponse = await fetch('/data/landslide_high.geojson');
      if (!highRiskResponse.ok) {
        throw new Error(`Failed to load high risk zones: ${highRiskResponse.status}`);
      }
      highRiskZones = await highRiskResponse.json();
      console.log(`Loaded ${highRiskZones.features.length} high risk zones`);
      
      // Load medium risk zones
      const mediumRiskResponse = await fetch('/data/landslide_medium.geojson');
      if (!mediumRiskResponse.ok) {
        throw new Error(`Failed to load medium risk zones: ${mediumRiskResponse.status}`);
      }
      mediumRiskZones = await mediumRiskResponse.json();
      console.log(`Loaded ${mediumRiskZones.features.length} medium risk zones`);
      
      // Load low risk zones
      const lowRiskResponse = await fetch('/data/landslide_low.geojson');
      if (!lowRiskResponse.ok) {
        throw new Error(`Failed to load low risk zones: ${lowRiskResponse.status}`);
      }
      lowRiskZones = await lowRiskResponse.json();
      console.log(`Loaded ${lowRiskZones.features.length} low risk zones`);
      
    } catch (error) {
      console.error('Error loading GeoJSON data:', error);
      throw error;
    }
    
    // Query to find critical facilities
    console.log('Fetching assets from OpenStreetMap...');
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
    
    // Process the OSM data into Asset format
    const assetsRaw: (Asset | null)[] = osmData.map((element: OsmElement, index: number) => {
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
      
      // Determine risk levels based on location in risk zones
      const landslideRisk = determineRiskLevel(
        location, 
        highRiskZones.features, 
        mediumRiskZones.features, 
        lowRiskZones.features
      );
      
      // For now, we'll use the same risk level for flood risk as for landslide risk
      // This can be updated if flood risk data becomes available
      const floodRisk: RiskLevel = 'low';
      
      // Skip assets that aren't in high or medium risk zones
      if (landslideRisk === 'low') return null;
      
      return {
        id: index + 1, // Assign unique IDs
        name,
        type: assetType,
        floodRisk,
        landslideRisk,
        location
      };
    });
    
    // Filter out nulls and sort by risk level
    const filteredAssets: Asset[] = assetsRaw.filter(Boolean) as Asset[];
    
    console.log(`Filtered down to ${filteredAssets.length} assets in high/medium risk zones`);
    
    if (filteredAssets.length === 0) {
      console.log('No assets found in high/medium risk zones.');
      console.log('This may indicate an issue with the risk zone data or the point-in-polygon algorithm.');
      
      // For testing purposes, let's manually add a debug asset
      return [{
        id: 999,
        name: 'Debug Asset - No assets found in risk zones',
        type: 'other',
        floodRisk: 'low' as RiskLevel, 
        landslideRisk: 'high' as RiskLevel,
        location: { lat: -30.0346, lng: -51.2177 } // Center of Porto Alegre
      }];
    }
    
    // Sort assets by risk level (high to medium)
    filteredAssets.sort((a, b) => {
      if (a.landslideRisk === 'high' && b.landslideRisk !== 'high') return -1;
      if (a.landslideRisk !== 'high' && b.landslideRisk === 'high') return 1;
      return 0;
    });
    
    return filteredAssets;
    
  } catch (error) {
    console.error('Error in fetchCriticalAssets:', error);
    
    // Return a fallback asset for debugging
    return [{
      id: 999,
      name: 'Error loading assets - ' + (error instanceof Error ? error.message : 'Unknown error'),
      type: 'other',
      floodRisk: 'low',
      landslideRisk: 'high',
      location: { lat: -30.0346, lng: -51.2177 }  // Center of Porto Alegre
    }];
  }
}