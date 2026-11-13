export type FarmerAppStep =
  | 'welcome'
  | 'consent'
  | 'register_plot'
  | 'capture_evidence'
  | 'processing'
  | 'results'
  | 'timeline';

export type CompassSlotId =
  | 'dir_n'
  | 'dir_ne'
  | 'dir_e'
  | 'dir_se'
  | 'dir_s'
  | 'dir_sw'
  | 'dir_w'
  | 'dir_nw'
  | 'canopy_up'
  | 'ground_close';

export interface WitnessDetails {
  name: string;
  phone: string;
  role: 'FPO Volunteer' | 'Village Revenue Officer' | 'Community Elder';
  signatureOrThumb: string;
}

export interface FarmerConsentState {
  agreed: boolean;
  timestamp: string | null;
  consentMethod: 'drawn_signature' | 'thumb_impression' | 'witnessed_press' | 'digital_acceptance';
  signature: string | null;
  thumbImage: string | null;
  version: string;
  witness: WitnessDetails | null;
  artifactHash: string | null;
}

export interface FarmerPhotoUpload {
  slotId: CompassSlotId;
  label: string;
  targetHeadingDeg: number;
  file?: File;
  previewUrl?: string;
  fileName: string;
  fileSizeBytes: number;
  sha256: string;
  perceptualHash: string;
  exif: {
    lat: number | null;
    lon: number | null;
    timestamp: string | null;
    cameraMake: string | null;
    cameraModel: string | null;
    gpsImgDirection: number | null;
    softwareTag: string | null;
  };
  sensorMetadata?: {
    accuracyMeters: number;
    tiltDeg: number;
    headingDeg: number;
    deviceModel: string;
    deviceSignatureHex: string;
  };
  confidenceTag: 'high_sensor_locked' | 'lower_confidence_manual' | 'lower_confidence_gallery';
  inPolygon: boolean;
  status: 'passed' | 'flagged' | 'needs_review';
  flagReason?: string;
  resolutionGuidance?: string;
  excessGreenFraction?: number;
  elaSuspicionScore?: number;
}

export interface ProcessingStageStatus {
  id: string;
  labelKey: string;
  completed: boolean;
  current: boolean;
  outputSummary: string;
}

export interface ChaosModeState {
  offlineSimulated: boolean;
  gpsDeniedSimulated: boolean;
  sentinelOutageSimulated: boolean;
  slowApiSimulated: boolean;
}
