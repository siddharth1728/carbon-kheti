import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { CloudRain, Radio, Eye, Layers } from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';

export const VerifierPhenologyTab: React.FC = () => {
  const { currentPlot } = useMRVStore();

  // Combine Y1 and Y2 series for chart
  const combinedSeries = React.useMemo(() => {
    return currentPlot.timeSeriesY2.map((pt, idx) => {
      const ptY1 = currentPlot.timeSeriesY1[idx];
      return {
        month: pt.month,
        ndviY1: ptY1?.ndvi,
        ndviY2: pt.ndvi,
        cloudProb: pt.cloudProbability * 100,
        radarVhY1: ptY1?.radarVhDb,
        radarVhY2: pt.radarVhDb,
        isCloudY2: pt.isCloudObscured,
      };
    });
  }, [currentPlot]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-[#1a3c2a] flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#2d6a4f]" />
            Dual-Year Phenology &amp; Sensor Fallback Architecture
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sentinel-2 Optical (10m NDVI) paired with Sentinel-1 SAR C-band Radar (VH backscatter in dB)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-[#d8f3dc] text-[#1a3c2a] rounded-xl border border-[#b7e4c7]">
            Usable Optical: {currentPlot.opticalScenesUsable} / {currentPlot.opticalScenesTotal} scenes
          </span>
        </div>
      </div>

      {/* Dual Sensor Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-sm text-[#1a3c2a]">
              Optical NDVI vs. Radar VH Backscatter (Y1 2024 vs Y2 2025)
            </h4>
            <p className="text-xs text-slate-500">
              Notice optical cloud gaps during Southwest Monsoon (June–September) compensated by Sentinel-1 Radar
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedSeries} margin={{ top: 10, right: 20, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" domain={[0.0, 1.0]} stroke="#059669" fontSize={11} tickLine={false} label={{ value: 'NDVI (0 - 1.0)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#059669' }} />
              <YAxis yAxisId="right" orientation="right" domain={[-20, -5]} stroke="#d97706" fontSize={11} tickLine={false} label={{ value: 'Radar VH (dB)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#d97706' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-2xl shadow-xl border border-slate-800 space-y-1">
                        <p className="font-bold text-emerald-400">{label} Remote Sensing Data</p>
                        <p className="text-slate-300">Y2 NDVI: {payload[0]?.value !== null && payload[0]?.value !== undefined ? payload[0].value : 'Cloud Obscured'}</p>
                        <p className="text-slate-300">Y1 NDVI: {payload[1]?.value !== null && payload[1]?.value !== undefined ? payload[1].value : 'Cloud Obscured'}</p>
                        <p className="text-amber-400">Y2 Radar VH: {payload[2]?.value} dB</p>
                        <p className="text-slate-400 text-[10px]">Cloud Probability: {payload[0]?.payload.cloudProb.toFixed(0)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line yAxisId="left" type="monotone" dataKey="ndviY2" stroke="#059669" strokeWidth={2.5} name="Y2 (2025) Sentinel-2 NDVI" dot={{ r: 3 }} connectNulls={false} />
              <Line yAxisId="left" type="monotone" dataKey="ndviY1" stroke="#a7f3d0" strokeWidth={2} strokeDasharray="4 4" name="Y1 (2024) Sentinel-2 NDVI" dot={{ r: 2 }} connectNulls={false} />
              <Line yAxisId="right" type="monotone" dataKey="radarVhY2" stroke="#d97706" strokeWidth={2} name="Y2 (2025) Sentinel-1 VH Radar" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sensor Switching Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Eye className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs text-[#1a3c2a]">1. Optical Sentinel-2 (Primary)</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            10-meter Red and NIR bands (B4/B8) calculate NDVI with high canopy sensitivity during post-monsoon and dry season months.
          </p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
            <CloudRain className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs text-[#1a3c2a]">2. Cloud Mask Dropouts</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Heavy monsoon cloud probability (&gt;65%) drops optical pixels rather than applying ungrounded interpolation guesswork.
          </p>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs text-[#1a3c2a]">3. Sentinel-1 SAR Radar Fallback</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Active C-band microwaves penetrate clouds seamlessly. When optical scenes drop below 16, radar fallback widens the uncertainty interval.
          </p>
        </div>
      </div>
    </div>
  );
};
