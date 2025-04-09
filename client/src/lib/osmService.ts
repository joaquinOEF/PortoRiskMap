import { Asset, AssetType, LatLng, RiskLevel } from '@/types';

// Overpass API endpoint
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Bounding box coordinates for Porto Alegre
// These coordinates can be adjusted to focus on the precise area of interest
const PORTO_ALEGRE_BBOX = {
  south: -30.25, // southern latitude
  west: -51.30,  // western longitude
  north: -29.95, // northern latitude
  east: -51.05,  // eastern longitude
};

// Helper function to determine if a point is within a polygon
function isPointInPolygon(point: LatLng, polygon: number[][][]): boolean {
  if (!polygon || !polygon.length) return false;
  
  for (const ring of polygon) {
    if (isPointInRing(point, ring)) {
      return true;
    }
  }
  
  return false;
}

// Helper function to check if point is in a ring (using ray casting algorithm)
function isPointInRing(point: LatLng, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    // GeoJSON coordinates are [longitude, latitude]
    const xi = ring[i][0], yi = ring[i][1];  // longitude, latitude
    const xj = ring[j][0], yj = ring[j][1];  // longitude, latitude
    
    // For point-in-polygon testing, we need to swap the order
    // since LatLng has {lat, lng} format
    const intersect = ((yi > point.lat) !== (yj > point.lat)) && 
      (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  return inside;
}

// Helper function to determine the risk level based on which zone the asset is in
function determineRiskLevel(
  location: LatLng, 
  highRiskZones: any[], 
  mediumRiskZones: any[], 
  lowRiskZones: any[]
): RiskLevel {
  // Check high risk zones first (including detailed deslizamento_alto zones)
  for (const zone of highRiskZones) {
    if (zone.geometry.type === 'MultiPolygon' || zone.geometry.type === 'Polygon') {
      const coordinates = zone.geometry.type === 'Polygon' 
        ? [zone.geometry.coordinates] 
        : zone.geometry.coordinates;
        
      if (isPointInPolygon(location, coordinates)) {
        return 'high';
      }
    }
  }
  
  // Check medium risk zones next
  for (const zone of mediumRiskZones) {
    if (zone.geometry.type === 'MultiPolygon' || zone.geometry.type === 'Polygon') {
      const coordinates = zone.geometry.type === 'Polygon' 
        ? [zone.geometry.coordinates] 
        : zone.geometry.coordinates;
        
      if (isPointInPolygon(location, coordinates)) {
        return 'medium';
      }
    }
  }
  
  // We're skipping low risk checks as requested - assets not in high or medium zones won't be shown
  
  // If not in high or medium zone, return low risk (these won't be displayed)
  return 'low';
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

// Fetch critical assets from OpenStreetMap
export async function fetchCriticalAssets(): Promise<Asset[]> {
  try {
    // Load risk zone data
    const highRiskZonesResponse = await fetch('/data/landslide_high.geojson');
    const highRiskZones = await highRiskZonesResponse.json();
    
    const mediumRiskZonesResponse = await fetch('/data/landslide_medium.geojson');
    const mediumRiskZones = await mediumRiskZonesResponse.json();
    
    const lowRiskZonesResponse = await fetch('/data/landslide_low.geojson');
    const lowRiskZones = await lowRiskZonesResponse.json();
    
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
    
    // Sort assets by risk level (high to medium)
    filteredAssets.sort((a, b) => {
      if (a.landslideRisk === 'high' && b.landslideRisk !== 'high') return -1;
      if (a.landslideRisk !== 'high' && b.landslideRisk === 'high') return 1;
      return 0;
    });
    
    const assets = filteredAssets;
    
    return assets;
  } catch (error) {
    console.error('Error fetching critical assets from OSM:', error);
    return [];
  }
}