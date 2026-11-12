import { TELANGANA_PLOTS } from '../src/constants/plotsData';
import { computeMRV } from '../src/core/mrvEngine';
import { createGenesisBlock, appendAuditRecord } from '../src/core/cryptoEngine';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const plot = TELANGANA_PLOTS['TS-RR-01'];
  const mrv = computeMRV(plot);
  const genesis = await createGenesisBlock();
  const sealedRecord = await appendAuditRecord(
    genesis,
    'PLOT_REPORT_SEALED',
    plot.id,
    {
      plotName: plot.name,
      issuableTCO2e: Number(mrv.finalCreditsPerHa.toFixed(2)),
      totalFarmCredits: Number(mrv.totalFarmCredits.toFixed(2)),
      uncertaintyHaircut: Number(mrv.deductions.uncertaintyHaircutCo2ePerHa.toFixed(2)),
      cloudMaskApplied: true,
      bootstrapRuns: 1000,
    }
  );

  const rootHash = sealedRecord.currentHash;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Carbon Kheti MRV Dossier - ${plot.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .container { max-width: 900px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; text-transform: uppercase; }
    .title { font-size: 26px; font-weight: 900; color: #1a3c2a; margin: 8px 0 4px 0; }
    .subtitle { color: #64748b; font-size: 13px; margin: 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin: 24px 0; }
    .card { background: #f1f5f9; padding: 18px; border-radius: 12px; }
    .card h4 { margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 800; }
    .stat-val { font-size: 28px; font-weight: 900; color: #1a3c2a; }
    .stat-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; color: #475569; font-weight: 700; }
    .hash-box { background: #0f172a; color: #38bdf8; font-family: monospace; padding: 14px; border-radius: 10px; font-size: 11px; word-break: break-all; margin-top: 12px; }
    .disclaimer { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 8px; font-size: 12px; color: #92400e; margin: 24px 0; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: #e0f2fe; color: #0369a1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <span class="badge">SYNTHETIC DEMO &bull; VERIFICATION DOSSIER</span>
        <h1 class="title">Carbon Kheti MRV Dossier: ${plot.name}</h1>
        <p class="subtitle">Standard: Open MRV Protocol v1.0 &bull; UTM 44N Telangana &bull; Conservative Lower Bound (B5)</p>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 800; font-size: 16px; color: #1a3c2a;">${plot.id}</div>
        <div style="font-size: 12px; color: #64748b;">${plot.village}, ${plot.mandal}</div>
        <div style="font-size: 11px; color: #94a3b8;">Ranga Reddy District</div>
      </div>
    </div>

    <div class="disclaimer">
      <strong>Honesty Rule:</strong> All inputs and phenology series are synthetic for demo purposes. Not a carbon registry or credit issuer. Computations (Turf.js 10m buffer, UTM 44N projection, 1,000 paired bootstrap resamples, SHA-256 canonical hash chain) run live and deterministic.
    </div>

    <div class="grid">
      <div class="card">
        <h4>Lower-Bound Issuable</h4>
        <div class="stat-val">${mrv.finalCreditsPerHa.toFixed(2)} <span style="font-size:16px; font-weight:600;">tCO2e/ha</span></div>
        <div class="stat-sub">Total Plot: ${mrv.totalFarmCredits.toFixed(2)} tCO2e/yr (1-sided 95% CI)</div>
      </div>
      <div class="card">
        <h4>Avoided Over-Crediting</h4>
        <div class="stat-val" style="color: #0284c7;">${mrv.deductions.uncertaintyHaircutCo2ePerHa.toFixed(2)} <span style="font-size:16px; font-weight:600;">tCO2e/ha</span></div>
        <div class="stat-sub">Haircut deducted = Mean (${mrv.grossMeanCo2ePerHa.toFixed(2)}) - P05</div>
      </div>
      <div class="card">
        <h4>Farmer Est. Revenue (75%)</h4>
        <div class="stat-val" style="color: #166534;">&#8377;${Math.round(mrv.totalFarmCredits * 1650 * 0.75).toLocaleString('en-IN')}</div>
        <div class="stat-sub">At &#8377;1,650/tCO2e ($20/t) benchmark</div>
      </div>
    </div>

    <h3>Land &amp; Remote Sensing Parameters</h3>
    <table>
      <tr><th>Parameter</th><th>Value</th><th>Source / Standard</th></tr>
      <tr><td>Farmer / Title Holder</td><td>${plot.farmerName} (Passbook: ${plot.passbookNo})</td><td>Dharani Land Records Mock</td></tr>
      <tr><td>Area (GPS Polygon)</td><td>${plot.areaAcres} Acres (${plot.areaHa} ha / ${plot.areaM2.toLocaleString()} m&sup2;)</td><td>Turf.js UTM 44N WGS-84</td></tr>
      <tr><td>10m Inner Buffer Pixels</td><td>${mrv.usablePixels.toFixed(1)} pixels (&ge; 8 required)</td><td>Edge exclusion filter</td></tr>
      <tr><td>Sentinel-2 Scenes</td><td>${plot.opticalScenesUsable} usable / ${plot.opticalScenesTotal} total (Cloud mask applied)</td><td>Optical Primary L2A</td></tr>
      <tr><td>Radar Fallback Scenes</td><td>${plot.radarScenesUsable} scenes</td><td>Sentinel-1 C-band SAR</td></tr>
      <tr><td>Mean Paired &Delta;AGB</td><td>${mrv.meanDagb.toFixed(2)} dry t/ha/yr</td><td>GEDI-calibrated L2A Delta</td></tr>
      <tr><td>5th Percentile &Delta;AGB</td><td>${mrv.lowerBoundDagb.toFixed(2)} dry t/ha/yr</td><td>1,000 paired bootstrap (B5)</td></tr>
      <tr><td>Root-to-Shoot Ratio (R)</td><td>${mrv.parameters.rootToShootRatio}</td><td>IPCC Tier 1 Subtropical AGB</td></tr>
      <tr><td>Deductions Applied</td><td>Baseline: ${mrv.derivedBaselineDagb.toFixed(2)} t | Buffer: 15% | Leakage: 0%</td><td>Conservative MRV Standard</td></tr>
      <tr><td>Excluded Carbon Pools</td><td>Dead wood, Litter, Soil Organic Carbon (SOC)</td><td>Conservative non-claim principle</td></tr>
    </table>

    <h3 style="margin-top:28px;">Cryptographic Audit Chain Provenance</h3>
    <p style="font-size:12px; color:#64748b;">The following SHA-256 hash seals this estimation block into the immutable audit trail:</p>
    <div class="hash-box">
      ROOT HASH (SHA-256):<br/>
      ${rootHash}
    </div>
    <div style="font-size:11px; color:#94a3b8; margin-top:6px;">
      Verification: SHA-256 computed via Web Crypto API over canonical JSON. Hash chain guarantees tamper evidence, not physical ground truth.
    </div>

    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 11px; color: #94a3b8;">Carbon Kheti &bull; INNOVASIA 2K26 PS-13 &bull; Team DoSA</span>
      <span class="tag">Sealed &amp; Cryptographically Proven</span>
    </div>
  </div>
</body>
</html>`;

  const outPath1 = path.resolve('carbon_kheti_dossier.html');
  const outPath2 = 'C:/Users/cse la 3 - 6/Downloads/carbon_kheti_dossier.html';

  fs.writeFileSync(outPath1, html, 'utf-8');
  fs.writeFileSync(outPath2, html, 'utf-8');

  console.log('Generated dossier HTML files successfully:');
  console.log(outPath1);
  console.log(outPath2);
}

main().catch(console.error);
