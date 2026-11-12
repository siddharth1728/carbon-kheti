# Carbon Kheti — Scientific Methodology, Mathematical Models & Limitations

**Protocol Version:** 1.0 (Telangana Smallholder Agroforestry)  
**Spatial Projection:** WGS 84 / UTM Zone 44N (EPSG:32644)  
**Standard Tier:** IPCC Tier-2 Paired Empirical Accounting  

---

## 1. Mathematical Formulation

### 1.1 Spatial Pre-Processing & 10m Inner Buffer
Sentinel-2 multispectral sensors deliver pixel dimensions of $10\text{m} \times 10\text{m}$ ($100\text{ m}^2$ per pixel). Smallholder plot perimeters frequently adjoin village roads, irrigation bunds, or adjacent monoculture crops. To eliminate boundary edge pixel contamination:

$$\mathcal{P}_{\text{inner}} = \text{Buffer}(\mathcal{P}_{\text{polygon}}, -10\text{ m})$$
$$A_{\text{inner}} = \text{Area}(\mathcal{P}_{\text{inner}})\text{ [m}^2\text{]}$$
$$N_{\text{pixels}} = \left\lfloor \frac{A_{\text{inner}}}{100} \right\rfloor$$

> **Qualification Rule:** If $N_{\text{pixels}} < 8$ ($<0.08\text{ ha}$ inner core), the holding is classified as `insufficient_data`. Boundary trees must be clustered with adjacent farms to create an aggregated monitoring parcel.

---

### 1.2 True Paired Anniversary Biomass Delta ($\Delta\text{AGB}$)
Vegetation greenness fluctuates seasonally. Carbon Kheti evaluates biomass changes between paired post-monsoon anniversary scenes (October $Y_1$ vs October $Y_2$):

$$\Delta\text{AGB}_i = \text{AGB}_{i}(Y_2) - \text{AGB}_{i}(Y_1)\quad \forall i \in \{1, \dots, N_{\text{pixels}}\}$$

Where individual pixel Aboveground Biomass ($\text{AGB}$) is parameterized from optical Sentinel-2 peak vegetation indices ($\text{NDVI}$) corroborated by Sentinel-1 SAR C-band dual-polarization backscatter ($\text{VH}_{\text{dB}}$) and GEDI / ICESat-2 canopy height altimetry ($H_{\text{canopy}}$):

$$\text{AGB}(t) = \alpha + \beta_1 \cdot \text{NDVI}_{\text{peak}}(t) + \beta_2 \cdot |\text{VH}_{\text{dB}}(t)| + \gamma \cdot H_{\text{canopy}}$$

---

### 1.3 1,000x Spatial Bootstrap with Design Effect ($D_{\text{eff}}$)
In agricultural spatial statistics, adjacent remote-sensing pixels are not independent; they exhibit positive spatial autocorrelation (Moran's $I$). Treating pixels as independent produces falsely narrow confidence intervals.

We model this using a spatial survey design effect:
$$D_{\text{eff}} = 1 + 2\rho$$
Where $\rho \approx 0.35$ represents the empirical spatial lag correlation for smallholder plots in Telangana, yielding:
$$D_{\text{eff}} = 1 + 2(0.35) = 1.70$$
$$N_{\text{effective}} = \frac{N_{\text{pixels}}}{D_{\text{eff}}}$$

We resample $B = 1,000$ iterations with sample size $N_{\text{effective}}$:
$$\bar{\Delta\text{AGB}}^{*(b)} = \frac{1}{N_{\text{effective}}} \sum_{j=1}^{N_{\text{effective}}} \Delta\text{AGB}_j^{*(b)}\quad (b = 1, \dots, 1000)$$

The conservative issuable basis is strictly defined as the **5th percentile** (one-sided 95% confidence lower bound):
$$\Delta\text{AGB}_{\text{lower}} = \text{Quantile}_{0.05}\left(\{\bar{\Delta\text{AGB}}^{*(b)}\}_{b=1}^{1000}\right)$$

---

### 1.4 Carbon Conversion & Deductions Reconciliation
Net verifiable emission reductions are reconciled through strictly separated accounting layers:

$$\text{BiomassToCO}_2\text{e} = (1 + R) \cdot \text{CF} \cdot \frac{44}{12}$$
$$\text{GrossLower} = \max(0, \Delta\text{AGB}_{\text{lower}} \cdot \text{BiomassToCO}_2\text{e})$$
$$\text{BaselineDeduction} = \Delta\text{AGB}_{\text{baseline}} \cdot \text{BiomassToCO}_2\text{e}$$
$$\text{NetBeforeBuffer} = \max(0, \text{GrossLower} - \text{BaselineDeduction} - \text{Leakage})$$
$$\text{PermanenceBuffer} = \text{NetBeforeBuffer} \cdot \text{BufferPct}$$
$$\text{FinalIssuableCredits} = \text{NetBeforeBuffer} - \text{PermanenceBuffer}$$

- **Root-to-Shoot Ratio ($R = 0.25$):** Belowground biomass ($\text{BGB}$) addition per IPCC Good Practice Guidance for agroforestry.
- **Carbon Fraction ($\text{CF} = 0.47$):** Tonnes of carbon per dry biomass tonne.
- **Stoichiometric Ratio ($44/12 \approx 3.6667$):** Molecular conversion from elemental Carbon to $\text{CO}_2\text{e}$.
- **Baseline ($\Delta\text{AGB}_{\text{baseline}} = 0.22\text{ t/ha/yr}$):** Derived dynamic additionality baseline from regional matched non-agroforestry control plots.
- **Leakage ($0.0\%$):** Agroforestry boundary planting on field borders does not displace existing crop cultivation.
- **Permanence Risk Buffer ($15.0\%$):** Pooled retention to protect buyers against future natural disturbance.

---

## 2. Itemized Deductions vs. "Over-Crediting Avoided"

| Deduction Layer | Calculation | Purpose |
|---|---|---|
| **Uncertainty Haircut** | $\text{GrossMean} - \text{GrossLower}$ | **Strictly Over-Crediting Avoided.** Uncertainty is discounted using credits, not trust. |
| **Additionality Baseline** | $\Delta\text{AGB}_{\text{baseline}} \cdot \text{BiomassToCO}_2\text{e}$ | Ensures credits represent new net removals above business-as-usual regional vegetation growth. |
| **Leakage** | $0.00\text{ tCO}_2\text{e}$ | Validates boundary planting does not shift farming activity elsewhere. |
| **Permanence Buffer** | $15.0\%$ of net lower bound | Pooled reserve holdback for physical non-reversal risk. |

---

## 3. Excluded Carbon Pools

To maintain unquestioned integrity and avoid speculative modeling without destructive sampling:
1. **Dead Wood Pool:** Excluded. Decomposition rates vary widely; exclusion prevents baseline overestimation.
2. **Litter Pool:** Excluded. Tropical Kharif monsoons cause rapid seasonal decay and turnover.
3. **Soil Organic Carbon (SOC) Pool:** Excluded. Satellite sensors cannot directly verify soil carbon without physical core laboratory sampling.

---

## 4. Limitations & Honesty Disclosures

1. **Synthetic Demo Data:** All plot coordinates, time-series observations, and field evidence in this release are seeded synthetic representations designed for hackathon reproducibility.
2. **Allometric Relationship:** The biomass regression equations represent regional illustrative models. Commercial deployment requires destructive / non-destructive ground-truth calibration across Telugu agroforestry species (Teak, Mango, Subabul).
3. **Cryptographic Proof Scope:** The SHA-256 hash chain guarantees that historical ingestion records have remained immutable and untampered since submission. It does not certify physical reality on the ground—which is why estimates are formatted for external auditor review.
