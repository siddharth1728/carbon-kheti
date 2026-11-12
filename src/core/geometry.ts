import proj4 from 'proj4';
import * as turf from '@turf/turf';
import { Feature, Polygon } from 'geojson';

// Define WGS84, UTM Zone 43N (EPSG:32643) and UTM Zone 44N (EPSG:32644)
// Western Telangana (< 78°E) belongs to UTM Zone 43N (central meridian 75°E)
// Eastern Telangana (>= 78°E) belongs to UTM Zone 44N (central meridian 81°E)
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
proj4.defs('EPSG:32643', '+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:32644', '+proj=utm +zone=44 +datum=WGS84 +units=m +no_defs');

/**
 * Returns the appropriate UTM EPSG code and Zone number based on longitude
 * Longitudes < 78.0°E -> Zone 43N (EPSG:32643)
 * Longitudes >= 78.0°E -> Zone 44N (EPSG:32644)
 */
export function getUtmZoneForLon(lon: number): { epsg: string; zone: number } {
  if (lon < 78.0) {
    return { epsg: 'EPSG:32643', zone: 43 };
  }
  return { epsg: 'EPSG:32644', zone: 44 };
}

/**
 * Computes centroid [lon, lat] of a GeoJSON Polygon
 */
export function getPolygonCentroid(polygon: Feature<Polygon>): [number, number] {
  const c = turf.centroid(polygon);
  return c.geometry.coordinates as [number, number];
}

/**
 * Projects a [lon, lat] coordinate to the metric UTM zone of the plot
 */
export function projectWgs84ToMetricUtm(lon: number, lat: number): { coords: [number, number]; zone: number; epsg: string } {
  const { epsg, zone } = getUtmZoneForLon(lon);
  const projected = proj4('EPSG:4326', epsg, [lon, lat]) as [number, number];
  return { coords: projected, zone, epsg };
}

/**
 * Calculates geodesic / metric area of a GeoJSON Polygon in square meters using Turf geodesic algorithms
 */
export function calculatePolygonAreaM2(polygon: Feature<Polygon>): number {
  return turf.area(polygon);
}

export function convertM2ToHa(m2: number): number {
  return m2 / 10000;
}

export function convertM2ToAcres(m2: number): number {
  return (m2 / 10000) * 2.47105;
}

/**
 * Douglas-Peucker track simplification for walked GPS boundary coordinates
 */
export function simplifyGpsTrack(coordinates: [number, number][], toleranceMeters = 1.5): [number, number][] {
  if (coordinates.length < 3) return coordinates;
  const line = turf.lineString(coordinates);
  // Convert tolerance in meters to approximate degrees (1m ~ 0.000009 deg)
  const toleranceDeg = toleranceMeters * 0.000009;
  const simplified = turf.simplify(line, { tolerance: toleranceDeg, highQuality: true });
  return simplified.geometry.coordinates as [number, number][];
}

/**
 * Checks whether a closed GPS walk polygon self-intersects (kink detection)
 */
export function checkSelfIntersection(coordinates: [number, number][]): { hasKinks: boolean; kinkCount: number } {
  if (coordinates.length < 4) return { hasKinks: false, kinkCount: 0 };
  try {
    // Ensure ring is closed
    const ring = [...coordinates];
    if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
      ring.push(ring[0]);
    }
    const poly = turf.polygon([ring]);
    const kinks = turf.kinks(poly);
    return {
      hasKinks: kinks.features.length > 0,
      kinkCount: kinks.features.length,
    };
  } catch {
    return { hasKinks: false, kinkCount: 0 };
  }
}

/**
 * Applies a 10m inner buffer to eliminate boundary edge pixel contamination
 * (Sentinel-2 10m resolution pixels on plot perimeter)
 */
export function computeInnerBufferPolygon(
  polygon: Feature<Polygon>,
  bufferMeters = -10
): {
  bufferPolygon: Feature<Polygon> | null;
  originalAreaM2: number;
  bufferedAreaM2: number;
  effectivePixels: number; // 1 pixel = 10m x 10m = 100m²
  isInsufficientData: boolean; // < 8 pixels flag
  utmZone: number;
} {
  const originalAreaM2 = turf.area(polygon);
  const [cLon] = getPolygonCentroid(polygon);
  const { zone: utmZone } = getUtmZoneForLon(cLon);

  try {
    const buffered = turf.buffer(polygon, bufferMeters, { units: 'meters' });
    if (!buffered || !buffered.geometry) {
      return {
        bufferPolygon: null,
        originalAreaM2,
        bufferedAreaM2: 0,
        effectivePixels: 0,
        isInsufficientData: true,
        utmZone,
      };
    }

    let polyFeature: Feature<Polygon> | null = null;
    if (buffered.geometry.type === 'Polygon') {
      polyFeature = buffered as Feature<Polygon>;
    } else if (buffered.geometry.type === 'MultiPolygon' && buffered.geometry.coordinates.length > 0) {
      polyFeature = turf.polygon(buffered.geometry.coordinates[0]);
    }

    const bufferedAreaM2 = polyFeature ? turf.area(polyFeature) : 0;
    const effectivePixels = Math.max(0, bufferedAreaM2 / 100.0);
    const isInsufficientData = effectivePixels < 8.0;

    return {
      bufferPolygon: polyFeature,
      originalAreaM2,
      bufferedAreaM2,
      effectivePixels,
      isInsufficientData,
      utmZone,
    };
  } catch {
    return {
      bufferPolygon: null,
      originalAreaM2,
      bufferedAreaM2: 0,
      effectivePixels: 0,
      isInsufficientData: true,
      utmZone,
    };
  }
}

/**
 * Validates whether GPS coordinates fall strictly inside a GeoJSON Polygon
 */
export function checkPointInsidePolygon(
  lat: number,
  lon: number,
  polygon: Feature<Polygon>
): {
  inside: boolean;
  distanceMeters: number;
} {
  const pt = turf.point([lon, lat]);
  const inside = turf.booleanPointInPolygon(pt, polygon);

  if (inside) {
    return { inside: true, distanceMeters: 0 };
  }

  // Calculate distance in meters from point to polygon boundary
  const line = turf.polygonToLine(polygon);
  const lineFeature = Array.isArray(line) ? line[0] : line;
  const distanceKm = turf.pointToLineDistance(pt, lineFeature as any, { units: 'kilometers' });
  const distanceMeters = Math.round(distanceKm * 1000);

  return {
    inside: false,
    distanceMeters,
  };
}

/**
 * Calculates overlap percentage between two polygons: Area(A ∩ B) / Area(A ∪ B)
 */
export function calculatePolygonOverlap(
  polyA: Feature<Polygon>,
  polyB: Feature<Polygon>
): {
  overlapAreaM2: number;
  unionAreaM2: number;
  overlapPct: number;
  isFlagged: boolean;
} {
  try {
    const intersection = turf.intersect(turf.featureCollection([polyA, polyB]));
    if (!intersection) {
      return { overlapAreaM2: 0, unionAreaM2: turf.area(polyA) + turf.area(polyB), overlapPct: 0, isFlagged: false };
    }

    const overlapAreaM2 = turf.area(intersection);
    const areaA = turf.area(polyA);
    const areaB = turf.area(polyB);
    const unionAreaM2 = areaA + areaB - overlapAreaM2;
    const overlapPct = unionAreaM2 > 0 ? (overlapAreaM2 / unionAreaM2) * 100 : 0;

    return {
      overlapAreaM2,
      unionAreaM2,
      overlapPct: Number(overlapPct.toFixed(2)),
      isFlagged: overlapPct > 5.0,
    };
  } catch {
    return { overlapAreaM2: 0, unionAreaM2: turf.area(polyA) + turf.area(polyB), overlapPct: 0, isFlagged: false };
  }
}

/**
 * Generates an exact 10m x 10m pixel grid covering a polygon bbox
 */
export function generate10mPixelGrid(polygon: Feature<Polygon>): Feature<Polygon>[] {
  const bbox = turf.bbox(polygon);
  // 10 meters in degrees is roughly 0.00009 degrees
  const cellSide = 0.01; // km -> 10m
  const grid = turf.squareGrid(bbox, cellSide, { units: 'kilometers' });
  const intersectingCells: Feature<Polygon>[] = [];

  for (const cell of grid.features) {
    if (turf.booleanIntersects(cell, polygon)) {
      intersectingCells.push(cell as Feature<Polygon>);
    }
  }

  return intersectingCells;
}
