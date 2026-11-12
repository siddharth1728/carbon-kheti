export interface MRVParameters {
  rootToShootRatio: number; // R = 0.25 (IPCC agroforestry)
  carbonFraction: number; // 0.47 t C / t dry biomass
  co2eStoichiometricRatio: number; // 44 / 12 = 3.6667
  leakagePct: number; // 0.0% for boundary agroforestry
  permanenceBufferPct: number; // 15.0% risk reserve pool
  confidenceZScore: number; // 1.645 (one-sided 95% confidence lower bound)
  spatialAutocorrelationRho: number; // rho = 0.35 -> Deff = 1 + 2*rho = 1.7
}

export interface BootstrapDistribution {
  iterations: number;
  resamples: number[]; // 1,000 bootstrap estimates
  mean: number;
  stdError: number;
  designEffect: number;
  percentile5th: number; // Conservative 95% lower bound
  percentile50th: number; // Median
  percentile95th: number;
}

export interface MRVCalculationResult {
  plotId: string;
  usablePixels: number;
  isInsufficientData: boolean; // Usable pixels < 8
  isWithheldDueToHold: boolean;
  holdReason?: string;

  // True Paired anniversary dAGB: AGB(Y2) - AGB(Y1)
  meanDagb: number; // t dry biomass / ha
  lowerBoundDagb: number; // 5th percentile lower bound
  bootstrap: BootstrapDistribution;

  // Derived dynamic baseline (from matched control plot or Y1 regional trajectory)
  derivedBaselineDagb: number; // t dry biomass / ha / yr

  // Gross Estimates before deductions
  grossMeanCo2ePerHa: number; // tCO2e / ha / yr
  grossLowerBoundCo2ePerHa: number; // tCO2e / ha / yr

  // Itemized Deductions (strictly separated per B6)
  deductions: {
    uncertaintyHaircutCo2ePerHa: number; // Mean - Lower Bound (Over-crediting avoided ONLY)
    baselineDeductionCo2ePerHa: number; // Baseline * (1 + R) * 0.47 * (44/12)
    leakageDeductionCo2ePerHa: number; // 0
    permanenceBufferCo2ePerHa: number; // 15% buffer holdback
  };

  // Final Net Verifiable Output
  finalCreditsPerHa: number; // tCO2e / ha / yr (0 if lowerBound <= 0)
  totalFarmCredits: number; // finalCreditsPerHa * areaHa
  whyZeroReason?: string; // If finalCredits <= 0

  // Economic Translation for Farmer
  payoutRangeInr: {
    lowRupees: number;
    likelyRupees: number;
    highRupees: number;
    farmerSharePct: number; // 75%
  };

  parameters: MRVParameters;
}
