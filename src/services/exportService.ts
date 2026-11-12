import { PlotData } from '../types/plot';
import { MRVCalculationResult } from '../types/mrv';
import { AuditRecord } from '../types/audit';

export interface DossierExportData {
  plot: PlotData;
  mrv: MRVCalculationResult;
  auditChain: AuditRecord[];
}

export function generateReportJSON(data: DossierExportData): string {
  const { plot, mrv, auditChain } = data;
  const rootHash = auditChain.length > 0 ? auditChain[auditChain.length - 1].currentHash : '0'.repeat(64);

  const reportObj = {
    standard: "Carbon Kheti Open MRV Protocol v1.0",
    disclaimer: "SYNTHETIC DEMO DATA — ILLUSTRATIVE MODEL (NOT FIELD-VALIDATED)",
    issuanceClause: "Not a registry or auditor. Outputs verification-ready estimates.",
    generatedAt: new Date().toISOString(),
    plot: {
      id: plot.id,
      name: plot.name,
      farmer: plot.farmerName,
      district: plot.district,
      mandal: plot.mandal,
      village: plot.village,
      passbookNo: plot.passbookNo,
      coordinates: {
        latitude: plot.lat,
        longitude: plot.lon,
        utmZone: "44N"
      },
      areaHa: plot.areaHa,
      areaAcres: plot.areaAcres,
      areaM2: plot.areaM2,
      effectivePixels10mBuffer: Number(mrv.usablePixels.toFixed(1)),
      plotStatus: plot.status
    },
    remoteSensingInputs: {
      opticalScenesTotal: plot.opticalScenesTotal,
      opticalScenesUsable: plot.opticalScenesUsable,
      radarScenesUsable: plot.radarScenesUsable,
      canopyHeightM: plot.canopyHeightM,
      radarFallbackActive: plot.opticalScenesUsable < 16
    },
    biomassAndCarbonCalculations: {
      pairedDeltaAGBMeanDryTonnesPerHa: Number(mrv.meanDagb.toFixed(2)),
      pairedDeltaAGB95LowerBoundTonnesPerHa: Number(mrv.lowerBoundDagb.toFixed(2)),
      rootToShootRatioR: mrv.parameters.rootToShootRatio,
      baselineAdditionalityDeductionTonnesPerHa: Number(mrv.derivedBaselineDagb.toFixed(2)),
      carbonFractionOfDryBiomass: mrv.parameters.carbonFraction,
      co2eStoichiometricFactor: Number(mrv.parameters.co2eStoichiometricRatio.toFixed(4)),
      leakageDeductionPct: mrv.parameters.leakagePct,
      permanenceBufferPoolDeductionPct: mrv.parameters.permanenceBufferPct
    },
    estimates: {
      grossMeanEstimateTCO2ePerHaPerYr: Number(mrv.grossMeanCo2ePerHa.toFixed(2)),
      conservativeLowerBoundVerifiableTCO2ePerHaPerYr: Number(mrv.finalCreditsPerHa.toFixed(2)),
      totalVerifiableCreditsPerYr: Number(mrv.totalFarmCredits.toFixed(2)),
      avoidedOverCreditingTCO2ePerHaPerYr: Number(mrv.deductions.uncertaintyHaircutCo2ePerHa.toFixed(2))
    },
    excludedPools: [
      "Dead wood (excluded from conservative baseline)",
      "Litter (excluded due to seasonal monsoon decay)",
      "Soil organic carbon / SOC (excluded without physical soil core lab validation)"
    ],
    integrityProvenance: {
      auditChainLength: auditChain.length,
      rootTamperEvidentHash: rootHash,
      cryptographicHonestyRule: "Hash chain proves provenance and immutability, not physical truth."
    }
  };

  return JSON.stringify(reportObj, null, 2);
}

export function triggerFileDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
