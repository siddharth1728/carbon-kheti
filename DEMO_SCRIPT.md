# 4-Minute Judge-Proof Presentation Script & Fail-Safe Runbook
**Team DoSA • INNOVASIA 2K26 (PS-13)**

This script is engineered for a crisp, high-impact **4-minute live pitch** before judges, complete with instant recovery actions for every potential failure.

---

## The 4-Minute Presentation Flow

```
[0:00 - 0:45] The Problem & Economic Inversion (Story Tab)
[0:45 - 1:45] Farmer Mobile App on Phone (Boundary Walk & Compass Capture)
[1:45 - 2:45] Verifier Science & Sentinel Imagery (10m Resolution, Paired Bootstrap)
[2:45 - 3:30] Cryptographic Hash Chain & Live Adversarial Tamper Attack
[3:30 - 4:00] Unit Economics & Golden Verification (Closing Thesis)
```

---

### Phase 1: The Problem & Thesis (0:00 - 0:45)
- **Show Screen**: Verifier Console -> Tab 7 (Unit Economics)
- **Say**:
  > *"Respected judges, verification cost does not scale down with farm size. A 1-hectare smallholder in Telangana earns roughly ₹2,200 from carbon removals, but traditional physical audits cost ₹1,000 to ₹1,500 per farm — wiping out 60% of their revenue. Smallholders get priced out.*
  >
  > *Carbon Kheti inverts this: automated satellite + canopy-height MRV costs ₹100 per hectare (4.5% of revenue). And our core thesis: We pay for uncertainty with credits, not with trust."*

---

### Phase 2: Farmer App Live on Phone (0:45 - 1:45)
- **Show Screen**: Phone projected via scrcpy (or 390px Mobile Viewport)
- **Say**:
  > *"Here is our Farmer App running natively on Android. Mallesh Goud registers his teak-mango plot."*
- **Action**:
  1. **Consent Screen**: Point out Telugu/Hindi plain-language FPIC consent terms. Tap **Agree & Proceed**.
  2. **Boundary Walk**: Show live GPS telemetry. Tap **Replay Simulation (Standard 1.25 ha)**.
     - Highlight: Area is explicitly converted: $12,500\text{ m}^2 / 10,000 = 1.25\text{ Hectares}$.
     - Highlight: A 10m inner buffer eliminates boundary edge contamination, yielding 81.3 clean Sentinel pixels.
  3. **Compass-Guided Photo Capture**: Tap **Pre-Load 3 Verified Field Photos**.
     - Explain: Camera shutter unlocks only within $\pm 22.5^\circ$ of the target direction.
     - Real SHA-256 byte digests and EXIF geotags are computed on-device.
  4. **Submit**: Tap **Submit Evidence for MRV Sealing**. Watch the 5-stage cryptographic pipeline seal the plot.

---

### Phase 3: The Science & Verifier Audit (1:45 - 2:45)
- **Show Screen**: Verifier Console -> Tab 2 (Sentinel Window) & Tab 3 (Carbon Engine)
- **Say**:
  > *"On the verifier side, we do not claim accuracy; we compute conservative lower bounds.
  > We pair anniversary Octobers — October 2025 to October 2026 — to eliminate seasonal phenology swings.
  > If cloud cover exceeds threshold, we fall back to Sentinel-1 SAR C-band radar, which widens the confidence interval.*
  >
  > *Then, a 1,000-iteration spatial bootstrap calculates the 95% lower bound on delta AGB.
  > For Plot TS-RR-01: Gross mean is 4.31 tCO2e, but we only issue 2.19 tCO2e. The difference — 1.72 tCO2e — is our 'Over-crediting Avoided' haircut. We protect buyers and the planet."*

---

### Phase 4: Tamper-Evident Audit Chain & Live Attack (2:45 - 3:30)
- **Show Screen**: Verifier Console -> Tab 6 (Audit Chain) or Tab 9 (Backend Console)
- **Say**:
  > *"Every single plot boundary, photo digest, and calculation is chained in a SHA-256 Merkle log."*
- **Action**:
  1. Click **Verify Chain** -> Show green checkmark: *"All blocks cryptographically valid from Genesis to Root"*.
  2. Click **Simulate Tamper Attack (Block #1)**.
  3. Click **Verify Chain** again -> The system immediately flags: **"BROKEN CHAIN AT BLOCK #1. Hash mismatch!"**
- **Say**:
  > *"Notice our honesty rule: The hash chain proves immutability and sequence, not physical truth. A human verifier always makes the final call."*

---

### Phase 5: Independent Verification & Closing (3:30 - 4:00)
- **Show Terminal**: Run `python verify.py`
  ```bash
  python verify.py
  ```
- **Say**:
  > *"An independent third-party auditor can run this standalone zero-dependency Python script against our exported inputs. It recomputes the IPCC Tier-2 equations and matches our golden figures: 2.585 gross / 2.197 issuable.*
  >
  > *Carbon Kheti makes smallholder carbon auditable, affordable, and honest. Thank you."*

---

## Fail-Safe Emergency Runbook (Live Demo Recovery)

| Failure Scenario | Why It Happens | Emergency Recovery Action (< 5 seconds) |
|---|---|---|
| **Venue Wi-Fi drops completely** | Weak venue router or network congestion | **Zero impact.** The app has a bundled offline demo snapshot (`src/data/demoSnapshot.json`). Everything runs locally without a glitch. |
| **Indoor GPS has no satellite fix** | Thick concrete walls in auditorium | Tap **Replay Simulation (Standard 1.25 ha)** on the Walk Boundary screen. Clearly explain: *"Simulated walk replay provided for indoor demonstration."* |
| **Presenter locks phone account with typos** | 5 consecutive wrong passwords | Go to **Verifier Console -> Tab 9 (Backend Console)** -> Enter phone number -> Click **Unlock Account**. Resets lockout instantly! |
| **Judges ask to see raw backend code** | Technical due diligence | Open browser to `http://localhost:8000/docs` to show the live FastAPI OpenAPI documentation and interactive swagger execution. |
| **Phone screen turns off / sleep** | Inactive timer | Screen Wake Lock is enabled by default. If it dims, tap screen once. The partial walk track is preserved in local storage and auto-resumes. |
