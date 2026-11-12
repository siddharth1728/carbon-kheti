# Carbon Kheti | Verification-Ready MRV Engine

> **Smallholder Agroforestry Measurement, Reporting, and Verification (MRV) Engine**  
> Tailored for smallholders across Telangana, India (UTM 44N).  
> *“Verification cost doesn't scale down with farm size, so smallholders get priced out. We invert that — and we pay for uncertainty with credits, not with trust.”*

---

## 🌾 Overview & Core Thesis

Traditional carbon MRV costs **US$8–15 / ha / yr**, consuming **32% to 60%** of a 1-hectare smallholder's gross carbon revenue (at 1 tCO₂e/ha/yr and US$25/t). As a result, smallholder farmers are systematically excluded from carbon finance.

**Carbon Kheti** inverts this dynamic:
1. **₹100 / ha / yr automated verification pipeline** reducing MRV drag to **~4.5%** of carbon revenue.
2. **Conservative 95% lower-bound crediting**: Rather than asking auditors (VVBs) for trust over remote sensing noise, uncertainty is discounted using credits.
3. **Multi-sensor fallback**: Optical Sentinel-2 NDVI during clear months combined with Sentinel-1 C-band SAR radar backscatter to eliminate monsoon cloud blindness.
4. **Not a registry, marketplace, or blockchain**: Outputs audit-ready, structured scientific estimates and immutable cryptographic provenance dossiers formatted directly for third-party validation and verification bodies (VVBs).

---

## 🏛️ Technical Folder Architecture

The monolithic TSX file has been decomposed into modular, domain-driven technical folders:

```
innovasia-dosa/
├── index.html                   # HTML entry point with Inter & JetBrains Mono typography
├── package.json                 # Dependency definitions & automated scripts
├── vite.config.ts               # Vite configuration with @ path alias
├── tsconfig.json                # Strict TypeScript configuration
├── tailwind.config.js           # Theme extension with custom forest color palette
├── postcss.config.js            # PostCSS configuration with Tailwind & Autoprefixer
├── .gitignore                   # Standard production ignore rules
│
├── tests/                       # Automated Verification Test Suite
│   └── engine.test.ts           # Unit tests for MRV math, crypto chain, fraud rules, economics
│
├── src/
│   ├── main.tsx                 # React DOM root bootstrapping
│   ├── App.tsx                  # Master application orchestrator with tab routing
│   │
│   ├── types/                   # Strict TypeScript domain interfaces
│   │   ├── index.ts             # Central type exports and tab definitions
│   │   ├── plot.ts              # Plot data, coordinates, series, and plot categories
│   │   ├── mrv.ts               # MRV results and scientific calculation parameters
│   │   ├── audit.ts             # Cryptographic block records and chain verification results
│   │   └── economics.ts         # Unit economics simulator inputs and financial breakdowns
│   │
│   ├── constants/               # System constants and reference datasets
│   │   ├── index.ts             # Constant exports
│   │   ├── plotsData.ts         # 6 Synthetic Telangana plots (UTM 44N spatial data)
│   │   ├── mrvDefaults.ts       # Scientific IPCC defaults, excluded pools, and limitations
│   │   └── navigation.ts        # Tab navigation definitions and badges
│   │
│   ├── core/                    # Pure, testable algorithmic and scientific logic
│   │   ├── mrvEngine.ts         # Scientific biomass regression, edge buffer, and lower bound
│   │   ├── cryptoEngine.ts      # Canonical serialization, hash chaining, and tamper verification
│   │   ├── fraudRules.ts        # 5 automated anti-fraud checks and spatial validation
│   │   └── unitEconomics.ts     # Smallholder vs traditional cost drag simulator
│   │
│   ├── services/                # External services, file handling, and export generators
│   │   ├── exportService.ts     # Dynamic JSON dossier and standalone styled HTML export
│   │   └── photoService.ts      # Web Crypto API SHA-256 calculator and EXIF telemetry parser
│   │
│   ├── context/                 # Application state management
│   │   └── MRVContext.tsx       # React Context provider with reactive hooks and actions
│   │
│   ├── hooks/                   # Custom reusable React hooks
│   │   └── useMRV.ts            # Type-safe hook for consuming MRV context
│   │
│   ├── components/              # Modular UI Component Library
│   │   ├── layout/              # Navigation, headers, banners, and static expanders
│   │   │   ├── Header.tsx       # Sticky top navigation with compliance disclaimers
│   │   │   ├── NavigationBar.tsx# 7-tab responsive pill navigation bar
│   │   │   ├── Footer.tsx       # Footer with scientific attribution
│   │   │   └── RoadmapExpander.tsx # Collapsible production roadmap and out-of-scope milestones
│   │   │
│   │   ├── story/               # Tab 1: Story & Unit Economics
│   │   │   ├── StoryTab.tsx
│   │   │   ├── ThesisBanner.tsx
│   │   │   ├── FarmerStoryCard.tsx
│   │   │   └── UnitEconomicsSimulator.tsx
│   │   │
│   │   ├── plots/               # Tab 2: Plots & Geospatial Distribution
│   │   │   ├── PlotsTab.tsx
│   │   │   ├── PlotCard.tsx     # Color-blind safe badges (icons + text)
│   │   │   └── TelanganaMapVisualizer.tsx # Interactive cartographic map of Telangana
│   │   │
│   │   ├── carbon/              # Tab 3: Carbon Engine & Mathematics
│   │   │   ├── CarbonEngineTab.tsx
│   │   │   ├── SatelliteTimeSeriesChart.tsx # Optical NDVI vs Sentinel-1 VH Radar
│   │   │   ├── MetricsGrid.tsx  # Effective pixels, mean vs lower-bound, avoided over-crediting
│   │   │   └── ShowYourWorkTable.tsx # 6-step audit-traceable table with assumptions
│   │   │
│   │   ├── fraud/               # Tab 4: Automated Fraud Checks
│   │   │   ├── FraudChecksTab.tsx
│   │   │   ├── FraudChecklist.tsx # 5-point verification checklist
│   │   │   └── PhotoEvidenceUploader.tsx # Drag & drop image hasher and EXIF logger
│   │   │
│   │   ├── audit/               # Tab 5: Cryptographic Audit Trail
│   │   │   ├── AuditLogTab.tsx  # Immutability log with live "VERIFY CHAIN"
│   │   │   └── AuditRecordCard.tsx # Detailed block card with prev_hash and curr_hash
│   │   │
│   │   ├── redteam/             # Tab 6: Adversarial Red-Team Stress Test
│   │   │   ├── RedTeamTab.tsx   # Live attack simulator with instant detection
│   │   │   └── AttackSimulatorCard.tsx
│   │   │
│   │   ├── report/              # Tab 7: Verification-Ready Dossier
│   │   │   └── ReportTab.tsx    # Dossier summary, JSON & HTML single-click downloaders
│   │   │
│   │   └── ui/                  # Reusable atomic UI atoms
│   │       ├── Badge.tsx
│   │       └── Card.tsx
│   │
│   └── styles/
│       └── index.css            # Tailwind directives, custom scrollbars, typography
```

---

## 🔬 Scientific MRV Methodology & Formulas

### 1. 10m Inner Buffer (Edge Effect Removal)
To eliminate boundary contamination from neighbouring plots or roads in 10m Sentinel pixels:
$$\text{side} = \sqrt{\text{area\_m}^2}$$
$$\text{eff\_side} = \max(0, \text{side} - 20)$$
$$\text{eff\_pixels} = \frac{\text{eff\_side}^2}{100}$$

### 2. Paired Anniversary Delta Biomass ($\Delta\text{AGB}$)
Calculated between paired post-monsoon anniversary monitoring seasons (October $t_2$ vs October $t_1$):
$$\Delta\text{AGB}_{\text{mean}} = 3.8 \cdot \text{NDVI}_{\text{peak}} + 0.15 \cdot |\text{VH}_{\text{dB}}| - 1.2$$

### 3. Monsoon Cloud Penalty & Conservative 95% Lower Bound
When optical NDVI is blocked by heavy monsoon clouds, variance increases by $1.85\times$. Rather than trusting interpolations, we penalize the standard error:
$$\text{SE} = \frac{2.8 \cdot \text{cloudPenalty}}{\sqrt{\text{eff\_pixels}}}$$
$$\Delta\text{AGB}_{\text{lower}} = \max(0.1, \Delta\text{AGB}_{\text{mean}} - 1.645 \cdot \text{SE})$$

### 4. Net Carbon Conversion & Buffer Holdback
$$\text{Net} = \left[(\Delta\text{AGB}_{\text{lower}} \cdot (1 + R) - \text{Baseline}) \cdot \text{CF} \cdot \frac{44}{12}\right] - \text{Leakage}$$
$$\text{Final Credits} = \text{Net} \cdot (1 - \text{Buffer})$$
- $R = 0.25$: IPCC default root-to-shoot below-ground addition.
- $\text{Baseline} = 0.20\text{ t/ha/yr}$: Dynamic additionality deduction.
- $\text{CF} = 0.47$: Tonnes of Carbon per dry biomass.
- $\frac{44}{12} \approx 3.667$: Stoichiometric conversion to $\text{CO}_2\text{e}$.
- $\text{Buffer} = 15\%$: Conservative permanence risk pool reserve.

### 5. Excluded Carbon Pools
- **Dead Wood:** Excluded to prevent baseline overestimation without destructive sampling.
- **Litter:** Excluded due to high monsoon turnover.
- **Soil Organic Carbon (SOC):** Excluded without lab-verified soil core sampling.

---

## 🔒 Cryptographic Audit Log & Honesty Rule

Every remote-sensing ingestion, photo evidence submission, and parameter evaluation is recorded in an immutable hash chain:
$$\text{hash}_n = \text{SHA-256}(\text{hash}_{n-1} + \text{canonical\_json})$$

> **⚠️ The Honesty Rule:**  
> The cryptographic hash chain proves **immutability and sequence**, not physical truth. It prevents retroactive data alterations after submission, guaranteeing tamper-evidence for third-party VVBs.

---

## 🛡️ Automated 5-Point Anti-Fraud Engine

| # | Check | Rule Implementation |
|---|---|---|
| 1 | **EXIF GPS Inside Polygon** | Validates that photo geotags strictly lie within the registered spatial boundary vector. |
| 2 | **EXIF Seasonal Window** | Confirms capture timestamp falls in the post-monsoon monitoring window (Oct–Nov). |
| 3 | **Duplicate Photo Hash** | Computes SHA-256 byte digest and flags duplicates used across multiple claims. |
| 4 | **Polygon Overlap > 5%** | Calculates spatial Intersection over Union (IoU); rejects claims overlapping $>5\%$. |
| 5 | **Claim vs Satellite Mismatch**| Flags claims of dense tree canopy when optical NDVI ($<0.35$) and VH backscatter remain flat. |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** $\ge 18$ (Node 24 recommended)
- **npm** $\ge 9$

### Installation
```bash
# Clone or navigate to the workspace
cd innovasia-dosa

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
```
Starts the Vite dev server at `http://localhost:3000` with hot module replacement.

### Automated Test Suite
```bash
npm test
```
Runs the test suite verifying MRV calculation math, cryptographic chaining, fraud rules, and smallholder unit economics.

### Production Build
```bash
npm run build
```
Compiles TypeScript with strict type checking and builds optimized production bundles to `dist/`.

### Preview Production Build
```bash
npm run preview
```

---

## 📄 Export Formats

- **JSON Dossier (`.json`)**: Machine-readable specification with full remote sensing inputs, step-by-step assumptions, lower-bound estimates, excluded carbon pools, and root hash.
- **HTML Dossier (`.html`)**: Self-contained, responsive, printable verification report with embedded styles and metadata ready for independent auditor review.
