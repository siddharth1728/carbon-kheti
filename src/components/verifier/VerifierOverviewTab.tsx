import React from 'react';
import { MapPin, Trees, User, Layers, AlertOctagon } from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';
import { computeInnerBufferPolygon } from '../../core/geometry';

export const VerifierOverviewTab: React.FC = () => {
  const { plots, selectedPlotId, setSelectedPlotId, currentPlot } = useMRVStore();

  const bufferInfo = computeInnerBufferPolygon(currentPlot.polygon);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 6 Plot Archetypes Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {Object.entries(plots).map(([pid, p]) => {
          const isSelected = selectedPlotId === pid;
          let statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
          let statusLabel = 'Clear';

          if (p.status === 'insufficient_data') {
            statusBadge = 'bg-amber-100 text-amber-800 border-amber-200';
            statusLabel = 'Small / Edge';
          } else if (p.status === 'needs_review') {
            statusBadge = 'bg-sky-100 text-sky-800 border-sky-200';
            statusLabel = 'Radar Fallback';
          } else if (p.status === 'on_hold') {
            statusBadge = 'bg-red-100 text-red-800 border-red-200';
            statusLabel = p.id === 'TS-NZB-05' ? 'Overlap >5%' : 'Mismatch Hold';
          }

          return (
            <button
              key={pid}
              onClick={() => setSelectedPlotId(pid)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#1a3c2a] ring-2 ring-[#2d6a4f]/30 shadow-md'
                  : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[11px] font-bold text-slate-500">{pid}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${statusBadge}`}>
                  {statusLabel}
                </span>
              </div>
              <p className="font-bold text-xs text-[#1a3c2a] truncate">{p.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{p.farmerName} • {p.district}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Plot Hero Details */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-[#1a3c2a]">{currentPlot.name}</h3>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                {currentPlot.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Village: <strong className="text-slate-700">{currentPlot.village}</strong> • Mandal: <strong className="text-slate-700">{currentPlot.mandal}</strong> • District: <strong className="text-slate-700">{currentPlot.district}</strong> • Passbook: <strong className="font-mono text-slate-700">{currentPlot.passbookNo}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${
                currentPlot.status === 'clear'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : currentPlot.status === 'needs_review'
                  ? 'bg-sky-100 text-sky-800 border-sky-200'
                  : currentPlot.status === 'insufficient_data'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}
            >
              {currentPlot.status === 'clear'
                ? '✅ Clear Verified'
                : currentPlot.status === 'needs_review'
                ? 'ℹ️ Needs Review (Radar Active)'
                : currentPlot.status === 'insufficient_data'
                ? '⚠️ Insufficient Data (<8 px)'
                : '⛔ Verification On Hold'}
            </span>
          </div>
        </div>

        {/* Status Hold Banner if active */}
        {currentPlot.status === 'on_hold' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-red-900">VERIFICATION WITHHELD: {currentPlot.holdReason}</p>
              <p className="text-red-700">Resolution path: {currentPlot.resolutionSteps}</p>
            </div>
          </div>
        )}

        {/* 4 Metadata Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#2d6a4f]" /> Farmer
            </span>
            <p className="text-sm font-extrabold text-[#1a3c2a] mt-0.5">{currentPlot.farmerName}</p>
            <p className="text-[11px] text-slate-500 font-mono">{currentPlot.phone}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#2d6a4f]" /> Area (UTM 44N)
            </span>
            <p className="text-sm font-extrabold text-[#1a3c2a] mt-0.5">{currentPlot.areaAcres} Acres</p>
            <p className="text-[11px] text-slate-500">{currentPlot.areaHa} ha ({currentPlot.areaM2.toLocaleString()} m²)</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Trees className="w-3.5 h-3.5 text-[#2d6a4f]" /> Species &amp; Age
            </span>
            <p className="text-sm font-extrabold text-[#1a3c2a] mt-0.5 truncate">{currentPlot.species.join(', ')}</p>
            <p className="text-[11px] text-slate-500">Planted {currentPlot.plantingYear} (~{currentPlot.treeCountEstimated} trees)</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#2d6a4f]" /> Usable Inner Pixels
            </span>
            <p className="text-sm font-extrabold text-[#1a3c2a] mt-0.5">
              {bufferInfo.effectivePixels.toFixed(1)} px
            </p>
            <p className="text-[11px] text-slate-500">After 10m inner buffer</p>
          </div>
        </div>
      </div>

      {/* Cartographic GIS Map & Spatial Geometry Visualization */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <h4 className="font-bold text-sm text-[#1a3c2a] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2d6a4f]" />
              Spatial Vector Geometry &amp; 10m Inner Buffer
            </h4>
            <p className="text-xs text-slate-500">
              WGS84 EPSG:4326 projected to UTM Zone 44N (EPSG:32644) metric planar coordinates
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-[#1a3c2a]">
              <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span> Registered Polygon
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-3 h-3 rounded bg-amber-400 border border-dashed border-amber-700 inline-block"></span> 10m Inner Buffer
            </span>
            {currentPlot.id === 'TS-NZB-05' && (
              <span className="flex items-center gap-1 text-red-700">
                <span className="w-3 h-3 rounded bg-red-400 inline-block"></span> Adjacent Overlap (&gt;5%)
              </span>
            )}
          </div>
        </div>

        {/* SVG Spatial Canvas */}
        <div className="w-full h-80 bg-slate-900 rounded-2xl relative overflow-hidden border border-slate-800 flex items-center justify-center p-6">
          {/* Subtle cartographic grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]"></div>

          <div className="absolute top-3 left-4 text-[10px] font-mono text-emerald-400">
            PROJECTION: UTM 44N • EPSG:32644 • GRID: 10m x 10m (Sentinel-2 Pixel)
          </div>
          <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-400">
            Centroid: {currentPlot.lat.toFixed(4)}°N, {currentPlot.lon.toFixed(4)}°E
          </div>

          <svg viewBox="0 0 500 260" className="w-full h-full max-w-lg">
            {/* If Nizamabad, show adjacent overlapping polygon */}
            {currentPlot.id === 'TS-NZB-05' && (
              <polygon
                points="240,60 410,60 395,200 230,200"
                fill="rgba(239, 68, 68, 0.3)"
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            )}

            {/* Main Registered Plot Polygon */}
            <polygon
              points="140,40 330,45 315,220 120,210"
              fill="rgba(16, 185, 129, 0.25)"
              stroke="#10b981"
              strokeWidth="2.5"
            />

            {/* 10m Inner Buffer Polygon */}
            {bufferInfo.bufferPolygon && (
              <polygon
                points="160,65 305,70 295,195 145,185"
                fill="rgba(245, 158, 11, 0.2)"
                stroke="#f59e0b"
                strokeWidth="1.8"
                strokeDasharray="4 4"
              />
            )}

            {/* Corner Photo Pins */}
            <circle cx="140" cy="40" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            <text x="140" y="30" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">Corner D</text>

            <circle cx="330" cy="45" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            <text x="330" y="35" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">Corner A</text>

            <circle cx="315" cy="220" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            <text x="315" y="235" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">Corner B</text>

            <circle cx="120" cy="210" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            <text x="120" y="225" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">Corner C</text>

            {/* Center Label */}
            <text x="230" y="130" fill="#a7f3d0" fontSize="11" fontWeight="bold" textAnchor="middle">
              {currentPlot.id} ({currentPlot.areaHa} ha)
            </text>
            <text x="230" y="148" fill="#fde68a" fontSize="9" textAnchor="middle">
              Inner Usable: {bufferInfo.effectivePixels.toFixed(1)} pixels
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};
