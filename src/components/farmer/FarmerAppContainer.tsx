import React from 'react';
import { Leaf, WifiOff, LogOut, ShieldCheck } from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';
import { FarmerWelcome } from './FarmerWelcome';
import { FarmerConsent } from './FarmerConsent';
import { FarmerRegisterPlot } from './FarmerRegisterPlot';
import { FarmerEvidenceCapture } from './FarmerEvidenceCapture';
import { FarmerProcessing } from './FarmerProcessing';
import { FarmerResults } from './FarmerResults';
import { TRANSLATIONS } from '../../i18n/translations';

export const FarmerAppContainer: React.FC = () => {
  const { farmerStep, isOffline, language, currentUser, logout, setPersonaMode } = useMRVStore();
  const t = TRANSLATIONS[language];

  return (
    <div className="w-full min-h-screen bg-[#faf7f2] flex flex-col max-w-md mx-auto shadow-md border-x border-slate-200/60">
      {/* Native-style Mobile App Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1a3c2a] to-[#2d6a4f] flex items-center justify-center text-white shadow-xs">
            <Leaf className="w-4 h-4 text-[#52b788]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-[#1a3c2a] leading-none">Carbon Kheti</h1>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              {currentUser ? currentUser.name : 'Smallholder Kisan Portal'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {currentUser && (
            <button
              type="button"
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Discreet switch to Auditor Console if judges request to see the MRV backend */}
          <button
            type="button"
            onClick={() => setPersonaMode('verifier')}
            title="Auditor & Science Console"
            className="px-2 py-1 rounded-lg text-slate-400 hover:text-[#1a3c2a] hover:bg-slate-100 transition-all cursor-pointer text-[10px] font-bold border border-slate-200"
          >
            FPO
          </button>
        </div>
      </header>

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900 animate-in fade-in">
          <WifiOff className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span className="font-semibold text-[11px]">{t.common.offlineMode}</span>
        </div>
      )}

      {/* Main Mobile App Screen */}
      <main className="flex-1 p-4 pb-8">
        {farmerStep === 'welcome' && <FarmerWelcome />}
        {farmerStep === 'consent' && <FarmerConsent />}
        {farmerStep === 'register_plot' && <FarmerRegisterPlot />}
        {farmerStep === 'capture_evidence' && <FarmerEvidenceCapture />}
        {farmerStep === 'processing' && <FarmerProcessing />}
        {farmerStep === 'results' && <FarmerResults />}
      </main>

      {/* Clean Minimal App Status Footer */}
      <footer className="py-2.5 px-4 text-center border-t border-slate-200/60 bg-white/70 text-[10px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#2d6a4f]" /> Team DoSA · PS-13
        </span>
        <span className="font-mono text-slate-400">Telangana MRV</span>
      </footer>
    </div>
  );
};
