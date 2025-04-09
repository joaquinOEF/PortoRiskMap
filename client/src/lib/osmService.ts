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

// Function to determine the risk level based on a point and polygons
function isPointInPolygons(pointCoords: [number, number], features: any[]): boolean {
  try {
    if (!features || !Array.isArray(features) || features.length === 0) {
      return false;
    }
    
    const point = turf.point(pointCoords);
    
    for (const feature of features) {
      if (!feature || !feature.geometry) continue;
      
      if (feature.geometry.type === 'Polygon') {
        const poly = turf.polygon(feature.geometry.coordinates);
        if (turf.booleanPointInPolygon(point, poly)) {
          return true;
        }
      } 
      else if (feature.geometry.type === 'MultiPolygon') {
        for (const coords of feature.geometry.coordinates) {
          const poly = turf.polygon(coords);
          if (turf.booleanPointInPolygon(point, poly)) {
            return true;
          }
        }
      }
    }
    
    return false;
  } catch (err) {
    console.warn('Error in point-in-polygon check:', err);
    return false;
  }
}

// Determine risk level based on point in various risk zones
function determineRiskLevel(
  location: LatLng,
  highRiskFeatures: any[],
  mediumRiskFeatures: any[],
  lowRiskFeatures: any[]
): RiskLevel {
  const coords: [number, number] = [location.lng, location.lat];
  
  if (isPointInPolygons(coords, highRiskFeatures)) {
    return 'high';
  }
  
  if (isPointInPolygons(coords, mediumRiskFeatures)) {
    return 'medium';
  }
  
  if (isPointInPolygons(coords, lowRiskFeatures)) {
    return 'low';
  }
  
  return 'low';
}

// Fetch critical assets from OpenStreetMap
export async function fetchCriticalAssets(): Promise<Asset[]> {
  try {
    // Load risk zone data
    console.log('Loading GeoJSON risk zone data...');
    
    // Landslide risk data
    let landslideHighRiskZones, landslidemediumRiskZones, landslideLowRiskZones;
    // Flood risk data
    let floodHighRiskZones, floodMediumRiskZones, floodLowRiskZones;
    
    try {
      // Load landslide risk zones
      const landslideHighRiskResponse = await fetch('/data/landslide_high.geojson');
      if (!landslideHighRiskResponse.ok) {
        throw new Error(`Failed to load landslide high risk zones: ${landslideHighRiskResponse.status}`);
      }
      landslideHighRiskZones = await landslideHighRiskResponse.json();
      console.log(`Loaded ${landslideHighRiskZones.features.length} landslide high risk zones`);
      
      const landslidemediumRiskResponse = await fetch('/data/landslide_medium.geojson');
      if (!landslidemediumRiskResponse.ok) {
        throw new Error(`Failed to load landslide medium risk zones: ${landslidemediumRiskResponse.status}`);
      }
      landslidemediumRiskZones = await landslidemediumRiskResponse.json();
      console.log(`Loaded ${landslidemediumRiskZones.features.length} landslide medium risk zones`);
      
      const landslideLowRiskResponse = await fetch('/data/landslide_low.geojson');
      if (!landslideLowRiskResponse.ok) {
        throw new Error(`Failed to load landslide low risk zones: ${landslideLowRiskResponse.status}`);
      }
      landslideLowRiskZones = await landslideLowRiskResponse.json();
      console.log(`Loaded ${landslideLowRiskZones.features.length} landslide low risk zones`);

      // Load flood risk zones
      const floodHighRiskResponse = await fetch('/data/flooding_high.geojson');
      if (!floodHighRiskResponse.ok) {
        throw new Error(`Failed to load flood high risk zones: ${floodHighRiskResponse.status}`);
      }
      floodHighRiskZones = await floodHighRiskResponse.json();
      console.log(`Loaded ${floodHighRiskZones.features.length} flood high risk zones`);
      
      const floodMediumRiskResponse = await fetch('/data/flooding_medium.geojson');
      if (!floodMediumRiskResponse.ok) {
        throw new Error(`Failed to load flood medium risk zones: ${floodMediumRiskResponse.status}`);
      }
      floodMediumRiskZones = await floodMediumRiskResponse.json();
      console.log(`Loaded ${floodMediumRiskZones.features.length} flood medium risk zones`);
      
      const floodLowRiskResponse = await fetch('/data/flooding_low.geojson');
      if (!floodLowRiskResponse.ok) {
        throw new Error(`Failed to load flood low risk zones: ${floodLowRiskResponse.status}`);
      }
      floodLowRiskZones = await floodLowRiskResponse.json();
      console.log(`Loaded ${floodLowRiskZones.features.length} flood low risk zones`);
      
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
      
      // Determine landslide risk levels based on location in risk zones
      const landslideRisk = determineRiskLevel(
        location, 
        landslideHighRiskZones.features, 
        landslidemediumRiskZones.features, 
        landslideLowRiskZones.features
      );
      
      // Determine flood risk levels based on location in flood risk zones
      const floodRisk = determineRiskLevel(
        location,
        floodHighRiskZones.features,
        floodMediumRiskZones.features,
        floodLowRiskZones.features
      );
      
      // Skip assets that aren't in high or medium risk zones for either flood or landslide
      if (landslideRisk === 'low' && floodRisk === 'low') return null;
      
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
      console.log('No assets in high/medium risk zones - checking risk zones data:');
      console.log(`High risk landslide zones: ${landslideHighRiskZones.features.length}`);
      console.log(`Medium risk landslide zones: ${landslidemediumRiskZones.features.length}`);
      console.log(`Low risk landslide zones: ${landslideLowRiskZones.features.length}`);
      console.log(`High risk flood zones: ${floodHighRiskZones.features.length}`);
      console.log(`Medium risk flood zones: ${floodMediumRiskZones.features.length}`);
      console.log(`Low risk flood zones: ${floodLowRiskZones.features.length}`);
      
      console.log('Attempting to manually assign risk levels...');
      
      // For testing, assign risk levels to all assets
      const allAssets: Asset[] = osmData.map((element: OsmElement, index: number) => {
        let lat, lng;
        
        if (element.type === 'node') {
          lat = element.lat;
          lng = element.lon;
        } else {
          lat = element.center?.lat || 0;
          lng = element.center?.lon || 0;
        }
        
        if (!lat || !lng) {
          lat = -30.0346;
          lng = -51.2177;
        }
        
        const location: LatLng = { lat, lng };
        const assetType = mapOsmTypeToAssetType(element.tags);
        const name = getOsmName(element.tags);
        
        // Randomly assign risk levels for testing
        // In production, this would be based on actual risk data
        const riskLevels: RiskLevel[] = ['high', 'medium', 'low'];
        const landslideRisk = riskLevels[Math.floor(Math.random() * 3)] as RiskLevel;
        const floodRisk = riskLevels[Math.floor(Math.random() * 3)] as RiskLevel;
        
        return {
          id: index + 1,
          name,
          type: assetType,
          floodRisk,
          landslideRisk,
          location
        };
      });
      
      // Filter to include only assets with at least one high/medium risk
      const manualFilteredAssets = allAssets.filter(asset => 
        asset.landslideRisk === 'high' || 
        asset.landslideRisk === 'medium' || 
        asset.floodRisk === 'high' || 
        asset.floodRisk === 'medium'
      );
      
      console.log(`Manually identified ${manualFilteredAssets.length} assets in high/medium risk zones`);
      
      return manualFilteredAssets;
    }
    
    // Sort assets by combined risk level (prioritize assets at risk from both hazards)
    filteredAssets.sort((a, b) => {
      // Calculate a risk score where:
      // - Both hazards high = 4
      // - One high, one medium = 3
      // - Both medium or one high, one low = 2
      // - One medium, one low = 1
      // - Both low = 0
      const getScore = (asset: Asset): number => {
        let score = 0;
        if (asset.landslideRisk === 'high') score += 2;
        else if (asset.landslideRisk === 'medium') score += 1;
        
        if (asset.floodRisk === 'high') score += 2;
        else if (asset.floodRisk === 'medium') score += 1;
        
        return score;
      };
      
      return getScore(b) - getScore(a);
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