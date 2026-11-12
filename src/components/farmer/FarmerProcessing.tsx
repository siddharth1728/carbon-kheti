import React from 'react';
import { Cpu, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';
import { TRANSLATIONS } from '../../i18n/translations';

export const FarmerProcessing: React.FC = () => {
  const { language, processingStages, currentPlot } = useMRVStore();
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#1a3c2a] text-white p-5 rounded-3xl shadow-sm text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#2d6a4f] flex items-center justify-center mx-auto text-[#d8f3dc]">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-base font-extrabold">{t.farmerApp.processingTitle}</h3>
        <p className="text-xs text-[#b7e4c7]">{currentPlot.name} ({currentPlot.id})</p>
      </div>

      {/* 8 Real Computational Stages */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {processingStages.map((stage, idx) => {
          const isDone = stage.completed;
          const isRunning = stage.current;

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : isRunning
                  ? 'bg-amber-50/70 border-amber-300 text-amber-950 ring-1 ring-amber-300'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isRunning ? (
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-400">
                    {idx + 1}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-0.5">
                <p className="text-xs font-bold leading-snug">
                  {t.farmerApp[stage.labelKey as keyof typeof t.farmerApp] || stage.labelKey}
                </p>
                <p className="text-[11px] font-mono font-medium text-slate-600">
                  Output: {stage.outputSummary}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sealing Pill */}
      <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-2xl flex items-center justify-center gap-2 shadow-inner">
        <Lock className="w-3.5 h-3.5" />
        <span>SHA-256 Block Finalization Active</span>
      </div>
    </div>
  );
};
