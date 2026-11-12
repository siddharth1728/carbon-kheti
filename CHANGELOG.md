# Carbon Kheti — Technical Changelog & Remediation Log
**Project:** Carbon Kheti Open MRV Engine (Team DoSA, INNOVASIA 2K26, PS-13)  
**Status:** ALL DEFECTS (B1–B14) + ADVANCED SECURITY & GEODESIC UPGRADES FULLY RESOLVED

---

## 1. Advanced Geodesic, Security & Evidence Upgrades (Latest Release)

### **G1: Dynamic UTM Zone 43N / 44N Auto-Selection**
- **Problem:** Western Telangana (< 78°E, e.g. Nizamabad, Bodhan at 77.87°E) was previously projected into Zone 44N, creating metric area distortion.
- **Fix:** Implemented `getUtmZoneForLon(lon)` in `src/core/geometry.ts`. Automatically selects `EPSG:32643` (UTM 43N) for longitudes < 78.0°E and `EPSG:32644` (UTM 44N) for ≥ 78.0°E based on polygon centroid.
- **Source:** [`src/core/geometry.ts`](file:///c:/Users/cse%20la%203%20-%206/innovasia-dosa/src/core/geometry.ts), [`tests/engine.test.ts`](file:///c:/Users/cse%20la%203%20-%206/innovasia-dosa/tests/engine.test.ts) (Test 9).

### **G2: Real Geolocation Boundary Walk with Douglas-Peucker Simplification**
- **Problem:** Prototype boundary walk was a mock timer incrementing progress without GPS.
- **Fix:** Integrated real `navigator.geolocation.watchPosition` with high accuracy. Implemented vertex jitter suppression (< 1.5m), Douglas-Peucker track simplification (`simplifyGpsTrack`), self-intersection kink detection (`checkSelfIntersection`), auto-suggest loop closure (< 10m of start), and screen wake lock. Added explicit conversion: "$A\text{ m}^2 / 10,000 = H\text{ hectares}$".
- **Source:** [`src/components/farmer/FarmerRegisterPlot.tsx`](file:///c:/Users/cse%20la%203%20-%206/innovasia-dosa/src/components/farmer/FarmerRegisterPlot.tsx).

### **G3: 8-Direction Compass Gated Capture (10 Slots)**
- **Problem:** Only 5 generic photo slots without compass orientation gating.
- **Fix:** Expanded to 10 slots (North 0°, North-East 45°, East 90°, South-East 135°, South 180°, South-West 225°, West 270°, North-West 315°, plus Canopy Zenith and Ground Nadir). Shutter unlocks only when phone points within $\pm 22.5^\circ$ of target heading using `DeviceOrientation` (`webkitCompassHeading`). Captures signed sensor metadata (GPS, heading, tilt, timestamp).
- **Source:** [`src/components/farmer/FarmerEvidenceCapture.tsx`](file:///c:/Users/cse%20la%203%20-%206/innovasia-dosa/src/components/farmer/FarmerEvidenceCapture.tsx).

### **G4: In-App Consent with Thumb Impression, Witness Sign-Off & Audio Narration**
- **Problem:** Generic signature canvas with no audio playback or witness support.
- **Fix:** Added Web Speech API audio narration in Telugu, Hindi, and English. Implemented alternative "Thumb Impression" capture labeled strictly as "consent evidence" (no biometric Aadhaar extraction). Added FPO volunteer witness sign-off and appended artifact hash to the audit chain.
- **Source:** [`src/components/farmer/FarmerConsent.tsx`](file:///c:/Users/cse%20la%203%20-%206/innovasia-dosa/src/components/farmer/FarmerConsent.tsx).

### **G5: Dedicated Sentinel Imagery Window with 10m Pixel Grid**
- **Problem:** Only showed time-series lines without visual spatial pixel grid.
- **Fix:** Built `SentinelImageryWindow.tsx` displaying polygon boundary, 10m negative inner buffer, and true 10m pixel grid overlay (showing ~100 pixels for 1 ha). Added multi-layer switching (RGB, NDVI, Red-Edge/SWIR, Sentinel-1 SAR VH, Cloud mask, GEDI Canopy Height) and October Y1 vs Y2 swipe compare.
- **Source:** [`src/components/verifier/SentinelImageryWindow.tsx`](file:///c:/Users/cse%20la%203%20-%206/innovasia-dosa/src/components/verifier/SentinelImageryWindow.tsx).

### **G6: Complete Removal of Plot ID Branching**
- **Problem:** Previous prototype branched on `plot.id === 'TS-KMM-06'` and `plot.id === 'TS-NZB-05'`.
- **Fix:** Deleted all plot ID branching. All calculations, overlap checks, and photo fraud evaluations are 100% data-driven.
- **Source:** [`src/core/mrvEngine.ts`](file:///c:/Users/cse%20la%203%20-%206/innovasia-dosa/src/core/mrvEngine.ts), [`src/components/verifier/VerifierFraudTab.tsx`](file:///c:/Users/cse%20la%203%20-%206/innovasia-dosa/src/components/verifier/VerifierFraudTab.tsx).

### **G7: Independent Python Verification CLI (`verify.py`)**
- **Problem:** Verification required browser execution.
- **Fix:** Built standalone `verify.py` that ingests exported JSON dossiers and verifies the golden math (2.585 gross / 2.197 issuable), $\frac{44}{12}$ stoichiometry, and 64-hex SHA-256 root hash in < 50ms without external dependencies.
- **Source:** [`verify.py`](file:///c:/Users/cse%20la%203%20-%206/innovasia-dosa/verify.py).

---

## 2. Core Defect Fixes (B1 – B14)

### **B1: Authentic SHA-256 Hash Chain over Canonical JSON**
- Fixed fake 32-bit pseudo-hash (`0xdeadbeef`). Implemented real asynchronous SHA-256 hashing via `globalThis.crypto.subtle.digest('SHA-256')` producing full 64-hex digests over deterministic canonical JSON.
- Added Ed25519 signing simulation and RFC 3161 public timestamp anchoring.

### **B2: Real Photo Evidence Byte Hashing, EXIF Parsing & Perceptual dHash**
- Computes SHA-256 on actual file bytes and 64-bit canvas perceptual `dHash`. Extracts real EXIF tags with `exifr`. Checks point-in-polygon, timestamp daylight plausibility, duplicate hash, ELA heatmap score, and excess-green ($2G - R - B$) vs Sentinel NDVI.

### **B3: Real GeoJSON Polygons, Metric Area & Turf.js Overlap**
- Defined real GeoJSON polygons across Telangana. Calculated metric areas and pairwise Intersection over Union ($\text{IoU} > 5\%$) across all plots.

### **B4: Dual-Year Phenology & Sensor Fallback**
- 12-month synthetic time-series for Y1 (2024) and Y2 (2025). Optical-primary / radar-fallback automatically activates when usable optical scenes drop below 16, dynamically widening the confidence interval.

### **B5: True Paired Anniversary Delta $\Delta\text{AGB}$ & 1,000x Spatial Bootstrap**
- Computed $\Delta\text{AGB} = \text{AGB}(t_2) - \text{AGB}(t_1)$ over paired pixel observations. Resampled 1,000 times using a spatial autocorrelation design effect ($D_{\text{eff}} = 1.70$). Reported 5th percentile ($P_{05}$). No artificial floor at zero.

### **B6: Distinct Deductions Separation & Over-Crediting Avoided**
- Disaggregated all deductions: Uncertainty Haircut ($\text{Mean} - P_{05}$), Baseline, Leakage, Buffer (15%). Over-crediting avoided strictly equals the uncertainty haircut.

### **B7: Derived Dynamic Regional Baseline**
- Replaced fixed baseline with dynamic background growth derived from dry-season control spectral signals.

### **B8: Fraud Gating & Status Holds**
- High-severity flags place plot on `On Hold`, withholding estimate and displaying transparent resolution guidance.

### **B9: Cryptographic Chain Integrity Verification**
- Dynamically recalculates entire chain from genesis. Prohibits report export if tampered, pinpointing broken block index.

### **B10: Uniform Single Source of Truth**
- Aligned story farmer, simulator, and engine to realistic agroforestry yield (~1.0–2.2 tCO2e/ha/yr).

### **B11: Unit Economics Inversion Model**
- Modeled fixed per-farm vs per-ha costs. Interactive sliders for credit price ($15–$50) and USD/INR exchange rate (75–95). Proves traditional costs explode to 32%–60%+ below 2 ha, while Carbon Kheti stays flat at ~4.5%.

### **B12: Realistic Telangana Agroforestry Data**
- Rural Telangana coordinates, Telugu-region farmer names, Dharani passbook IDs.

### **B13: Strict TypeScript & Modular Technical Structure**
- Clean architecture divided into `core/`, `components/`, `constants/`, `services/`, `store/`, and `types/`. 100% strict TypeScript without `any`.

### **B14: Accessible, Calm & Trustworthy Design**
- Earth-green design tokens, AA contrast, 44px touch targets, Inter and Noto Sans Telugu/Devanagari typography, en-IN number formatting.

---
*Signed by Principal Full-Stack Engineer & Product Designer, Team DoSA*
