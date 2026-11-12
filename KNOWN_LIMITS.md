# Known Scientific & Engineering Limitations
**Team DoSA • INNOVASIA 2K26 (PS-13)**

In accordance with our strict **Honesty Rules**, this document outlines the precise scientific assumptions, boundary conditions, and engineering scope of the Carbon Kheti MRV prototype.

---

## 1. Synthetic Data & Illustrative Biomass Model
- **All plot boundaries and satellite series are synthetic**, generated with fixed deterministic seeds for reproducible demonstration.
- The optical/radar biomass model ($AGB = a + b \cdot \text{NDVI}_{\text{peak}} + c \cdot \text{VH}_{\text{dB}}$) is an **illustrative IPCC Tier-2 relationship**. It has not been calibrated with destructive local field harvests in Telangana.
- **We do not claim physical accuracy**; rather, we demonstrate that *if* remote-sensing uncertainty is wide, our conservative lower-bound algorithm automatically absorbs that uncertainty by withholding credits.

---

## 2. Carbon Pool Scope (What is Included and Excluded)
| Carbon Pool | Status | Scientific Basis |
|---|---|---|
| **Above-Ground Biomass (AGB)** | **INCLUDED** | Estimated via Sentinel-2 optical NDVI peak + Sentinel-1 SAR backscatter. |
| **Below-Ground Biomass (BGB)** | **INCLUDED** | Estimated via IPCC Tier-2 root-to-shoot ratio: $BGB = AGB \times R$ ($R = 0.25$). |
| **Soil Organic Carbon (SOC)** | **EXCLUDED** | Satellite optical/radar sensors cannot reliably estimate deep soil carbon without physical core sampling. |
| **Dead Wood & Litter** | **EXCLUDED** | Fast-decay carbon pools are excluded to prevent over-crediting. |

---

## 3. Cryptographic Hash Chain Guarantees
- The SHA-256 hash chain and Ed25519 digital signatures prove **immutability, causality, and sequential integrity** of records in memory and on disk.
- **A hash chain does NOT prove physical ground truth.** If fraudulent inputs are ingested (e.g., photo taken in another state), the chain records that submission immutably, but a human verifier and our spatial-temporal fraud rules must flag it.

---

## 4. Minimum Spatial Resolution & Edge Buffering
- Sentinel-2 MSI provides a **10-meter ground sample distance (GSD)**.
- To prevent spectral contamination from adjoining roads, barren land, or neighbor crops, we enforce a mandatory **10-meter inward negative buffer** on all plot polygons.
- Smallholder plots that yield **fewer than 8 effective 10m pixels** (~0.08–0.09 hectares) cannot be computed as standalone statistical units; they must be aggregated into an FPO cluster.

---

## 5. Regulatory Boundary
- Carbon Kheti is an **open MRV engine**. It outputs verification-ready estimates and tamper-evident audit dossiers.
- It is **NOT** a carbon registry (like Verra or Gold Standard), is **NOT** a Designated Operational Entity (DOE) / Validation & Verification Body (VVB), and does **NOT** operate a trading marketplace.
