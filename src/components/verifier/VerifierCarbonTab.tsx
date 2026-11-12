import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { BarChart3, HelpCircle, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';

export const VerifierCarbonTab: React.FC = () => {
  const { currentMRV, showTheMathDrawer, setShowTheMathDrawer } = useMRVStore();

  const { bootstrap, deductions } = currentMRV;

  // Prepare histogram buckets from 1,000 bootstrap resamples
  const histogramData = React.useMemo(() => {
    if (!bootstrap || bootstrap.resamples.length === 0) return [];

    const min = Math.min(...bootstrap.resamples);
    const max = Math.max(...bootstrap.resamples);
    const bucketCount = 24;
    const bucketWidth = (max - min) / bucketCount;

    const buckets = Array.from({ length: bucketCount }, (_, i) => ({
      rangeStart: min + i * bucketWidth,
      rangeEnd: min + (i + 1) * bucketWidth,
      label: (min + (i + 0.5) * bucketWidth).toFixed(2),
      count: 0,
    }));

    bootstrap.resamples.forEach((val) => {
      let bIdx = Math.floor((val - min) / bucketWidth);
      if (bIdx >= bucketCount) bIdx = bucketCount - 1;
      if (bIdx < 0) bIdx = 0;
      buckets[bIdx].count++;
    });

    return buckets;
  }, [bootstrap]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-[#1a3c2a]">
              Carbon Engine: Paired Anniversary Bootstrap
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 uppercase font-mono">
              IPCC Tier-2
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Formula: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">dAGB = AGB(Oct 2025) - AGB(Oct 2024)</code> with spatial autocorrelation design effect (D_eff = {bootstrap.designEffect})
          </p>
        </div>

        <button
          onClick={() => setShowTheMathDrawer(!showTheMathDrawer)}
          className="px-4 py-2 bg-[#f4f9f5] hover:bg-[#d8f3dc] text-[#1a3c2a] text-xs font-bold rounded-xl border border-[#b7e4c7] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#2d6a4f]" />
          <span>{showTheMathDrawer ? 'Hide Math Drawer' : 'Show the Math & Assumptions'}</span>
          {showTheMathDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3 Headline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-500">
            Paired Delta dAGB (Mean vs 95% Lower)
          </span>
          <p className="text-2xl font-black text-[#1a3c2a]">
            {currentMRV.meanDagb.toFixed(2)}{' '}
            <span className="text-sm font-normal text-slate-400">vs</span>{' '}
            <span className="text-emerald-700">{currentMRV.lowerBoundDagb.toFixed(2)}</span>{' '}
            <span className="text-xs font-normal text-slate-500">t/ha</span>
          </p>
          <p className="text-[11px] text-slate-500">1,000x spatial bootstrap 5th percentile</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-500">
            Conservative Net Credits
          </span>
          <p className="text-2xl font-black text-emerald-800">
            {currentMRV.finalCreditsPerHa.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-500">tCO₂e / ha / yr</span>
          </p>
          <p className="text-[11px] text-slate-500">Total Farm: {currentMRV.totalFarmCredits.toFixed(2)} tCO₂e / yr</p>
        </div>

        <div className="bg-[#fef3c7] p-5 rounded-3xl border border-[#fde68a] shadow-sm space-y-1 text-[#92400e]">
          <span className="text-[11px] uppercase font-bold">
            Over-Crediting Avoided (Uncertainty Haircut)
          </span>
          <p className="text-2xl font-black">
            {deductions.uncertaintyHaircutCo2ePerHa.toFixed(2)}{' '}
            <span className="text-xs font-normal text-amber-800">tCO₂e / ha</span>
          </p>
          <p className="text-[11px] font-medium text-amber-900">
            Uncertainty paid with credits, not with trust
          </p>
        </div>
      </div>

      {/* 1,000x Bootstrap Distribution Histogram (Recharts) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-sm text-[#1a3c2a] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2d6a4f]" />
              1,000x Paired Spatial Bootstrap Distribution (Pixel Deltas)
            </h4>
            <p className="text-xs text-slate-500">
              Resampling distribution with spatial autocorrelation design effect D_eff = 1.70
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-0.5 bg-emerald-600 inline-block"></span> 5th Percentile Lower Bound ({currentMRV.lowerBoundDagb.toFixed(2)} t/ha)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-0.5 bg-slate-400 inline-block"></span> Sample Mean ({currentMRV.meanDagb.toFixed(2)} t/ha)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                label={{ value: 'Paired Biomass Delta dAGB (t dry biomass / ha)', position: 'insideBottom', offset: -12, fontSize: 11 }}
              />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-xs p-2 rounded-xl shadow-lg border border-slate-800">
                        <p className="font-bold">dAGB: {payload[0].payload.label} t/ha</p>
                        <p className="text-slate-300">Iterations: {payload[0].value} / 1000</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                x={currentMRV.lowerBoundDagb.toFixed(2)}
                stroke="#059669"
                strokeWidth={2.5}
                label={{ value: '95% Lower Bound', position: 'top', fill: '#059669', fontSize: 10, fontWeight: 'bold' }}
              />
              <ReferenceLine
                x={currentMRV.meanDagb.toFixed(2)}
                stroke="#64748b"
                strokeDasharray="3 3"
                label={{ value: 'Mean', position: 'top', fill: '#64748b', fontSize: 10 }}
              />
              <Bar dataKey="count" fill="#2d6a4f" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strictly Separated Deductions Table per Bug B6 */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-sm text-[#1a3c2a] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#2d6a4f]" />
          Itemized Deductions &amp; Conservative Reconciliation
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3 font-bold">Accounting Layer</th>
                <th className="py-2.5 px-3 font-bold">Biomass Value</th>
                <th className="py-2.5 px-3 font-bold">CO₂e Value</th>
                <th className="py-2.5 px-3 font-bold">Methodological Source / Derivation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Gross Mean Delta (AGB)</td>
                <td className="py-2.5 px-3 font-mono">{currentMRV.meanDagb.toFixed(2)} t/ha</td>
                <td className="py-2.5 px-3 font-mono">{currentMRV.grossMeanCo2ePerHa.toFixed(2)} tCO₂e/ha</td>
                <td className="py-2.5 px-3 text-slate-500">Paired anniversary regression Oct 2025 vs Oct 2024</td>
              </tr>
              <tr className="bg-amber-50/50">
                <td className="py-2.5 px-3 font-bold text-amber-950">1. Uncertainty Haircut (Mean - Lower Bound)</td>
                <td className="py-2.5 px-3 font-mono text-amber-900">-{(currentMRV.meanDagb - currentMRV.lowerBoundDagb).toFixed(2)} t/ha</td>
                <td className="py-2.5 px-3 font-mono text-amber-900">-{deductions.uncertaintyHaircutCo2ePerHa.toFixed(2)} tCO₂e/ha</td>
                <td className="py-2.5 px-3 text-amber-800">Over-crediting avoided; pays for uncertainty with credits</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">2. Derived Baseline Deduction</td>
                <td className="py-2.5 px-3 font-mono">-{currentMRV.derivedBaselineDagb.toFixed(2)} t/ha</td>
                <td className="py-2.5 px-3 font-mono">-{deductions.baselineDeductionCo2ePerHa.toFixed(2)} tCO₂e/ha</td>
                <td className="py-2.5 px-3 text-slate-500">Derived from regional matched non-agroforestry control plot</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">3. Leakage Deduction</td>
                <td className="py-2.5 px-3 font-mono">0.00 t/ha</td>
                <td className="py-2.5 px-3 font-mono">0.00 tCO₂e/ha</td>
                <td className="py-2.5 px-3 text-slate-500">0.0% (Farm boundary planting does not displace crop production)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">4. Permanence Risk Buffer (15%)</td>
                <td className="py-2.5 px-3 font-mono">—</td>
                <td className="py-2.5 px-3 font-mono">-{deductions.permanenceBufferCo2ePerHa.toFixed(2)} tCO₂e/ha</td>
                <td className="py-2.5 px-3 text-slate-500">15.0% held in pooled non-reversal permanence reserve</td>
              </tr>
              <tr className="bg-[#f4f9f5] font-black text-[#1a3c2a] text-sm">
                <td className="py-3 px-3">VERIFICATION-READY ESTIMATE</td>
                <td className="py-3 px-3 font-mono">{currentMRV.lowerBoundDagb.toFixed(2)} t/ha (Net)</td>
                <td className="py-3 px-3 font-mono text-emerald-800">{currentMRV.finalCreditsPerHa.toFixed(2)} tCO₂e/ha/yr</td>
                <td className="py-3 px-3 text-emerald-900 font-bold">Conservative lower-bound ready for VVB audit submission</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Show the Math Drawer */}
      {showTheMathDrawer && (
        <div className="bg-slate-900 text-slate-200 p-6 rounded-3xl space-y-4 font-mono text-xs animate-in slide-in-from-top-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h4 className="font-bold text-emerald-400 text-sm">Detailed Parameter &amp; Assumption Basis</h4>
            <span className="text-[10px] text-slate-400">RFC / IPCC GPG 2006 Reference</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed">
            <div className="space-y-2">
              <p><strong className="text-white">Belowground Root Ratio (R):</strong> 0.25 (IPCC default for tropical dry agroforestry)</p>
              <p><strong className="text-white">Carbon Fraction (CF):</strong> 0.47 tonnes C per dry biomass tonne</p>
              <p><strong className="text-white">CO₂e Factor:</strong> 44 / 12 = 3.6667 (stoichiometric mass ratio)</p>
              <p><strong className="text-white">Design Effect (D_eff):</strong> 1 + 2*(0.35) = 1.70 (Moran&apos;s I spatial autocorrelation)</p>
            </div>
            <div className="space-y-2">
              <p><strong className="text-white">Inner Buffer:</strong> -10m planar polygon buffer (eliminates boundary pixel mix)</p>
              <p><strong className="text-white">Confidence Level:</strong> 95% one-sided lower bound (5th percentile of 1000 resamples)</p>
              <p><strong className="text-white">Risk Buffer Pool:</strong> 15% permanence retention</p>
              <p><strong className="text-white">Additionality:</strong> Derived dynamic baseline subtracted before issuance</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
