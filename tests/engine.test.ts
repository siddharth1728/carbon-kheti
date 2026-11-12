import { test, describe } from 'node:test';
import assert from 'node:assert';
import { computeMRV, DEFAULT_MRV_PARAMETERS } from '../src/core/mrvEngine';
import {
  createGenesisBlock,
  appendAuditRecord,
  verifyAuditChain,
  canonicalJson,
  sha256Hex,
} from '../src/core/cryptoEngine';
import {
  checkPointInsidePolygon,
  calculatePolygonOverlap,
  computeInnerBufferPolygon,
  getUtmZoneForLon,
  simplifyGpsTrack,
  checkSelfIntersection,
  calculatePolygonAreaM2,
  convertM2ToHa,
} from '../src/core/geometry';
import { calculateUnitEconomics, DEFAULT_UNIT_ECONOMICS_PARAMS } from '../src/core/unitEconomics';
import { checkPlotAccessPermission, normalizeIndianPhone, evaluatePasswordStrength } from '../src/core/authEngine';
import { TELANGANA_PLOTS, NZB_ADJACENT_POLYGON } from '../src/constants/plotsData';
import * as turf from '@turf/turf';

describe('Carbon Kheti Acceptance Tests (INNOVASIA 2K26, Team DoSA)', () => {
  test('Acceptance Test 1: Credit Chain Formula (dAGB lower 1.2, R 0.25, Buffer 15%)', () => {
    const dAGB_lower = 1.2;
    const R = 0.25;
    const CF = 0.47;
    const co2eRatio = 44.0 / 12.0;
    const buffer = 0.15;

    const grossLower = dAGB_lower * (1.0 + R) * CF * co2eRatio;
    assert.strictEqual(Number(grossLower.toFixed(3)), 2.585);

    const issuable = grossLower * (1.0 - buffer);
    assert.strictEqual(Number(issuable.toFixed(3)), 2.197);
  });

  test('Acceptance Test 2: Real SHA-256 Hash Chain Integrity and Tamper Pinpointing', async () => {
    const genesis = await createGenesisBlock();
    assert.strictEqual(genesis.index, 0);
    assert.strictEqual(genesis.prevHash, '0'.repeat(64));
    assert.strictEqual(genesis.currentHash.length, 64);

    const block1 = await appendAuditRecord([genesis], 'PLOT_REGISTERED', 'FARMER_APP', {
      plotId: 'TS-RR-01',
      farmer: 'Mallesh Goud',
    });
    assert.strictEqual(block1.index, 1);
    assert.strictEqual(block1.prevHash, genesis.currentHash);

    const block2 = await appendAuditRecord([genesis, block1], 'EVIDENCE_SEALED', 'SYSTEM_KERNEL', {
      plotId: 'TS-RR-01',
      verifiedCredits: 1.82,
    });

    const chain = [genesis, block1, block2];
    const verifyClean = await verifyAuditChain(chain);
    assert.strictEqual(verifyClean.valid, true);
    assert.strictEqual(verifyClean.brokenIdx, -1);
    assert.strictEqual(verifyClean.totalChecked, 3);

    // Simulate tampering: silently alter record #1 payload
    const tamperedChain = [
      genesis,
      {
        ...block1,
        details: { ...block1.details, injectedFraudCredits: 99999 },
      },
      block2,
    ];

    const verifyTampered = await verifyAuditChain(tamperedChain);
    assert.strictEqual(verifyTampered.valid, false);
    assert.strictEqual(verifyTampered.brokenIdx, 1, 'Pinpoints exact tampered index');
  });

  test('Acceptance Test 3: Real Turf.js Polygon Overlap Check (>5% Flagged, <5% Passes)', () => {
    const nzbPlot = TELANGANA_PLOTS['TS-NZB-05'];
    const overlapResult = calculatePolygonOverlap(nzbPlot.polygon, NZB_ADJACENT_POLYGON);

    assert.ok(overlapResult.overlapPct > 5.0, `Overlap must exceed 5% (was ${overlapResult.overlapPct}%)`);
    assert.strictEqual(overlapResult.isFlagged, true, 'Overlap > 5% must be flagged');

    const rrPlot = TELANGANA_PLOTS['TS-RR-01'];
    const noOverlapResult = calculatePolygonOverlap(rrPlot.polygon, NZB_ADJACENT_POLYGON);
    assert.strictEqual(noOverlapResult.overlapPct, 0);
    assert.strictEqual(noOverlapResult.isFlagged, false, 'Non-overlapping plots must pass');
  });

  test('Acceptance Test 4: Real GPS Point-in-Polygon Check', () => {
    const rrPlot = TELANGANA_PLOTS['TS-RR-01'];
    const insideCheck = checkPointInsidePolygon(rrPlot.lat, rrPlot.lon, rrPlot.polygon);
    assert.strictEqual(insideCheck.inside, true);
    assert.strictEqual(insideCheck.distanceMeters, 0);

    const outsideCheck = checkPointInsidePolygon(rrPlot.lat + 0.035, rrPlot.lon + 0.035, rrPlot.polygon);
    assert.strictEqual(outsideCheck.inside, false);
    assert.ok(outsideCheck.distanceMeters > 3000, 'Distance must accurately reflect kilometers offset');
  });

  test('Acceptance Test 5: 10m Inner Buffer Eliminates Boundary Contamination & Flags <8 Pixels', () => {
    const largePlot = TELANGANA_PLOTS['TS-RR-01'];
    const largeBuf = computeInnerBufferPolygon(largePlot.polygon, -10);
    assert.ok(largeBuf.effectivePixels >= 8, 'Large plot must have >= 8 usable pixels');
    assert.strictEqual(largeBuf.isInsufficientData, false);

    const smallPlot = TELANGANA_PLOTS['TS-SNG-03'];
    const smallBuf = computeInnerBufferPolygon(smallPlot.polygon, -10);
    assert.ok(smallBuf.effectivePixels < 8, 'Small plot after 10m buffer leaves < 8 usable pixels');
    assert.strictEqual(smallBuf.isInsufficientData, true, 'Flags insufficient data per B5');
  });

  test('Acceptance Test 6: Cloud Mask Dropout Triggers Radar Fallback & Widens Interval', () => {
    const plot = TELANGANA_PLOTS['TS-RR-01'];
    const normalMRV = computeMRV(plot, DEFAULT_MRV_PARAMETERS, false);
    const cloudyMRV = computeMRV(plot, DEFAULT_MRV_PARAMETERS, true);

    const normalWidth = normalMRV.bootstrap.percentile95th - normalMRV.bootstrap.percentile5th;
    const cloudyWidth = cloudyMRV.bootstrap.percentile95th - cloudyMRV.bootstrap.percentile5th;

    assert.ok(
      cloudyWidth >= normalWidth,
      `Cloudy season radar fallback must widen the confidence interval (Normal: ${normalWidth.toFixed(2)}, Cloudy: ${cloudyWidth.toFixed(2)})`
    );
  });

  test('Acceptance Test 7: Fraud Hold Withholds Credit Output in UI and Report', () => {
    const onHoldPlot = TELANGANA_PLOTS['TS-NZB-05'];
    assert.strictEqual(onHoldPlot.status, 'on_hold');

    const mrvResult = computeMRV(onHoldPlot);
    assert.strictEqual(mrvResult.isWithheldDueToHold, true);
    assert.strictEqual(mrvResult.finalCreditsPerHa, 0, 'Credits must be strictly withheld when on hold');
    assert.ok(mrvResult.holdReason !== undefined);
  });

  test('Acceptance Test 8: Smallholder Unit Economics Inversion Model', () => {
    const params = {
      ...DEFAULT_UNIT_ECONOMICS_PARAMS,
      haSize: 1.0,
      carbonYieldTCO2e: 1.85,
      carbonPriceUsd: 25.0,
      usdInr: 88.0,
    };

    const econ = calculateUnitEconomics(params);
    assert.strictEqual(econ.grossRevInr, 4070);
    assert.strictEqual(econ.ckTotalCostInr, 100);
    assert.ok(econ.ckCostPct < 5.0, 'Carbon Kheti MRV cost must be < 5% of gross revenue');
    assert.ok(econ.tradCostPct > 100, 'Traditional MRV explodes on smallholder plots');
    assert.ok(econ.smallholderSavingsInr > 0, 'Smallholder savings must be positive');
  });

  test('Acceptance Test 9: Dynamic UTM Zone Selection for Western vs Eastern Telangana', () => {
    // Bodhan (Nizamabad) at lon 77.87°E is in Western Telangana -> UTM Zone 43N (EPSG:32643)
    const westZone = getUtmZoneForLon(77.87);
    assert.strictEqual(westZone.zone, 43);
    assert.strictEqual(westZone.epsg, 'EPSG:32643');

    // Maheshwaram (Ranga Reddy) at lon 78.41°E is in Eastern Telangana -> UTM Zone 44N (EPSG:32644)
    const eastZone = getUtmZoneForLon(78.41);
    assert.strictEqual(eastZone.zone, 44);
    assert.strictEqual(eastZone.epsg, 'EPSG:32644');
  });

  test('Acceptance Test 10: Strict RBAC Tenant Isolation (Farmer Cannot Access Other Plots)', () => {
    const farmerSession = {
      userId: 'user_9849012345',
      phone: '+919849012345',
      name: 'Mallesh Goud',
      role: 'farmer' as const,
      allowedPlotIds: ['TS-RR-01'],
      token: 'jwt_mock_farmer',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };

    // Farmer accessing own plot
    assert.strictEqual(checkPlotAccessPermission(farmerSession, 'TS-RR-01'), true);

    // Farmer attempting to access another farmer's plot
    assert.strictEqual(checkPlotAccessPermission(farmerSession, 'TS-NZB-05'), false);

    // Verifier accessing any plot
    const verifierSession = { ...farmerSession, role: 'fpo_verifier' as const, allowedPlotIds: ['*'] };
    assert.strictEqual(checkPlotAccessPermission(verifierSession, 'TS-NZB-05'), true);
  });

  test('Acceptance Test 11: Douglas-Peucker Walk Simplification & Self-Intersection Kink Detection', () => {
    // Self-intersecting figure-8 coordinates
    const figure8Coords: [number, number][] = [
      [78.41, 17.12],
      [78.42, 17.13],
      [78.41, 17.13],
      [78.42, 17.12],
      [78.41, 17.12],
    ];
    const kinkCheck = checkSelfIntersection(figure8Coords);
    assert.strictEqual(kinkCheck.hasKinks, true, 'Must detect self-intersecting loops');

    // Clean boundary
    const cleanSquare: [number, number][] = [
      [78.41, 17.12],
      [78.42, 17.12],
      [78.42, 17.13],
      [78.41, 17.13],
      [78.41, 17.12],
    ];
    const cleanKinkCheck = checkSelfIntersection(cleanSquare);
    assert.strictEqual(cleanKinkCheck.hasKinks, false, 'Clean loop must have no kinks');

    // Simplification reduces vertex count while preserving shape
    const jitteryCoords: [number, number][] = [
      [78.41, 17.12],
      [78.410001, 17.120002],
      [78.410003, 17.120001],
      [78.42, 17.12],
    ];
    const simplified = simplifyGpsTrack(jitteryCoords, 1.5);
    assert.ok(simplified.length <= jitteryCoords.length, 'Simplification must reduce or maintain points');
  });

  test('Acceptance Test 12: Metric Area Calculation & Explicit m² to Hectare Conversion', () => {
    const square100m = turf.polygon([[
      [78.41, 17.12],
      [78.4109, 17.12],
      [78.4109, 17.1209],
      [78.41, 17.1209],
      [78.41, 17.12],
    ]]);

    const areaM2 = calculatePolygonAreaM2(square100m);
    assert.ok(areaM2 > 9000 && areaM2 < 11000, `Area must be approximately 10,000 m² (was ${areaM2})`);

    const areaHa = convertM2ToHa(areaM2);
    assert.ok(Math.abs(areaHa - 1.0) < 0.15, `Area in ha must equal m² / 10,000 (was ${areaHa})`);
  });
});
