export interface UnitEconomicsParams {
  haSize: number; // 0.2 ha to 10.0 ha
  carbonYieldTCO2e: number; // 1.0 to 3.5 tCO2e/ha/yr
  carbonPriceUsd: number; // $10 to $50 / t
  usdInr: number; // ₹75 to ₹95
  farmerSharePct: number; // default 75%
  traditionalFixedCostUsd: number; // $1,200 baseline audit visit + onboarding
  traditionalPerHaCostUsd: number; // $11.5 / ha
  carbonKhetiFixedCostInr: number; // ₹0
  carbonKhetiPerHaCostInr: number; // ₹100 / ha flat
}

export interface UnitEconomicsResult {
  grossRevUsd: number;
  grossRevInr: number;
  
  // Traditional MRV Drag
  tradFixedCostInr: number;
  tradVariableCostInr: number;
  tradTotalCostInr: number;
  tradCostPct: number; // Cost as % of gross revenue (explodes on small plots)
  tradFarmerNetInr: number;

  // Carbon Kheti Open MRV
  ckTotalCostInr: number;
  ckCostPct: number; // Cost as % of gross revenue (~4.5% flat)
  ckFarmerNetInr: number;

  // Smallholder Benefit
  smallholderSavingsInr: number;
  farmerTakeHome75Inr: number;

  // Farm Size Curve Comparison Points (0.25, 0.5, 1.0, 2.0, 5.0, 10.0 ha)
  curveComparison: Array<{
    farmSizeHa: number;
    tradCostPct: number;
    ckCostPct: number;
  }>;
}
