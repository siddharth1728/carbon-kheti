import React from 'react';
import { X, ShieldAlert, CheckCircle2, FileText, Lock, Cpu } from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';

export const MethodsModal: React.FC = () => {
  const { methodsModalOpen, setMethodsModalOpen } = useMRVStore();

  if (!methodsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#fdfcf9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d8f3dc] flex items-center justify-center text-[#1b4332]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1b4332]">Methods, Assumptions &amp; Limitations</h3>
              <p className="text-xs text-slate-500">Carbon Kheti Open MRV Protocol v1.0 • Telangana (UTM 44N)</p>
            </div>
          </div>
          <button
            onClick={() => setMethodsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Synthetic Demo Notice */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
            <h4 className="font-bold text-amber-900 flex items-center gap-2 text-xs uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              Demo Data &amp; Synthetic Model Disclosure
            </h4>
            <p className="text-xs text-amber-800">
              All plot boundaries, satellite phenology series, and field evidence in this demo are synthetically generated
              for reproducible evaluation. The biomass allometry is an illustrative relationship calibrated for regional
              Telangana agroforestry (Teak, Mango, Subabul), not an accredited national inventory.
            </p>
          </div>

          {/* Cryptographic Honesty Rule */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#1b4332] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#2d6a4f]" /> The Cryptographic Honesty Rule
            </h4>
            <p className="text-xs text-slate-600">
              Our SHA-256 hash chain guarantees <strong className="text-slate-800">immutability, provenance, and sequence</strong> of
              all historical ingestion events. It proves that evidence was not altered after submission. It does{' '}
              <strong className="text-slate-800">not</strong> prove ground truth—which is why verification-ready outputs are
              strictly submitted to independent third-party validation and verification bodies (VVBs).
            </p>
          </div>

          {/* Carbon Pools Scope */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#1b4332] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#2d6a4f]" /> Accounting Scope &amp; Carbon Pools
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                <p className="font-bold text-emerald-900">Included Pools</p>
                <p className="text-slate-700">• Aboveground Biomass (AGB) via multispectral &amp; radar satellite series</p>
                <p className="text-slate-700">• Belowground Biomass (BGB) via IPCC root-to-shoot ratio (R = 0.25)</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800">Excluded Pools</p>
                <p className="text-slate-600">• Dead Wood (excluded from conservative baseline)</p>
                <p className="text-slate-600">• Litter (excluded due to rapid monsoon decomposition)</p>
                <p className="text-slate-600">• Soil Organic Carbon / SOC (excluded without soil core lab tests)</p>
              </div>
            </div>
          </div>

          {/* Real Math Guarantees */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#1b4332] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2d6a4f]" /> Real Computational Guarantees (No Faked Logic)
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
              <li>
                <strong>Spatial Geometry:</strong> Real GeoJSON projected to UTM 44N (EPSG:32644) via <code className="bg-slate-100 px-1 py-0.5 rounded">proj4</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">@turf/turf</code>.
              </li>
              <li>
                <strong>Inner 10m Buffer:</strong> Boundary pixels removed; plots with &lt; 8 usable pixels are flagged as insufficient data.
              </li>
              <li>
                <strong>1,000x Paired Bootstrap:</strong> Resamples pixel deltas dAGB = AGB(Y2) - AGB(Y1) with a spatial autocorrelation design effect (D_eff = 1.70).
              </li>
              <li>
                <strong>Conservative Crediting:</strong> Always reports the 5th percentile lower bound. Over-crediting avoided is strictly the uncertainty haircut.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-[#fdfcf9] flex justify-end">
          <button
            onClick={() => setMethodsModalOpen(false)}
            className="px-5 py-2.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
