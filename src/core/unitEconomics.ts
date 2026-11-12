import { UnitEconomicsParams, UnitEconomicsResult } from '../types/economics';

export const DEFAULT_UNIT_ECONOMICS_PARAMS: UnitEconomicsParams = {
  haSize: 1.0, // 1.0 ha (~2.47 acres)
  carbonYieldTCO2e: 1.85, // 1.85 tCO2e/ha/yr realistic agroforestry yield
  carbonPriceUsd: 25.0, // $25 / tCO2e
  usdInr: 88.0, // ₹88 / US$
  farmerSharePct: 75.0, // 75% direct farmer revenue share
  traditionalFixedCostUsd: 1200.0, // $1,200 fixed audit visit & auditor travel
  traditionalPerHaCostUsd: 11.5, // $11.5 / ha per-hectare variable
  carbonKhetiFixedCostInr: 0.0, // ₹0 fixed automated ingestion
  carbonKhetiPerHaCostInr: 100.0, // ₹100 / ha automated MRV fee
};

export function calculateUnitEconomics(params: UnitEconomicsParams = DEFAULT_UNIT_ECONOMICS_PARAMS): UnitEconomicsResult {
  const {
    haSize,
    carbonYieldTCO2e,
    carbonPriceUsd,
    usdInr,
    farmerSharePct,
    traditionalFixedCostUsd,
    traditionalPerHaCostUsd,
    carbonKhetiFixedCostInr,
    carbonKhetiPerHaCostInr,
  } = params;

  // 1. Gross Revenue
  const grossRevUsd = haSize * carbonYieldTCO2e * carbonPriceUsd;
  const grossRevInr = grossRevUsd * usdInr;

  // 2. Traditional MRV Costs (Fixed + Variable)
  const tradFixedCostInr = traditionalFixedCostUsd * usdInr;
  const tradVariableCostInr = haSize * traditionalPerHaCostUsd * usdInr;
  const tradTotalCostInr = tradFixedCostInr + tradVariableCostInr;
  const tradCostPct = grossRevInr > 0 ? (tradTotalCostInr / grossRevInr) * 100 : 0;
  const tradFarmerNetInr = Math.max(0, grossRevInr - tradTotalCostInr);

  // 3. Carbon Kheti MRV Costs (Near-zero fixed + ₹100/ha flat)
  const ckTotalCostInr = carbonKhetiFixedCostInr + haSize * carbonKhetiPerHaCostInr;
  const ckCostPct = grossRevInr > 0 ? (ckTotalCostInr / grossRevInr) * 100 : 0;
  const ckFarmerNetInr = Math.max(0, grossRevInr - ckTotalCostInr);

  // 4. Farmer 75% Share Take-Home
  const farmerTakeHome75Inr = Math.round(grossRevInr * (farmerSharePct / 100.0));
  const smallholderSavingsInr = Math.max(0, tradTotalCostInr - ckTotalCostInr);

  // 5. Farm Size Comparison Curve (demonstrating explosion below 2 ha)
  const curveSizes = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0];
  const curveComparison = curveSizes.map((size) => {
    const rev = size * carbonYieldTCO2e * carbonPriceUsd * usdInr;
    const tradCost = traditionalFixedCostUsd * usdInr + size * traditionalPerHaCostUsd * usdInr;
    const ckCost = size * carbonKhetiPerHaCostInr;

    return {
      farmSizeHa: size,
      tradCostPct: Math.min(600, Number(((tradCost / rev) * 100).toFixed(1))),
      ckCostPct: Number(((ckCost / rev) * 100).toFixed(1)),
    };
  });

  return {
    grossRevUsd,
    grossRevInr,
    tradFixedCostInr,
    tradVariableCostInr,
    tradTotalCostInr,
    tradCostPct,
    tradFarmerNetInr,
    ckTotalCostInr,
    ckCostPct,
    ckFarmerNetInr,
    smallholderSavingsInr,
    farmerTakeHome75Inr,
    curveComparison,
  };
}
