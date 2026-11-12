import React from 'react';
import {
  Award,
  Sparkles,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';
import { TRANSLATIONS } from '../../i18n/translations';

export const FarmerResults: React.FC = () => {
  const { language, currentPlot, currentMRV, setFarmerStep, setPersonaMode, setVerifierTab } =
    useMRVStore();
  const t = TRANSLATIONS[language];

  // Formatting currency in Indian format
  const formatInr = (num: number) => {
    return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  // If plot has high severity hold, render kind failure path per Requirement #8
  if (currentPlot.status === 'on_hold') {
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <div className="bg-red-50 border border-red-200 p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-700">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-red-950">{t.farmerApp.rejectionTitle}</h3>
          <p className="text-xs text-red-800 leading-relaxed font-medium">
            {currentPlot.holdReason ||
              'A boundary overlap or evidence mismatch was detected during automatic validation.'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t.farmerApp.rejectionNextStepsTitle}
          </h4>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            {currentPlot.resolutionSteps ||
              'Please visit the boundary with your local field assistant and capture fresh geotagged photos from within your plot line.'}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setFarmerStep('register_plot')}
            className="flex-1 py-3 bg-[#1a3c2a] hover:bg-[#2d6a4f] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Update Boundary / Evidence</span>
          </button>
        </div>
      </div>
    );
  }

  const { payoutRangeInr } = currentMRV;
  const lowCredits = Number((currentMRV.finalCreditsPerHa * currentPlot.areaHa).toFixed(2));
  const likelyCredits = Number(
    ((currentMRV.grossMeanCo2ePerHa - currentMRV.deductions.baselineDeductionCo2ePerHa) *
      0.85 *
      currentPlot.areaHa).toFixed(2)
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Celebration Header */}
      <div className="bg-gradient-to-br from-[#1a3c2a] via-[#234e38] to-[#2d6a4f] text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#52b788]/20 text-[#d8f3dc] border border-[#52b788]/30 flex items-center gap-1">
              <Award className="w-3 h-3" /> Verification-Ready Seal
            </span>
            <span className="text-xs text-[#d8f3dc] font-mono">UTM Zone 44N</span>
          </div>

          <div>
            <h2 className="text-xl font-black">{t.farmerApp.resultsTitle}</h2>
            <p className="text-xs text-[#b7e4c7]">
              {currentPlot.farmerName} • {currentPlot.name} ({currentPlot.areaAcres} Acres)
            </p>
          </div>

          {/* Credit & Payout Range Card */}
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 grid grid-cols-2 gap-3 mt-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#b7e4c7]">{t.farmerApp.creditRangeLabel}</p>
              <p className="text-lg font-black text-white mt-0.5">
                {lowCredits.toFixed(1)} – {likelyCredits.toFixed(1)}{' '}
                <span className="text-[10px] font-normal text-[#d8f3dc]">tCO₂e/yr</span>
              </p>
              <p className="text-[10px] text-[#d8f3dc] mt-0.5">Conservative Lower Bound guaranteed</p>
            </div>

            <div className="border-l border-white/15 pl-3">
              <p className="text-[10px] uppercase font-bold text-[#b7e4c7]">{t.farmerApp.payoutRangeLabel}</p>
              <p className="text-lg font-black text-[#74c69d] mt-0.5">
                {formatInr(payoutRangeInr.lowRupees)} – {formatInr(payoutRangeInr.likelyRupees)}
              </p>
              <p className="text-[10px] text-[#d8f3dc] mt-0.5">Direct to Pattadar bank account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-800 block">{t.farmerApp.confidenceScore}</span>
          <span className="text-[11px] text-slate-500">Based on 5 corner photos + Sentinel-1/2 multi-sensor match</span>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3 h-3" /> 88% • {t.farmerApp.confidenceHigh}
          </span>
        </div>
      </div>

      {/* Why is your estimate a range? */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <h4 className="text-xs font-bold text-[#1a3c2a] flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#2d6a4f]" /> {t.farmerApp.whyRangeTitle}
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">{t.farmerApp.whyRangeText}</p>
      </div>

      {/* 3 Actionable Tips to narrow range */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-[#1a3c2a] flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#2d6a4f]" /> {t.farmerApp.narrowRangeTipsTitle}
        </h4>
        <ul className="text-xs text-slate-700 space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0 mt-0.5" />
            <span>{t.farmerApp.tip1}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0 mt-0.5" />
            <span>{t.farmerApp.tip2}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0 mt-0.5" />
            <span>{t.farmerApp.tip3}</span>
          </li>
        </ul>
      </div>

      {/* Transparent Revenue Split */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-[#1a3c2a]">{t.farmerApp.transparentSplitTitle}</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 font-semibold text-emerald-950">
            <span>{t.farmerApp.farmerShare75}</span>
            <span>75.0% (~{formatInr(payoutRangeInr.likelyRupees)})</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
            <span>{t.farmerApp.platformFee}</span>
            <span>₹{(currentPlot.areaHa * 100).toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
            <span>{t.farmerApp.reserveBuffer}</span>
            <span>15.0% (Permanence Reserve)</span>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-[#1a3c2a] flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#2d6a4f]" /> {t.farmerApp.timelineTitle}
        </h4>

        <div className="space-y-2 text-xs">
          {[
            { label: t.farmerApp.stepSubmitted, done: true, simulated: false },
            { label: t.farmerApp.stepSatellite, done: true, simulated: false },
            { label: t.farmerApp.stepFraudChecks, done: true, simulated: false },
            { label: t.farmerApp.stepReportSealed, done: true, simulated: false },
            { label: t.farmerApp.stepAuditorReview, done: false, simulated: true },
            { label: t.farmerApp.stepRegistry, done: false, simulated: true },
            { label: t.farmerApp.stepSale, done: false, simulated: true },
            { label: t.farmerApp.stepPayment, done: false, simulated: true },
          ].map((st, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                {st.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className={st.done ? 'font-bold text-slate-800' : 'text-slate-500'}>
                  {st.label}
                </span>
              </div>
              {st.simulated && (
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
                  {t.farmerApp.simulatedStepBadge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Switch to Verifier View Action */}
      <div className="pt-2">
        <button
          onClick={() => {
            setPersonaMode('verifier');
            setVerifierTab('overview');
          }}
          className="w-full py-3 bg-[#1a3c2a] hover:bg-[#2d6a4f] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>View Auditor &amp; Science Verification Console</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
