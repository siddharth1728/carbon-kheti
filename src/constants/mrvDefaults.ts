import { MRVParameters } from '../types/mrv';

export const DEFAULT_MRV_PARAMETERS: MRVParameters = {
  rootToShootRatio: 0.25, // IPCC default 25% below-ground biomass addition
  carbonFraction: 0.47, // 0.47 tonnes C per dry biomass
  co2eStoichiometricRatio: 44.0 / 12.0, // 3.6667 (molecular ratio of CO2 to C)
  leakagePct: 0.0, // Zero leakage deduction for agroforestry boundary planting
  permanenceBufferPct: 0.15, // 15% permanence buffer pool holdback
  confidenceZScore: 1.645, // 95% lower-bound confidence
  spatialAutocorrelationRho: 0.35, // Moran's I spatial autocorrelation
};

export const EXCLUDED_POOLS = [
  {
    name: 'Dead Wood',
    reason: 'Excluded from conservative baseline to prevent over-crediting without destructive sampling.',
  },
  {
    name: 'Litter',
    reason: 'Excluded due to seasonal turnover and rapid decomposition during monsoon in Telangana.',
  },
  {
    name: 'Soil Organic Carbon (SOC)',
    reason: 'Excluded without physical soil core lab validation to uphold integrity.',
  },
];

export const METHOD_LIMITATIONS = [
  'All plot and satellite time-series data are synthetic (fixed random seed for reproducible demo).',
  'Biomass regression is an illustrative relationship (not field-validated for all regional species).',
  'Cryptographic SHA-256 hash chain proves immutability and provenance of logs, not physical ground truth.',
];
