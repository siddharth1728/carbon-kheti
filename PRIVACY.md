# Privacy & Data Governance Policy (PRIVACY.md)
**Project:** Carbon Kheti Open MRV Engine (Team DoSA, INNOVASIA 2K26, PS-13)  
**Applicability:** Smallholder Agroforestry Carbon Accounting in India  
**Compliance Standards:** Digital Personal Data Protection Act (DPDPA 2023), Free Prior & Informed Consent (FPIC)

---

## 1. Core Privacy Commitments

1. **No Aadhaar Collection:**
   Carbon Kheti strictly does NOT collect, store, or process 12-digit Aadhaar numbers or Virtual IDs. Land record identification is performed exclusively via state land administration passbook numbers (e.g., Telangana Dharani Pattadar Passbook RoR-1B survey identifiers).
2. **Consent Evidence, Not Biometric Identification:**
   Thumb impressions or signatures collected during farmer onboarding are classified strictly as **"consent evidence"** (proof that the farmer consented to satellite monitoring and the 75% revenue share). Carbon Kheti does NOT perform fingerprint feature extraction, minutiae extraction, or 1:1 / 1:N biometric matching.
3. **Data Minimization & Encryption at Rest:**
   Only metadata necessary for carbon verification (plot coordinates, species planted, planting year, monitoring photos, and revenue disbursement contact details) is retained. All photo evidence and audit records are encrypted at rest using AES-256.
4. **Right to Withdraw & Erasure:**
   Under FPIC standards, an enrolled farmer retains the absolute legal right to withdraw from the agroforestry monitoring program at any time prior to credit issuance. Upon withdrawal, their plot status is updated to `WITHDRAWN`, and future satellite tracking for crediting purposes is ceased.
5. **No Third-Party Commercial Data Brokerage:**
   Farmer land boundaries, crop details, and contact numbers are never sold, licensed, or exposed to predatory agri-input lenders or commodity brokers.

---

## 2. Retention & Deletion Schedule

| Category | Retention Duration | Deletion Trigger |
| :--- | :--- | :--- |
| **Ground Photos** | 5 years post crediting period | End of standard VVB audit archive window |
| **Land Passbook Numbers** | Active enrollment period | Farmer withdrawal request |
| **Audit Log Blocks** | Permanent (Immutable) | Cryptographic provenance record |
| **Phone Number & Session Tokens** | Session expiry (8 hours) | User logout / session invalidation |

---
*Notice: This policy draft is maintained for hackathon demonstration. A formal legal review by certified Indian data protection counsel will precede production deployment.*
