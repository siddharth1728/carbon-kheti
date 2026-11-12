import React from 'react';
import { Lock, ShieldCheck, AlertOctagon, RotateCcw, ShieldAlert } from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';

export const VerifierAuditTab: React.FC = () => {
  const {
    auditChain,
    verifyChainResult,
    verifyChain,
    tamperRecord,
    restoreDemoState,
  } = useMRVStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-[#1a3c2a] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#2d6a4f]" />
            Cryptographic SHA-256 Event Chain
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">
              hash_n = SHA-256(hash_&#123;n-1&#125; + canonical_json)
            </code>{' '}
            • <strong className="text-slate-800">Honesty Rule: Proves immutability and sequence, not physical truth.</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={verifyChain}
            className="px-4 py-2.5 bg-[#1a3c2a] hover:bg-[#2d6a4f] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>VERIFY CHAIN</span>
          </button>

          <button
            onClick={() => tamperRecord(1)}
            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Silently alters Record #1 in memory to test tamper detection"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Tamper Record</span>
          </button>

          <button
            onClick={restoreDemoState}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Restores clean genesis state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore State</span>
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verifyChainResult && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-3 transition-all ${
            verifyChainResult.valid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-red-50 border-red-200 text-red-950'
          }`}
        >
          {verifyChainResult.valid ? (
            <>
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">CHAIN VERIFIED: All {auditChain.length} records independently recomputed and intact.</p>
                <p className="text-[11px] text-emerald-800 font-mono mt-0.5">
                  Root Hash: {verifyChainResult.recomputedRootHash}
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-bold">
                  CHAIN TAMPER DETECTED: Discrepancy pinpointed at Record #{verifyChainResult.brokenIdx} ({auditChain[verifyChainResult.brokenIdx]?.action})!
                </p>
                <p className="text-[11px] text-red-700 mt-0.5">
                  The recomputed SHA-256 digest does not match the stored block hash. Report generation is locked until restored.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Block Chain List */}
      <div className="space-y-3">
        {auditChain.map((entry, idx) => (
          <div
            key={`${entry.timestamp}-${idx}`}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:border-[#2d6a4f]/30 transition-all"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#1a3c2a] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2d6a4f]"></span>
                Record #{entry.index} • {entry.action}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">{entry.timestamp}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl font-mono text-[11px] text-slate-600 space-y-1 overflow-x-auto border border-slate-100">
              <p className="flex items-center gap-2">
                <span className="text-slate-400 select-none">prev_hash:</span>
                <span className="text-slate-500 break-all">{entry.prevHash}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-slate-400 select-none">curr_hash:</span>
                <strong className="text-[#1a3c2a] break-all">{entry.currentHash}</strong>
              </p>
            </div>

            <div className="text-xs text-slate-700 font-mono bg-slate-50/70 p-3 rounded-xl border border-slate-100 overflow-x-auto">
              <pre className="text-[11px] whitespace-pre-wrap break-all text-slate-800">
                {JSON.stringify(entry.details, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
