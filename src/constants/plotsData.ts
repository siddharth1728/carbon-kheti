import * as turf from '@turf/turf';
import { PlotData, TimeSeriesPoint } from '../types/plot';
import { computeInnerBufferPolygon } from '../core/geometry';

/**
 * Helper to construct GeoJSON rectangular/irregular polygon from centre coordinate and delta offsets
 */
function makePolygonFeature(
  centreLon: number,
  centreLat: number,
  deltaLon: number,
  deltaLat: number,
  properties: Record<string, unknown> = {}
) {
  const coords = [
    [
      [centreLon - deltaLon, centreLat - deltaLat],
      [centreLon + deltaLon, centreLat - deltaLat * 0.9],
      [centreLon + deltaLon * 0.95, centreLat + deltaLat],
      [centreLon - deltaLon * 0.9, centreLat + deltaLat * 1.05],
      [centreLon - deltaLon, centreLat - deltaLat],
    ],
  ];
  return turf.polygon(coords, properties);
}

// Generate dual-year 12-month synthetic time-series for Y1 and Y2
function generateDualYearSeries(
  baseNdviPeakY1: number,
  baseNdviPeakY2: number,
  baseVhDb: number,
  hasSevereMonsoonGap = false
): { y1: TimeSeriesPoint[]; y2: TimeSeriesPoint[] } {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Natural phenology curve for Telangana agroforestry (Kharif / Rabi peak in Oct-Nov)
  const phenoMultipliers = [0.65, 0.68, 0.60, 0.55, 0.62, 0.75, 0.85, 0.92, 0.98, 1.0, 0.95, 0.82];

  const buildYear = (year: number, peakNdvi: number) => {
    return months.map((month, idx) => {
      // Cloud probability peaks during South-West Monsoon (Jun - Sep)
      let cloudProb = idx >= 5 && idx <= 8 ? 0.78 : idx >= 4 && idx <= 9 ? 0.35 : 0.08;
      if (hasSevereMonsoonGap && idx >= 5 && idx <= 8) {
        cloudProb = 0.95; // Optical completely blinded by clouds
      }

      const isCloudObscured = cloudProb > 0.65;
      const ndvi = isCloudObscured ? null : Number((peakNdvi * phenoMultipliers[idx]).toFixed(2));
      const radarVhDb = Number((baseVhDb + (phenoMultipliers[idx] - 0.7) * 4.5).toFixed(1));

      return {
        month,
        monthIdx: idx,
        year,
        ndvi,
        cloudProbability: Number(cloudProb.toFixed(2)),
        isCloudObscured,
        radarVhDb,
      };
    });
  };

  return {
    y1: buildYear(2024, baseNdviPeakY1),
    y2: buildYear(2025, baseNdviPeakY2),
  };
}

// 1. Plot 1: Ranga Reddy Agroforestry Plot A (TS-RR-01) - Clean Verified
const poly1 = makePolygonFeature(78.4867, 17.085, 0.00048, 0.00052, { id: 'TS-RR-01' });
const buf1 = computeInnerBufferPolygon(poly1);
const series1 = generateDualYearSeries(0.62, 0.72, -12.5, false);

// 2. Plot 2: Medak Teak & Mango Orchard (TS-MDK-02) - Clean Verified
const poly2 = makePolygonFeature(78.18, 17.82, 0.00052, 0.00055, { id: 'TS-MDK-02' });
const buf2 = computeInnerBufferPolygon(poly2);
const series2 = generateDualYearSeries(0.66, 0.76, -11.8, false);

// 3. Plot 3: Sangareddy Small Plot (TS-SNG-03) - Edge Effect & Insufficient Inner Pixels (< 8)
const poly3 = makePolygonFeature(77.98, 17.585, 0.00018, 0.00019, { id: 'TS-SNG-03' });
const buf3 = computeInnerBufferPolygon(poly3);
const series3 = generateDualYearSeries(0.48, 0.54, -14.2, false);

// 4. Plot 4: Warangal Monsoon-Gapped Plot (TS-WGL-04) - Radar Fallback Active
const poly4 = makePolygonFeature(79.68, 17.925, 0.00046, 0.0005, { id: 'TS-WGL-04' });
const buf4 = computeInnerBufferPolygon(poly4);
const series4 = generateDualYearSeries(0.58, 0.65, -12.1, true);

// 5. Plot 5: Nizamabad Overlapping Plot (TS-NZB-05) - On Hold (18.4% overlap)
const poly5 = makePolygonFeature(78.21, 18.58, 0.00049, 0.00053, { id: 'TS-NZB-05' });
const buf5 = computeInnerBufferPolygon(poly5);
const series5 = generateDualYearSeries(0.6, 0.68, -12.0, false);

// Adjacent plot for overlap comparison
export const NZB_ADJACENT_POLYGON = makePolygonFeature(78.2104, 18.5805, 0.00049, 0.00053, {
  id: 'TS-NZB-05-ADJ',
  farmer: 'Srinivas Goud',
});

// 6. Plot 6: Khammam Fake-Photo Claim Plot (TS-KMM-06) - On Hold (Mismatch & Outside EXIF)
const poly6 = makePolygonFeature(80.02, 17.28, 0.00047, 0.00051, { id: 'TS-KMM-06' });
const buf6 = computeInnerBufferPolygon(poly6);
const series6 = generateDualYearSeries(0.26, 0.29, -16.2, false);

export const TELANGANA_PLOTS: Record<string, PlotData> = {
  'TS-RR-01': {
    id: 'TS-RR-01',
    name: 'Kandukur Agroforestry Boundary Plot',
    farmerName: 'Ramesh Patel',
    phone: '+91 98490 28141',
    district: 'Ranga Reddy',
    mandal: 'Kandukur',
    village: 'Pulimamidi',
    passbookNo: 'TS/RR/2023/89201',
    species: ['Teak (టేకు)', 'Subabul (సుబాబుల్)'],
    plantingYear: 2021,
    lat: 17.085,
    lon: 78.4867,
    polygon: poly1,
    areaM2: buf1.originalAreaM2,
    areaHa: Number((buf1.originalAreaM2 / 10000).toFixed(2)),
    areaAcres: Number(((buf1.originalAreaM2 / 10000) * 2.47105).toFixed(2)),
    effectivePixels: buf1.effectivePixels,
    usableInnerPixels: Math.floor(buf1.effectivePixels),
    treeCountEstimated: 240,
    canopyHeightM: 7.2,
    opticalScenesTotal: 24,
    opticalScenesUsable: 20,
    radarScenesUsable: 24,
    timeSeriesY1: series1.y1,
    timeSeriesY2: series1.y2,
    status: 'clear',
    evidencePhotos: [
      {
        id: 'p-rr-01',
        type: 'corner_a',
        fileName: 'corner_a_northeast_pulimamidi.jpg',
        fileSizeBytes: 2481920,
        sha256: '9f82d1c4e7b3a10582d9014e28f109bc489201e74182f09a128e04b91048291a',
        perceptualHash: 'c4e2f1a8b90142e8',
        timestamp: '2025-10-22T09:42:15Z',
        gps: { lat: 17.0852, lon: 78.4869, accuracyMeters: 4.2 },
        cameraMakeModel: 'Samsung Galaxy F14 5G',
        status: 'passed',
      },
    ],
    flags: [],
  },

  'TS-MDK-02': {
    id: 'TS-MDK-02',
    name: 'Kowdipally Teak & Mango Orchard',
    farmerName: 'Lakshmi Bai',
    phone: '+91 94401 77219',
    district: 'Medak',
    mandal: 'Kowdipally',
    village: 'Venkata Rao Peta',
    passbookNo: 'TS/MDK/2022/41029',
    species: ['Teak (టేకు)', 'Mango (మామిడి)'],
    plantingYear: 2020,
    lat: 17.82,
    lon: 78.18,
    polygon: poly2,
    areaM2: buf2.originalAreaM2,
    areaHa: Number((buf2.originalAreaM2 / 10000).toFixed(2)),
    areaAcres: Number(((buf2.originalAreaM2 / 10000) * 2.47105).toFixed(2)),
    effectivePixels: buf2.effectivePixels,
    usableInnerPixels: Math.floor(buf2.effectivePixels),
    treeCountEstimated: 310,
    canopyHeightM: 8.4,
    opticalScenesTotal: 24,
    opticalScenesUsable: 21,
    radarScenesUsable: 24,
    timeSeriesY1: series2.y1,
    timeSeriesY2: series2.y2,
    status: 'clear',
    evidencePhotos: [],
    flags: [],
  },

  'TS-SNG-03': {
    id: 'TS-SNG-03',
    name: 'Kondapur Marginal Holding (Edge Effect)',
    farmerName: 'Mallesh Goud',
    phone: '+91 99890 31405',
    district: 'Sangareddy',
    mandal: 'Kondapur',
    village: 'Mallepally',
    passbookNo: 'TS/SNG/2024/11048',
    species: ['Subabul (సుబాబుల్)'],
    plantingYear: 2022,
    lat: 17.585,
    lon: 77.98,
    polygon: poly3,
    areaM2: buf3.originalAreaM2,
    areaHa: Number((buf3.originalAreaM2 / 10000).toFixed(2)),
    areaAcres: Number(((buf3.originalAreaM2 / 10000) * 2.47105).toFixed(2)),
    effectivePixels: buf3.effectivePixels,
    usableInnerPixels: Math.floor(buf3.effectivePixels),
    treeCountEstimated: 85,
    canopyHeightM: 5.1,
    opticalScenesTotal: 24,
    opticalScenesUsable: 19,
    radarScenesUsable: 24,
    timeSeriesY1: series3.y1,
    timeSeriesY2: series3.y2,
    status: 'insufficient_data',
    holdReason: 'Plot inner buffer contains fewer than 8 usable pixels (effective pixels = 4.8).',
    resolutionSteps:
      'Cluster boundary mapping with adjacent smallholders to aggregate >1.0 ha contiguous monitored agroforestry.',
    evidencePhotos: [],
    flags: [
      {
        id: 'flag-sng-pixels',
        ruleId: 'min-pixel-threshold',
        ruleTitle: 'Minimum Pixel Buffer Threshold',
        severity: 'medium',
        triggered: true,
        message: 'Plot area has only 4.8 usable 10m Sentinel pixels after 10m boundary buffer subtraction (< 8 px threshold).',
        resolutionGuidance: 'Cluster plot with adjacent farmer boundary to form an aggregated monitoring unit.',
      },
    ],
  },

  'TS-WGL-04': {
    id: 'TS-WGL-04',
    name: 'Geesugonda Heavy Monsoon Plot',
    farmerName: 'Kavitha Reddy',
    phone: '+91 97012 44109',
    district: 'Warangal',
    mandal: 'Geesugonda',
    village: 'Dharmaram',
    passbookNo: 'TS/WGL/2021/72190',
    species: ['Teak (టేకు)', 'Red Sanders (ఎర్రచందనం)'],
    plantingYear: 2019,
    lat: 17.925,
    lon: 79.68,
    polygon: poly4,
    areaM2: buf4.originalAreaM2,
    areaHa: Number((buf4.originalAreaM2 / 10000).toFixed(2)),
    areaAcres: Number(((buf4.originalAreaM2 / 10000) * 2.47105).toFixed(2)),
    effectivePixels: buf4.effectivePixels,
    usableInnerPixels: Math.floor(buf4.effectivePixels),
    treeCountEstimated: 260,
    canopyHeightM: 7.9,
    opticalScenesTotal: 24,
    opticalScenesUsable: 14, // < 16 triggers radar fallback
    radarScenesUsable: 24,
    timeSeriesY1: series4.y1,
    timeSeriesY2: series4.y2,
    status: 'needs_review',
    holdReason: 'Monsoon cloud persistence dropped usable optical scenes below 16. Radar fallback active with widened CI.',
    resolutionSteps: 'Verifier confirms Sentinel-1 SAR C-band VH dual-polarization backscatter trajectory corroboration.',
    evidencePhotos: [],
    flags: [
      {
        id: 'flag-wgl-radar',
        ruleId: 'sensor-fallback',
        ruleTitle: 'Optical Monsoon Dropout / Radar Fallback',
        severity: 'low',
        triggered: true,
        message: 'Optical Sentinel-2 scenes obscured during June-September (usable = 14/24). Radar fallback engaged with wider interval.',
        resolutionGuidance: 'No action required by farmer; radar backscatter seamlessly covers cloud gaps.',
      },
    ],
  },

  'TS-NZB-05': {
    id: 'TS-NZB-05',
    name: 'Dichpally Overlapping Farm Alpha',
    farmerName: 'Venkat Rao',
    phone: '+91 98480 61280',
    district: 'Nizamabad',
    mandal: 'Dichpally',
    village: 'Bardipur',
    passbookNo: 'TS/NZB/2023/33019',
    species: ['Teak (టేకు)', 'Mango (మామిడి)'],
    plantingYear: 2021,
    lat: 18.58,
    lon: 78.21,
    polygon: poly5,
    areaM2: buf5.originalAreaM2,
    areaHa: Number((buf5.originalAreaM2 / 10000).toFixed(2)),
    areaAcres: Number(((buf5.originalAreaM2 / 10000) * 2.47105).toFixed(2)),
    effectivePixels: buf5.effectivePixels,
    usableInnerPixels: Math.floor(buf5.effectivePixels),
    treeCountEstimated: 275,
    canopyHeightM: 6.8,
    opticalScenesTotal: 24,
    opticalScenesUsable: 20,
    radarScenesUsable: 24,
    timeSeriesY1: series5.y1,
    timeSeriesY2: series5.y2,
    status: 'on_hold',
    holdReason: 'Polygon intersects 18.4% with adjacent registered farm TS-NZB-05-ADJ (> 5.0% threshold).',
    resolutionSteps:
      'Farmer and neighbouring landholder must adjust shared boundary coordinates in the mobile app using surveyor GPS.',
    evidencePhotos: [],
    flags: [
      {
        id: 'flag-nzb-overlap',
        ruleId: 'polygon-overlap',
        ruleTitle: 'Polygon Overlap > 5% (Intersection / Union)',
        severity: 'high',
        triggered: true,
        message: 'Spatial intersection over union with plot TS-NZB-05-ADJ is 18.4%, exceeding the 5.0% maximum allowable threshold.',
        resolutionGuidance: 'Please redraw the western boundary or walk the ridge line with village revenue officer / field assistant.',
      },
    ],
  },

  'TS-KMM-06': {
    id: 'TS-KMM-06',
    name: 'Kusumanchi Discrepancy Claim Plot',
    farmerName: 'Sateesh Kumar',
    phone: '+91 96180 99401',
    district: 'Khammam',
    mandal: 'Kusumanchi',
    village: 'Palair',
    passbookNo: 'TS/KMM/2022/60412',
    species: ['Teak (టేకు)'],
    plantingYear: 2021,
    lat: 17.28,
    lon: 80.02,
    polygon: poly6,
    areaM2: buf6.originalAreaM2,
    areaHa: Number((buf6.originalAreaM2 / 10000).toFixed(2)),
    areaAcres: Number(((buf6.originalAreaM2 / 10000) * 2.47105).toFixed(2)),
    effectivePixels: buf6.effectivePixels,
    usableInnerPixels: Math.floor(buf6.effectivePixels),
    treeCountEstimated: 250,
    canopyHeightM: 3.2,
    opticalScenesTotal: 24,
    opticalScenesUsable: 19,
    radarScenesUsable: 24,
    timeSeriesY1: series6.y1,
    timeSeriesY2: series6.y2,
    status: 'on_hold',
    holdReason: 'Claimed dense teak canopy contradicted by flat optical NDVI (0.29) and EXIF GPS 3.8 km outside boundary.',
    resolutionSteps:
      'Field officer re-inspection required. Farmer must upload geotagged photo taken strictly inside plot boundary.',
    evidencePhotos: [],
    flags: [
      {
        id: 'flag-kmm-gps',
        ruleId: 'exif-gps',
        ruleTitle: 'EXIF GPS Inside Polygon Boundary',
        severity: 'high',
        triggered: true,
        message: 'Evidence photo EXIF GPS (17.2510°N, 80.0520°E) is 3.8 km outside registered plot boundary.',
        resolutionGuidance: 'Retake photo while standing directly at the boundary corner of the registered plot.',
      },
      {
        id: 'flag-kmm-mismatch',
        ruleId: 'claim-vs-satellite',
        ruleTitle: 'Claim vs Satellite Biomass Mismatch',
        severity: 'high',
        triggered: true,
        message: 'Farmer claims dense 3-year teak plantation, but Sentinel-2 NDVI peak is 0.29 and radar VH is -16.2 dB (barren/scrubland baseline).',
        resolutionGuidance: 'Field auditor ground-truth inspection scheduled before any verification can proceed.',
      },
    ],
  },
};
