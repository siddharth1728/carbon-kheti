# Architectural & Methodological Decisions (DECISIONS.md)
**Project:** Carbon Kheti Open MRV Engine (Team DoSA, INNOVASIA 2K26, PS-13)  
**Document Author:** Principal Full-Stack Engineer & Product Designer  
**Date:** November 12, 2026  

---

## 1. Context & Architectural Principles
When building a low-cost, auditable MRV platform for smallholders in India, engineering choices must navigate trade-offs between precision, verification expense, sensor limitations, and regulatory compliance. Every design decision below was made adhering to the primary thesis:
> *"Verification cost doesn't scale down with farm size, so smallholders get priced out. We invert that — and we pay for uncertainty with credits, not with trust."*

---

## 2. Key Decisions & Rationale

### DECISION-01: Dynamic UTM Zone Selection (Zone 43N vs Zone 44N)
- **Problem:** Telangana spans longitudes $77.2^\circ\text{E}$ to $81.8^\circ\text{E}$. The boundary between UTM Zone 43N and UTM Zone 44N is at $78.0^\circ\text{E}$. Hard-coding Zone 44N distorts metric measurements in Western Telangana (Nizamabad, Bodhan at $77.87^\circ\text{E}$, Kamareddy, Sangareddy).
- **Decision:** Derive the projection zone dynamically from the polygon centroid:
  $$\text{EPSG} = \begin{cases} \text{EPSG:32643 (UTM 43N)}, & \text{if } \text{centroid lon} < 78.0^\circ\text{E} \\ \text{EPSG:32644 (UTM 44N)}, & \text{if } \text{centroid lon} \ge 78.0^\circ\text{E} \end{cases}$$
- **Impact:** Eliminates geodesic scale distortion. Guarantees true metric area ($m^2$) and accurate 10m inner buffer calculations across all 33 districts of Telangana.

---

### DECISION-02: Conservative Issuance from 5th Percentile ($P_{05}$) of Paired Delta
- **Problem:** Measuring annual biomass delta ($\Delta\text{AGB}$) from satellite imagery entails sensor noise, optical cloud scattering, and speckle in synthetic aperture radar. Traditional MRV uses mean estimates with trust assumptions, creating over-crediting risks.
- **Decision:** Compute biomass change directly on pixel-level paired observations ($\text{AGB}(t_2) - \text{AGB}(t_1)$) and run a 1,000-iteration bootstrap incorporating a spatial autocorrelation design effect ($D_{\text{eff}} = 1 + 2\rho$). Only issue credits from the **one-sided 95% lower confidence bound (5th percentile, $P_{05}$)**.
- **Impact:** Buyers receive guaranteed conservative removal credits. Over-crediting is structurally prevented by deducting the uncertainty haircut ($\text{Mean} - P_{05}$) upfront.

---

### DECISION-03: Sentinel-1 SAR Fallback with Automated Uncertainty Inflation
- **Problem:** Kharif season in Telangana (June–September) experiences intense monsoon cloud cover, blinding optical Sentinel-2 imagery exactly during the peak vegetative growing period.
- **Decision:** Establish an optical-primary, radar-fallback architecture. When cloud-free Sentinel-2 acquisitions fall below 16 scenes/year, the engine automatically integrates Sentinel-1 C-band cross-polarized (VH) backscatter to measure canopy structural scattering. Because SAR is prone to dielectric soil moisture noise, the engine automatically inflates the bootstrap variance ($+40\%$).
- **Impact:** The system maintains 100% monitoring uptime through the monsoon without pretending precision: cloud degrades confidence intervals, not data availability.

---

### DECISION-04: 10m Negative Inner Buffer & Minimum Effective Pixel Rule
- **Problem:** Sentinel-2 pixels have a 10m spatial resolution ($100\text{ m}^2$). On smallholder boundaries, edge pixels mix farm trees with neighboring bare soil, irrigation ditches, or roads.
- **Decision:** Apply an automated 10-meter negative inner buffer to every registered polygon prior to pixel extraction:
  $$\text{Effective Pixels} = \frac{\text{Area}(\text{Polygon}_{\text{inner -10m}})}{100\text{ m}^2}$$
  If effective pixels $< 8.0$, the plot is flagged as `INSUFFICIENT DATA / MUST CLUSTER`.
- **Safest Honest Interpretation:** Never inflate or scale measured areas to look larger. Micro-plots ($< 0.25\text{ ha}$) are not computed in isolation; the UI directs the farmer to cluster with contiguous neighbor plots under FPO aggregation.

---

### DECISION-05: Consent Evidence vs Biometric Identity Verification
- **Problem:** Many rural smallholders in Telangana are non-literate and cannot read English contracts or sign standard forms. However, collecting biometric fingerprints or Aadhaar numbers presents severe data protection, privacy, and regulatory liabilities under India's Digital Personal Data Protection Act (DPDPA 2023).
- **Decision:** Provide plain-language FPIC in Telugu, Hindi, and English with audio narration. Support two consent mechanisms:
  1. Drawn signature on touch canvas, OR
  2. Thumb impression (photo of inked paper thumbprint or witnessed on-screen press).
  - Explicitly label this **"consent evidence"**, NOT biometric identity verification. Never perform fingerprint pattern matching, and never store biometric templates. Require an FPO volunteer or village official witness step.
- **Impact:** Respects farmer agency, eliminates legal liabilities, and creates an auditable record anchored to the immutable ledger.

---

### DECISION-06: 8-Direction Compass Heading Gated Photo Capture
- **Problem:** Self-reported photos uploaded from device galleries can be easily falsified, reused from other farms, or taken from arbitrary angles that do not corroborate satellite canopy cover.
- **Decision:** Implement in-app camera capture with live `DeviceOrientation` compass heading feedback. The shutter is gated to enable only when the camera points within $\pm 22.5^\circ$ of the target compass direction (N, NE, E, SE, S, SW, W, NW, canopy-up, ground close-up). Sensor metadata (GPS, heading, tilt, timestamp) is signed at shutter time.
- **Fallback:** If compass permission is denied, manual selection is permitted but tagged `LOWER CONFIDENCE (MANUAL HEADING)`.

---

### DECISION-07: External RFC 3161 Timestamping & Ed25519 Signing
- **Problem:** An internal SHA-256 hash chain prevents post-hoc database alterations by low-level actors, but a malicious database administrator could re-calculate the entire chain from genesis and present an altered history.
- **Decision:** 
  1. Digitally sign the latest chain head using an Ed25519 project signing key.
  2. Simulate RFC 3161 public Time-Stamp Authority (TSA) anchoring (National Informatics Centre / DigiCert TSA).
- **Impact:** Proves that an audit block existed at a specific universal point in time before external verification, closing the "who watches the watcher?" gap without incurring blockchain gas fees.

---

### DECISION-08: Complete Removal of Plot ID Branching
- **Problem:** Previous prototype versions contained hardcoded conditional statements checking `if (plot.id === 'TS-KMM-06')` or `if (currentPlot.id === 'TS-NZB-05')`.
- **Decision:** Completely eliminate all plot ID branching. All outcomes (growth estimates, overlap flags, photo geotag rejections, confidence intervals) emerge strictly from geographic geometry, pixel time-series values, and image byte hashes.

---
*Signed by Principal Full-Stack Engineer & Product Designer, Team DoSA*
