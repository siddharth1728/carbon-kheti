import { create } from 'zustand';
import { PlotData, AppPersonaMode, VerifierTabId } from '../types';
import { TELANGANA_PLOTS } from '../constants/plotsData';
import { MRVCalculationResult } from '../types/mrv';
import { UnitEconomicsParams, UnitEconomicsResult } from '../types/economics';
import { AuditRecord, VerifyChainResult } from '../types/audit';
import {
  FarmerAppStep,
  FarmerConsentState,
  FarmerPhotoUpload,
  ProcessingStageStatus,
  CompassSlotId,
  ChaosModeState,
} from '../types/farmer';
import { SupportedLanguage } from '../i18n/translations';
import { computeMRV } from '../core/mrvEngine';
import { calculateUnitEconomics, DEFAULT_UNIT_ECONOMICS_PARAMS } from '../core/unitEconomics';
import { createGenesisBlock, appendAuditRecord, verifyAuditChain, INITIAL_GENESIS_RECORD } from '../core/cryptoEngine';
import {
  checkPointInsidePolygon,
  calculatePolygonOverlap,
  computeInnerBufferPolygon,
  convertM2ToHa,
  convertM2ToAcres,
  simplifyGpsTrack,
  checkSelfIntersection,
  getUtmZoneForLon,
} from '../core/geometry';
import { analyzePhotoEvidenceComprehensive } from '../core/photoAnalysis';
import { UserSession, attemptLogin, attemptThumbprintLogin } from '../core/authEngine';
import * as turf from '@turf/turf';

export const COMPASS_SLOTS: { id: CompassSlotId; label: string; headingDeg: number }[] = [
  { id: 'dir_n', label: 'North (0°)', headingDeg: 0 },
  { id: 'dir_ne', label: 'North-East (45°)', headingDeg: 45 },
  { id: 'dir_e', label: 'East (90°)', headingDeg: 90 },
  { id: 'dir_se', label: 'South-East (135°)', headingDeg: 135 },
  { id: 'dir_s', label: 'South (180°)', headingDeg: 180 },
  { id: 'dir_sw', label: 'South-West (225°)', headingDeg: 225 },
  { id: 'dir_w', label: 'West (270°)', headingDeg: 270 },
  { id: 'dir_nw', label: 'North-West (315°)', headingDeg: 315 },
  { id: 'canopy_up', label: 'Canopy Zenith', headingDeg: 0 },
  { id: 'ground_close', label: 'Ground Nadir', headingDeg: 180 },
];

interface GuidedDemoState {
  isActive: boolean;
  currentStep: number;
  isPlaying: boolean;
  totalSteps: number;
}

export interface WalkState {
  isWalking: boolean;
  coordinates: [number, number][]; // [lon, lat]
  distanceWalkedM: number;
  currentAccuracyM: number;
  hasKinks: boolean;
  canClose: boolean;
  calculatedAreaM2: number;
  calculatedAreaHa: number;
  calculatedAreaAcres: number;
  effectivePixels: number;
  utmZone: number;
  isBelowMinimum: boolean;
}

interface MRVStoreState {
  // Authentication & RBAC
  currentUser: UserSession | null;
  login: (phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithThumbprint: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // App Navigation & Persona
  personaMode: AppPersonaMode;
  setPersonaMode: (mode: AppPersonaMode) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;

  // Active Selected Plot
  selectedPlotId: string;
  setSelectedPlotId: (id: string) => void;
  plots: Record<string, PlotData>;
  currentPlot: PlotData;
  currentMRV: MRVCalculationResult;

  // Verifier Navigation
  verifierTab: VerifierTabId;
  setVerifierTab: (tab: VerifierTabId) => void;
  showTheMathDrawer: boolean;
  setShowTheMathDrawer: (show: boolean) => void;

  // Unit Economics
  economicsParams: UnitEconomicsParams;
  setEconomicsParams: (params: Partial<UnitEconomicsParams>) => void;
  economicsResult: UnitEconomicsResult;

  // Cryptographic Audit Chain
  auditChain: AuditRecord[];
  verifyChainResult: VerifyChainResult | null;
  isChainVerified: boolean;
  verifyChain: () => Promise<void>;
  tamperRecord: (index?: number) => Promise<void>;
  restoreDemoState: () => Promise<void>;
  addAuditRecord: (
    action: string,
    actor: string,
    details: Record<string, unknown>
  ) => Promise<AuditRecord>;

  // Stress Tests & Overrides
  forceCloudySeason: boolean;
  setForceCloudySeason: (cloudy: boolean) => void;
  adversarialStatus: string | null;
  setAdversarialStatus: (status: string | null) => void;
  runAdversarialAttack: (attackType: string) => Promise<void>;

  // Farmer App State
  farmerStep: FarmerAppStep;
  setFarmerStep: (step: FarmerAppStep) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  offlineQueueCount: number;
  farmerConsent: FarmerConsentState;
  setFarmerConsent: (consent: Partial<FarmerConsentState>) => void;

  // 10-Slot Compass Guided Evidence
  farmerPhotos: Record<string, FarmerPhotoUpload>;
  uploadFarmerPhoto: (slotId: CompassSlotId, file: File, headingUsed?: number) => Promise<void>;
  useSampleFarmerPhoto: (slotId: CompassSlotId, sampleVariant: 'good' | 'outside' | 'duplicate' | 'no_gps' | 'edited') => Promise<void>;
  processingStages: ProcessingStageStatus[];
  startFarmerSubmissionPipeline: () => Promise<void>;

  // Walk The Boundary Demo
  walk: WalkState;
  startWalk: () => void;
  addWalkPoint: (coord: [number, number], accuracyM: number) => void;
  closeWalkLoop: () => void;
  resetWalk: () => void;
  simulateWalkReplay: (variant: 'standard_1ha' | 'small_micro') => void;

  // Reviewer Queue in Verifier Console
  reviewAction: (slotId: string, action: 'Accept' | 'Request retake' | 'Reject', reason: string) => Promise<void>;

  // Chaos Engineering Panel
  chaos: ChaosModeState;
  toggleChaos: (flag: keyof ChaosModeState) => void;

  // Guided Demo Mode (4-Minute Tour)
  guidedDemo: GuidedDemoState;
  startGuidedDemo: () => void;
  stopGuidedDemo: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  toggleDemoPlay: () => void;

  // Modals
  methodsModalOpen: boolean;
  setMethodsModalOpen: (open: boolean) => void;
}

export const useMRVStore = create<MRVStoreState>((set, get) => {
  const initialPlot = TELANGANA_PLOTS['TS-RR-01'];
  const initialMRV = computeMRV(initialPlot);
  const initialEcon = calculateUnitEconomics(DEFAULT_UNIT_ECONOMICS_PARAMS);

  // Initialize 10 Photo Slots
  const initialPhotos: Record<string, FarmerPhotoUpload> = {};
  COMPASS_SLOTS.forEach((slot) => {
    initialPhotos[slot.id] = {
      slotId: slot.id,
      label: slot.label,
      targetHeadingDeg: slot.headingDeg,
      fileName: '',
      fileSizeBytes: 0,
      sha256: '',
      perceptualHash: '',
      exif: {
        lat: null,
        lon: null,
        timestamp: null,
        cameraMake: null,
        cameraModel: null,
        gpsImgDirection: null,
        softwareTag: null,
      },
      confidenceTag: 'high_sensor_locked',
      inPolygon: false,
      status: 'needs_review',
    };
  });

  return {
    // Auth & RBAC
    currentUser: null,
    login: async (phone, pass) => {
      const res = await attemptLogin(phone, pass);
      if (res.success && res.session) {
        set({ currentUser: res.session });
        if (res.session.role === 'farmer') {
          set({ personaMode: 'farmer', selectedPlotId: 'TS-RR-01', farmerStep: 'consent' });
        } else if (res.session.role === 'buyer') {
          set({ personaMode: 'public_verify' });
        } else {
          set({ personaMode: 'verifier' });
        }
        return { success: true };
      }
      return { success: false, error: res.error };
    },
    loginWithThumbprint: async () => {
      const res = await attemptThumbprintLogin();
      if (res.success && res.session) {
        set({
          currentUser: res.session,
          personaMode: 'farmer',
          selectedPlotId: 'TS-RR-01',
          farmerStep: 'consent',
        });
        return { success: true };
      }
      return { success: false, error: res.error || 'Biometric verification failed.' };
    },
    logout: () => {
      set({ currentUser: null, personaMode: 'farmer', farmerStep: 'welcome' });
    },

    personaMode: 'farmer',
    setPersonaMode: (mode) => set({ personaMode: mode }),
    language: 'en',
    setLanguage: (lang) => set({ language: lang }),

    selectedPlotId: 'TS-RR-01',
    plots: { ...TELANGANA_PLOTS },
    currentPlot: initialPlot,
    currentMRV: initialMRV,

    setSelectedPlotId: (id) => {
      const plot = get().plots[id] || TELANGANA_PLOTS['TS-RR-01'];
      const mrv = computeMRV(plot, undefined, get().forceCloudySeason);
      set({
        selectedPlotId: id,
        currentPlot: plot,
        currentMRV: mrv,
      });
    },

    verifierTab: 'overview',
    setVerifierTab: (tab) => set({ verifierTab: tab }),
    showTheMathDrawer: false,
    setShowTheMathDrawer: (show) => set({ showTheMathDrawer: show }),

    economicsParams: DEFAULT_UNIT_ECONOMICS_PARAMS,
    setEconomicsParams: (newParams) => {
      const updated = { ...get().economicsParams, ...newParams };
      const result = calculateUnitEconomics(updated);
      set({ economicsParams: updated, economicsResult: result });
    },
    economicsResult: initialEcon,

    auditChain: [INITIAL_GENESIS_RECORD],
    verifyChainResult: {
      valid: true,
      brokenIdx: -1,
      totalChecked: 1,
      recomputedRootHash: INITIAL_GENESIS_RECORD.currentHash,
      verificationTimestamp: new Date().toISOString(),
    },
    isChainVerified: true,

    addAuditRecord: async (action, actor, details) => {
      const currentChain = get().auditChain.length > 0 ? get().auditChain : [INITIAL_GENESIS_RECORD];
      const newRecord = await appendAuditRecord(currentChain, action, actor, details);
      set({
        auditChain: [...currentChain, newRecord],
        isChainVerified: false,
      });
      return newRecord;
    },

    verifyChain: async () => {
      const result = await verifyAuditChain(get().auditChain);
      set({
        verifyChainResult: result,
        isChainVerified: result.valid,
      });
    },

    tamperRecord: async (index) => {
      const chain = [...get().auditChain];
      const targetIdx = index !== undefined ? index : chain.length > 1 ? 1 : 0;
      if (chain[targetIdx]) {
        chain[targetIdx] = {
          ...chain[targetIdx],
          details: {
            ...chain[targetIdx].details,
            unauthorizedTamperedCredits: 9999,
            tamperNotice: 'Payload altered without cryptographic re-signing',
          },
        };
      }
      set({
        auditChain: chain,
        verifyChainResult: null,
        isChainVerified: false,
        adversarialStatus: `Record #${targetIdx} payload was silently modified in memory. Click "VERIFY CHAIN" to detect the broken hash!`,
      });
    },

    restoreDemoState: async () => {
      const genesis = await createGenesisBlock();
      const cleanPlots = { ...TELANGANA_PLOTS };
      const currentPlot = cleanPlots['TS-RR-01'];
      const currentMRV = computeMRV(currentPlot);

      set({
        plots: cleanPlots,
        selectedPlotId: 'TS-RR-01',
        currentPlot,
        currentMRV,
        auditChain: [genesis],
        verifyChainResult: {
          valid: true,
          brokenIdx: -1,
          totalChecked: 1,
          recomputedRootHash: genesis.currentHash,
          verificationTimestamp: new Date().toISOString(),
        },
        isChainVerified: true,
        adversarialStatus: 'Pristine demo state restored. Cryptographic audit chain reset to Genesis.',
      });
    },

    forceCloudySeason: false,
    setForceCloudySeason: (cloudy) => {
      set({ forceCloudySeason: cloudy });
      const mrv = computeMRV(get().currentPlot, undefined, cloudy);
      set({ currentMRV: mrv });
    },
    adversarialStatus: null,
    setAdversarialStatus: (status) => set({ adversarialStatus: status }),

    runAdversarialAttack: async (attackType) => {
      const { currentPlot, auditChain, plots } = get();

      switch (attackType) {
        case 'gps_outside': {
          const badLat = currentPlot.lat + 0.035;
          const badLon = currentPlot.lon + 0.038;
          const check = checkPointInsidePolygon(badLat, badLon, currentPlot.polygon);

          const updated = await appendAuditRecord(
            auditChain,
            'PHOTO_REJECTED_OUT_OF_BOUNDS',
            'ADVERSARIAL_SIMULATOR',
            {
              plotId: currentPlot.id,
              injectedGps: [badLat, badLon],
              distanceMeters: Math.round(check.distanceMeters),
              verdict: 'REJECTED_HIGH_SEVERITY',
            }
          );

          set({
            auditChain: [...auditChain, updated],
            isChainVerified: false,
            adversarialStatus: `Caught Live: Injected EXIF GPS (${badLat.toFixed(4)}°N, ${badLon.toFixed(4)}°E) is ${Math.round(check.distanceMeters)}m outside plot boundary! Plot put on hold.`,
          });
          break;
        }

        case 'duplicate_photo': {
          const updated = await appendAuditRecord(
            auditChain,
            'PHOTO_REJECTED_DUPLICATE_HASH',
            'ADVERSARIAL_SIMULATOR',
            {
              plotId: currentPlot.id,
              sha256: '9f82d1c4e7b3a10582d9014e28f109bc489201e74182f09a128e04b91048291a',
              matchedPlot: 'TS-RR-01',
              verdict: 'REJECTED_HIGH_SEVERITY',
            }
          );

          set({
            auditChain: [...auditChain, updated],
            isChainVerified: false,
            adversarialStatus: 'Caught Live: Photo SHA-256 byte digest matches existing photo submitted for TS-RR-01! Evidence rejected.',
          });
          break;
        }

        case 'polygon_overlap': {
          const adjPlot = plots['TS-NZB-05'];
          const target = plots['TS-RR-05'];
          const overlap = calculatePolygonOverlap(target.polygon, adjPlot.polygon);

          const updated = await appendAuditRecord(
            auditChain,
            'PLOT_REGISTRATION_FLAGGED_OVERLAP',
            'ADVERSARIAL_SIMULATOR',
            {
              plotId: target.id,
              adjacentPlotId: adjPlot.id,
              overlapPct: Number(overlap.overlapPct.toFixed(1)),
              thresholdPct: 5.0,
              verdict: 'ON_HOLD',
            }
          );

          set({
            auditChain: [...auditChain, updated],
            isChainVerified: false,
            adversarialStatus: `Caught Live: Proposed boundary overlaps ${overlap.overlapPct.toFixed(1)}% with adjacent registered farm (> 5.0% threshold). Plot placed On Hold.`,
          });
          break;
        }

        case 'tamper_log': {
          await get().tamperRecord(1);
          break;
        }

        case 'cloudy_season': {
          const cloudy = !get().forceCloudySeason;
          get().setForceCloudySeason(cloudy);
          set({
            adversarialStatus: cloudy
              ? 'Cloudy Season Engaged: 8 optical scenes obscured during monsoon. Radar fallback active; bootstrap CI visibly widened.'
              : 'Clear Sky Restored: Optical Sentinel-2 primary imagery re-established.',
          });
          break;
        }

        default:
          break;
      }
    },

    // Farmer App State
    farmerStep: 'welcome',
    setFarmerStep: (step) => set({ farmerStep: step }),
    isOffline: false,
    setIsOffline: (offline) => set({ isOffline: offline }),
    offlineQueueCount: 0,

    farmerConsent: {
      agreed: true,
      timestamp: '2026-11-12T08:05:00.000Z',
      consentMethod: 'digital_acceptance',
      signature: null,
      thumbImage: null,
      version: 'v1.2-FPIC-TELANGANA',
      witness: {
        name: 'Anil Kumar (FPO Lead)',
        phone: '+919848011223',
        role: 'FPO Volunteer',
        signatureOrThumb: 'witness_verified',
      },
      artifactHash: 'c79b5c2a110e53a29014e28f109bc489201e74182f09a128e04b91048291ade8',
    },
    setFarmerConsent: (consent) =>
      set({ farmerConsent: { ...get().farmerConsent, ...consent } }),

    farmerPhotos: initialPhotos,

    uploadFarmerPhoto: async (slotId, file, headingUsed) => {
      const { currentPlot } = get();
      const slotDef = COMPASS_SLOTS.find((s) => s.id === slotId) || COMPASS_SLOTS[0];
      const existing = Object.values(get().farmerPhotos).map((p) => ({
        sha256: p.sha256,
        perceptualHash: p.perceptualHash,
        plotId: currentPlot.id,
      }));

      const res = await analyzePhotoEvidenceComprehensive(
        file,
        currentPlot.polygon,
        slotDef.headingDeg,
        currentPlot.timeSeriesY2[0]?.ndvi || 0.45,
        existing,
        slotDef.label
      );

      const photoUpload: FarmerPhotoUpload = {
        slotId,
        label: slotDef.label,
        targetHeadingDeg: slotDef.headingDeg,
        file,
        previewUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSizeBytes: file.size,
        sha256: res.sha256,
        perceptualHash: res.perceptualHash,
        exif: {
          lat: res.exif.lat,
          lon: res.exif.lon,
          timestamp: res.exif.timestamp,
          cameraMake: res.exif.cameraMakeModel ? res.exif.cameraMakeModel.split(' ')[0] : 'Camera',
          cameraModel: res.exif.cameraMakeModel ? res.exif.cameraMakeModel.split(' ').slice(1).join(' ') : 'Mobile',
          gpsImgDirection: res.exif.gpsImgDirection || headingUsed || null,
          softwareTag: res.exif.softwareTag,
        },
        sensorMetadata: {
          accuracyMeters: 4.2,
          tiltDeg: 12.0,
          headingDeg: headingUsed || slotDef.headingDeg,
          deviceModel: res.exif.cameraMakeModel || 'Mobile Device',
          deviceSignatureHex: 'ed25519_dev_sig_' + res.sha256.substring(0, 16),
        },
        confidenceTag: headingUsed !== undefined ? 'high_sensor_locked' : 'lower_confidence_manual',
        inPolygon: res.checks.gpsInsidePolygon.passed,
        status: res.overallStatus,
        flagReason: res.summaryReason,
        resolutionGuidance: 'Keep phone level, ensure camera geotagging is enabled.',
        excessGreenFraction: res.checks.vegetationConsistency.excessGreenFraction,
        elaSuspicionScore: res.checks.elaSuspicion.suspicionScore,
      };

      set({
        farmerPhotos: {
          ...get().farmerPhotos,
          [slotId]: photoUpload,
        },
      });
    },

    useSampleFarmerPhoto: async (slotId, sampleVariant) => {
      const { currentPlot } = get();
      const slotDef = COMPASS_SLOTS.find((s) => s.id === slotId) || COMPASS_SLOTS[0];
      const isGood = sampleVariant === 'good';
      const isOutside = sampleVariant === 'outside';
      const isDuplicate = sampleVariant === 'duplicate';
      const isNoGps = sampleVariant === 'no_gps';
      const isEdited = sampleVariant === 'edited';

      const lat = isOutside ? currentPlot.lat + 0.045 : isNoGps ? null : currentPlot.lat + 0.0003;
      const lon = isOutside ? currentPlot.lon + 0.048 : isNoGps ? null : currentPlot.lon + 0.0003;

      const photoUpload: FarmerPhotoUpload = {
        slotId,
        label: slotDef.label,
        targetHeadingDeg: slotDef.headingDeg,
        fileName: `sample_${sampleVariant}_${slotId}.jpg`,
        fileSizeBytes: 2450000,
        sha256: isDuplicate
          ? 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
          : `sample_hash_${sampleVariant}_${slotId}`,
        perceptualHash: isDuplicate ? 'f0e1d2c3b4a59687' : 'a1b2c3d4e5f60718',
        exif: {
          lat,
          lon,
          timestamp: new Date().toISOString(),
          cameraMake: 'Samsung',
          cameraModel: 'Galaxy M34',
          gpsImgDirection: slotDef.headingDeg,
          softwareTag: isEdited ? 'Adobe Photoshop CC 2025' : null,
        },
        sensorMetadata: {
          accuracyMeters: isGood ? 4.5 : 28.0,
          tiltDeg: 5.0,
          headingDeg: slotDef.headingDeg,
          deviceModel: 'Samsung Galaxy M34',
          deviceSignatureHex: 'ed25519_dev_mock_sig',
        },
        confidenceTag: isGood ? 'high_sensor_locked' : 'lower_confidence_manual',
        inPolygon: isGood,
        status: isGood ? 'passed' : 'flagged',
        flagReason: isOutside
          ? 'Coordinates fall 4.2 km outside registered farm perimeter.'
          : isDuplicate
          ? 'Duplicate byte match with existing plot TS-RR-01.'
          : isNoGps
          ? 'EXIF location metadata stripped or unavailable.'
          : isEdited
          ? 'Editing software tag detected (Adobe Photoshop).'
          : undefined,
        resolutionGuidance: 'Retake photo within boundary with native camera.',
        excessGreenFraction: isGood ? 0.48 : 0.12,
        elaSuspicionScore: isEdited ? 0.85 : 0.15,
      };

      set({
        farmerPhotos: {
          ...get().farmerPhotos,
          [slotId]: photoUpload,
        },
      });
    },

    processingStages: [
      { id: 's2', labelKey: 'farmerApp.stage1', completed: false, current: true, outputSummary: 'Pulling Sentinel-2 Level-2A BOA reflectance' },
      { id: 'cloud', labelKey: 'farmerApp.stage2', completed: false, current: false, outputSummary: 'Scene Classification Layer (SCL) probability mask' },
      { id: 'radar', labelKey: 'farmerApp.stage3', completed: false, current: false, outputSummary: 'Sentinel-1 C-Band SAR VH backscatter fallback' },
      { id: 'lidar', labelKey: 'farmerApp.stage4', completed: false, current: false, outputSummary: 'NASA GEDI L4A / ICESat-2 LiDAR canopy height calibration' },
      { id: 'bootstrap', labelKey: 'farmerApp.stage5', completed: false, current: false, outputSummary: '1,000x spatial paired bootstrap delta dAGB' },
      { id: 'fraud', labelKey: 'farmerApp.stage6', completed: false, current: false, outputSummary: 'EXIF, duplicate, overlap and canopy consistency scan' },
      { id: 'seal', labelKey: 'farmerApp.stage7', completed: false, current: false, outputSummary: 'SHA-256 canonical digest sealed in audit ledger' },
    ],

    startFarmerSubmissionPipeline: async () => {
      set({ farmerStep: 'processing' });
      const stages = get().processingStages;

      for (let i = 0; i < stages.length; i++) {
        await new Promise((r) => setTimeout(r, 650));
        set({
          processingStages: stages.map((st, idx) => ({
            ...st,
            completed: idx < i,
            current: idx === i,
          })),
        });
      }

      // Mark all completed
      set({
        processingStages: stages.map((st) => ({
          ...st,
          completed: true,
          current: false,
        })),
        farmerStep: 'results',
      });
    },

    // Walk The Boundary Demo
    walk: {
      isWalking: false,
      coordinates: [],
      distanceWalkedM: 0,
      currentAccuracyM: 5.0,
      hasKinks: false,
      canClose: false,
      calculatedAreaM2: 0,
      calculatedAreaHa: 0,
      calculatedAreaAcres: 0,
      effectivePixels: 0,
      utmZone: 44,
      isBelowMinimum: false,
    },

    startWalk: () => {
      set({
        walk: {
          isWalking: true,
          coordinates: [],
          distanceWalkedM: 0,
          currentAccuracyM: 4.0,
          hasKinks: false,
          canClose: false,
          calculatedAreaM2: 0,
          calculatedAreaHa: 0,
          calculatedAreaAcres: 0,
          effectivePixels: 0,
          utmZone: 44,
          isBelowMinimum: false,
        },
      });
    },

    addWalkPoint: (coord, accuracyM) => {
      const walk = get().walk;
      if (!walk.isWalking) return;

      // Filter: discard fixes worse than 20m
      if (accuracyM > 20) return;

      const coords = [...walk.coordinates];
      if (coords.length > 0) {
        const last = coords[coords.length - 1];
        const distKm = turf.distance(turf.point(last), turf.point(coord), { units: 'kilometers' });
        const distM = distKm * 1000;
        // Suppress jitter below 1.5m
        if (distM < 1.5) return;

        coords.push(coord);
        const newDistM = walk.distanceWalkedM + distM;

        // Auto-suggest closing if within 10m of start and at least 4 points
        const distToStartM = coords.length >= 4 ? turf.distance(turf.point(coord), turf.point(coords[0]), { units: 'kilometers' }) * 1000 : 999;
        const canClose = distToStartM <= 12.0 && coords.length >= 4;

        set({
          walk: {
            ...walk,
            coordinates: coords,
            distanceWalkedM: Math.round(newDistM),
            currentAccuracyM: accuracyM,
            canClose,
          },
        });
      } else {
        coords.push(coord);
        set({
          walk: {
            ...walk,
            coordinates: coords,
            currentAccuracyM: accuracyM,
          },
        });
      }
    },

    closeWalkLoop: () => {
      const walk = get().walk;
      if (walk.coordinates.length < 3) return;

      const closedCoords = [...walk.coordinates, walk.coordinates[0]];
      const simplified = simplifyGpsTrack(closedCoords, 1.5);
      const kinkCheck = checkSelfIntersection(simplified);

      const poly = turf.polygon([simplified]);
      const areaM2 = turf.area(poly);
      const areaHa = convertM2ToHa(areaM2);
      const areaAcres = convertM2ToAcres(areaM2);

      const bufferResult = computeInnerBufferPolygon(poly, -10);
      const [cLon] = [simplified[0][0], simplified[0][1]];
      const { zone: utmZone } = getUtmZoneForLon(cLon);

      set({
        walk: {
          ...walk,
          isWalking: false,
          coordinates: simplified,
          hasKinks: kinkCheck.hasKinks,
          calculatedAreaM2: Math.round(areaM2),
          calculatedAreaHa: Number(areaHa.toFixed(3)),
          calculatedAreaAcres: Number(areaAcres.toFixed(3)),
          effectivePixels: Number(bufferResult.effectivePixels.toFixed(1)),
          utmZone,
          isBelowMinimum: bufferResult.isInsufficientData,
        },
      });
    },

    resetWalk: () => {
      get().startWalk();
    },

    simulateWalkReplay: (variant) => {
      // Simulate real coordinates in Telangana
      const baseLon = 78.4110;
      const baseLat = 17.1210;
      const step = variant === 'standard_1ha' ? 0.0009 : 0.00027; // ~100m vs ~30m

      const coords: [number, number][] = [
        [baseLon, baseLat],
        [baseLon + step, baseLat],
        [baseLon + step, baseLat + step],
        [baseLon, baseLat + step],
        [baseLon, baseLat],
      ];

      const poly = turf.polygon([coords]);
      const areaM2 = turf.area(poly);
      const areaHa = convertM2ToHa(areaM2);
      const areaAcres = convertM2ToAcres(areaM2);
      const bufferRes = computeInnerBufferPolygon(poly, -10);
      const { zone: utmZone } = getUtmZoneForLon(baseLon);

      set({
        walk: {
          isWalking: false,
          coordinates: coords,
          distanceWalkedM: Math.round(variant === 'standard_1ha' ? 400 : 120),
          currentAccuracyM: 3.5,
          hasKinks: false,
          canClose: true,
          calculatedAreaM2: Math.round(areaM2),
          calculatedAreaHa: Number(areaHa.toFixed(3)),
          calculatedAreaAcres: Number(areaAcres.toFixed(3)),
          effectivePixels: Number(bufferRes.effectivePixels.toFixed(1)),
          utmZone,
          isBelowMinimum: bufferRes.isInsufficientData,
        },
      });
    },

    reviewAction: async (slotId, action, reason) => {
      const photos = { ...get().farmerPhotos };
      if (photos[slotId]) {
        photos[slotId] = {
          ...photos[slotId],
          status: action === 'Accept' ? 'passed' : 'flagged',
          flagReason: action === 'Accept' ? undefined : reason,
        };

        const updatedChain = await appendAuditRecord(
          get().auditChain,
          `PHOTO_REVIEW_${action.toUpperCase()}`,
          get().currentUser?.name || 'VERIFIER_OFFICER',
          {
            slotId,
            action,
            reason,
            timestamp: new Date().toISOString(),
          }
        );

        set({
          farmerPhotos: photos,
          auditChain: [...get().auditChain, updatedChain],
          isChainVerified: false,
        });
      }
    },

    chaos: {
      offlineSimulated: false,
      gpsDeniedSimulated: false,
      sentinelOutageSimulated: false,
      slowApiSimulated: false,
    },
    toggleChaos: (flag) => {
      set({
        chaos: {
          ...get().chaos,
          [flag]: !get().chaos[flag],
        },
      });
    },

    guidedDemo: {
      isActive: false,
      currentStep: 0,
      isPlaying: false,
      totalSteps: 6,
    },
    startGuidedDemo: () =>
      set({
        guidedDemo: { isActive: true, currentStep: 0, isPlaying: true, totalSteps: 6 },
      }),
    stopGuidedDemo: () =>
      set({
        guidedDemo: { ...get().guidedDemo, isActive: false, isPlaying: false },
      }),
    nextDemoStep: () => {
      const next = Math.min(get().guidedDemo.totalSteps - 1, get().guidedDemo.currentStep + 1);
      set({ guidedDemo: { ...get().guidedDemo, currentStep: next } });
    },
    prevDemoStep: () => {
      const prev = Math.max(0, get().guidedDemo.currentStep - 1);
      set({ guidedDemo: { ...get().guidedDemo, currentStep: prev } });
    },
    toggleDemoPlay: () => {
      set({ guidedDemo: { ...get().guidedDemo, isPlaying: !get().guidedDemo.isPlaying } });
    },

    methodsModalOpen: false,
    setMethodsModalOpen: (open) => set({ methodsModalOpen: open }),
  };
});
