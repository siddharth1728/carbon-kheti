import { Feature, Polygon } from 'geojson';

export type PlotStatus = 'clear' | 'needs_review' | 'on_hold' | 'insufficient_data';

export interface TimeSeriesPoint {
  month: string;
  monthIdx: number;
  year: number;
  ndvi: number | null; // null if obscured by cloud
  cloudProbability: number; // 0.0 to 1.0
  isCloudObscured: boolean;
  radarVhDb: number; // Sentinel-1 SAR VH backscatter (-18 dB to -8 dB)
}

export interface EvidencePhoto {
  id: string;
  type: 'corner_a' | 'corner_b' | 'corner_c' | 'corner_d' | 'canopy';
  fileName: string;
  fileSizeBytes: number;
  sha256: string;
  perceptualHash: string; // dHash / aHash string
  timestamp: string;
  gps: {
    lat: number;
    lon: number;
    accuracyMeters: number;
  } | null;
  cameraMakeModel: string | null;
  status: 'passed' | 'flagged';
  flagReason?: string;
  humanResolutionGuidance?: string;
}

export interface FraudFlag {
  id: string;
  ruleId: string;
  ruleTitle: string;
  severity: 'high' | 'medium' | 'low';
  triggered: boolean;
  message: string;
  resolutionGuidance: string;
  technicalDetails?: Record<string, unknown>;
}

export interface PlotData {
  id: string;
  name: string;
  farmerName: string;
  phone: string;
  district: string;
  mandal: string;
  village: string;
  passbookNo: string;
  species: string[];
  plantingYear: number;
  lat: number;
  lon: number;
  polygon: Feature<Polygon>;
  areaM2: number;
  areaHa: number;
  areaAcres: number;
  effectivePixels: number; // Pixels after 10m inner buffer
  usableInnerPixels: number;
  treeCountEstimated: number;
  canopyHeightM: number; // GEDI / ICESat-2 canopy height estimate
  opticalScenesTotal: number;
  opticalScenesUsable: number;
  radarScenesUsable: number;
  timeSeriesY1: TimeSeriesPoint[];
  timeSeriesY2: TimeSeriesPoint[];
  status: PlotStatus;
  holdReason?: string;
  resolutionSteps?: string;
  evidencePhotos: EvidencePhoto[];
  flags: FraudFlag[];
}
