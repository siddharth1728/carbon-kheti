import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertOctagon, RefreshCw, ArrowRight } from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';
import { verifyAuditChain } from '../../core/cryptoEngine';
import { VerifyChainResult } from '../../types';

export const PublicVerifyPage: React.FC = () => {
  const { auditChain, currentPlot, currentMRV, setPersonaMode } = useMRVStore();
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerifyChainResult | null>(null);

  const reportId = `${currentPlot.id}-2025-VERIFIED`;

  const runVerification = async () => {
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 450));
    const res = await verifyAuditChain(auditChain);
    setResult(res);
    setIsVerifying(false);
  };

  useEffect(() => {
    runVerification();
  }, [auditChain]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Trust Header */}
      <div className="bg-[#1a3c2a] text-white p-6 rounded-3xl shadow-md text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#2d6a4f] flex items-center justify-center mx-auto text-[#d8f3dc]">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#52b788]/20 text-[#d8f3dc] border border-[#52b788]/30">
          Public Auditor &amp; Buyer Portal
        </span>
        <h2 className="text-2xl font-black tracking-tight">Independent Cryptographic Verification</h2>
        <p className="text-xs text-[#b7e4c7]">
          Report Target: <span className="font-mono font-bold text-white">{reportId}</span>
        </p>
      </div>

      {/* Live In-Browser Cryptographic Re-Verification */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-[#1a3c2a] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#2d6a4f]" /> Live Client-Side Chain Check
            </h3>
            <p className="text-xs text-slate-500">
              Your browser recalculates every SHA-256 block digest from the genesis block
            </p>
          </div>
          <button
            onClick={runVerification}
            disabled={isVerifying}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>Re-Check</span>
          </button>
        </div>

        {result && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center gap-3 transition-all ${
              result.valid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-red-50 border-red-200 text-red-950'
            }`}
          >
            {result.valid ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-bold">CRYPTOGRAPHIC CHAIN 100% INTACT</p>
                  <p className="text-slate-600">
                    All {result.totalChecked} sequential blocks verified. No historical data has been altered since ingestion.
                  </p>
                  <p className="font-mono text-[10px] text-emerald-800 break-all pt-1">
                    Verified Root: {result.recomputedRootHash}
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <p className="font-bold">VERIFICATION FAILED: Tamper Detected at Block #{result.brokenIdx}</p>
                  <p className="text-slate-600">The stored hash does not match the recomputed SHA-256 payload.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Verified Claim Summary */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
          Verified Carbon Claim Parameters
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Registered Plot</span>
            <span className="font-bold text-[#1a3c2a] text-sm">{currentPlot.id}</span>
            <span className="text-[11px] text-slate-500 block">{currentPlot.name}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Registered Farmer</span>
            <span className="font-bold text-[#1a3c2a] text-sm">{currentPlot.farmerName}</span>
            <span className="text-[11px] text-slate-500 block">{currentPlot.village}, {currentPlot.district}</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-[10px] text-emerald-800 block font-semibold">95% Lower Bound</span>
            <span className="font-black text-emerald-900 text-sm">{currentMRV.finalCreditsPerHa.toFixed(2)} tCO₂e/ha</span>
            <span className="text-[11px] text-emerald-700 block">Total: {currentMRV.totalFarmCredits.toFixed(2)} tCO₂e</span>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-[10px] text-amber-800 block font-semibold">Over-Crediting Avoided</span>
            <span className="font-black text-amber-900 text-sm">{currentMRV.deductions.uncertaintyHaircutCo2ePerHa.toFixed(2)} tCO₂e/ha</span>
            <span className="text-[11px] text-amber-700 block">Uncertainty haircut</span>
          </div>
        </div>

        {/* Methodology Formula */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 font-mono space-y-1">
          <p className="font-bold text-slate-800 font-sans">Verification Method: Paired Anniversary Bootstrap (IPCC Tier-2)</p>
          <p>Net = (dAGB_95lower * 1.25 - Baseline) * 0.47 * (44/12) * (1 - 0.15 Buffer)</p>
          <p className="text-[10px] text-slate-500 font-sans">
            Sensor Suites: Sentinel-2 MSI (10m) + Sentinel-1 SAR C-band Radar + GEDI LiDAR
          </p>
        </div>

        <div className="pt-2 flex justify-between items-center">
          <span className="text-xs text-slate-500">Need full technical inspection?</span>
          <button
            onClick={() => setPersonaMode('verifier')}
            className="px-4 py-2 bg-[#1a3c2a] hover:bg-[#2d6a4f] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Auditor Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
