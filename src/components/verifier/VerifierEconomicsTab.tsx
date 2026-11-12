import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DollarSign, TrendingDown, Info } from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';

export const VerifierEconomicsTab: React.FC = () => {
  const { economicsParams, setEconomicsParams, economicsResult } = useMRVStore();

  const formatInr = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-[#1a3c2a] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#2d6a4f]" />
            Unit Economics: Traditional Drag vs. Carbon Kheti Inversion
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrating why traditional fixed MRV costs systematically exclude smallholders under ~2 hectares
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
          Smallholder Savings: {formatInr(economicsResult.smallholderSavingsInr)} / yr
        </div>
      </div>

      {/* 3 Interactive Sliders */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
          Simulation Parameters
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Farm Size (ha)</span>
              <span className="text-[#2d6a4f]">{economicsParams.haSize.toFixed(2)} ha ({(economicsParams.haSize * 2.471).toFixed(2)} Acres)</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="5.0"
              step="0.25"
              value={economicsParams.haSize}
              onChange={(e) => setEconomicsParams({ haSize: parseFloat(e.target.value) })}
              className="w-full accent-[#2d6a4f] cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Biomass Yield (tCO₂e / ha / yr)</span>
              <span className="text-[#2d6a4f]">{economicsParams.carbonYieldTCO2e.toFixed(2)} t/ha</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.5"
              step="0.1"
              value={economicsParams.carbonYieldTCO2e}
              onChange={(e) => setEconomicsParams({ carbonYieldTCO2e: parseFloat(e.target.value) })}
              className="w-full accent-[#2d6a4f] cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Carbon Price (US$ / tCO₂e)</span>
              <span className="text-[#2d6a4f]">${economicsParams.carbonPriceUsd} / t</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="1"
              value={economicsParams.carbonPriceUsd}
              onChange={(e) => setEconomicsParams({ carbonPriceUsd: parseFloat(e.target.value) })}
              className="w-full accent-[#2d6a4f] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] uppercase font-bold text-slate-500">Gross Carbon Value</span>
          <p className="text-2xl font-black text-slate-900">{formatInr(economicsResult.grossRevInr)}</p>
          <p className="text-[11px] text-slate-500">
            ${economicsResult.grossRevUsd.toFixed(1)} USD at ₹{economicsParams.usdInr}/$
          </p>
        </div>

        <div className="bg-red-50/70 p-5 rounded-3xl border border-red-200 shadow-sm space-y-1 text-red-950">
          <span className="text-[11px] uppercase font-bold text-red-700 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Traditional MRV Drag
          </span>
          <p className="text-2xl font-black text-red-900">{economicsResult.tradCostPct.toFixed(1)}%</p>
          <p className="text-[11px] text-red-700">
            {formatInr(economicsResult.tradTotalCostInr)} / yr (Fixed $1,200 audit trip + $11.5/ha)
          </p>
        </div>

        <div className="bg-[#d8f3dc] p-5 rounded-3xl border border-[#b7e4c7] shadow-sm space-y-1 text-[#1a3c2a]">
          <span className="text-[11px] uppercase font-bold text-[#2d6a4f]">Carbon Kheti Open MRV</span>
          <p className="text-2xl font-black text-[#1a3c2a]">{economicsResult.ckCostPct.toFixed(1)}%</p>
          <p className="text-[11px] text-[#2d6a4f]">
            {formatInr(economicsResult.ckTotalCostInr)} / yr (Flat ₹100/ha automated pipeline)
          </p>
        </div>
      </div>

      {/* Cost as % of Revenue vs Farm Size Curve (Recharts) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h4 className="font-bold text-sm text-[#1a3c2a]">
            Cost as % of Revenue vs. Farm Size (The Smallholder Inversion Curve)
          </h4>
          <p className="text-xs text-slate-500">
            Traditional verification costs explode below ~2 hectares due to fixed travel and manual auditing expenses
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={economicsResult.curveComparison} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="farmSizeHa"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                label={{ value: 'Farm Size (Hectares)', position: 'insideBottom', offset: -12, fontSize: 11 }}
              />
              <YAxis
                domain={[0, 150]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                label={{ value: 'Cost (% of Gross Carbon Revenue)', angle: -90, position: 'insideLeft', fontSize: 10 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-2xl shadow-xl border border-slate-800 space-y-1">
                        <p className="font-bold text-emerald-400">Farm Size: {label} ha</p>
                        <p className="text-red-400">Traditional Drag: {payload[0]?.value}% of revenue</p>
                        <p className="text-emerald-400">Carbon Kheti: {payload[1]?.value}% of revenue</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" dataKey="tradCostPct" stroke="#dc2626" strokeWidth={2.5} name="Traditional MRV Cost % (Explodes on small plots)" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="ckCostPct" stroke="#059669" strokeWidth={2.5} name="Carbon Kheti Cost % (Flat ~4.5%)" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explainer Box */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">Mathematical Model:</strong> At {economicsParams.carbonYieldTCO2e} tCO₂e/ha/yr and ${economicsParams.carbonPriceUsd}/t (₹{economicsParams.usdInr}/$), a 1-ha plot earns {formatInr(economicsResult.grossRevInr)}. Traditional MRV charges $1,200 fixed audit visit + $11.5/ha = {formatInr(economicsResult.tradTotalCostInr)} ({economicsResult.tradCostPct.toFixed(0)}% of revenue). Carbon Kheti charges ₹100/ha flat = {formatInr(economicsResult.ckTotalCostInr)} ({economicsResult.ckCostPct.toFixed(1)}% of revenue).
        </div>
      </div>
    </div>
  );
};
