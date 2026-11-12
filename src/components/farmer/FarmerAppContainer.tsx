import React from 'react';
import { Wifi, WifiOff, Smartphone, Monitor } from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';
import { FarmerWelcome } from './FarmerWelcome';
import { FarmerConsent } from './FarmerConsent';
import { FarmerRegisterPlot } from './FarmerRegisterPlot';
import { FarmerEvidenceCapture } from './FarmerEvidenceCapture';
import { FarmerProcessing } from './FarmerProcessing';
import { FarmerResults } from './FarmerResults';
import { TRANSLATIONS } from '../../i18n/translations';

export const FarmerAppContainer: React.FC = () => {
  const { farmerStep, isOffline, setIsOffline, language } = useMRVStore();
  const t = TRANSLATIONS[language];
  const [usePhoneFrame, setUsePhoneFrame] = React.useState(true);

  return (
    <div className="flex flex-col items-center justify-center py-4 px-2">
      {/* Phone Frame Toggle for Judges */}
      <div className="mb-4 flex items-center gap-3 text-xs bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
        <span className="font-bold text-slate-700">Display Viewport:</span>
        <button
          onClick={() => setUsePhoneFrame(true)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
            usePhoneFrame ? 'bg-[#1a3c2a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" /> 390px Mobile Frame
        </button>
        <button
          onClick={() => setUsePhoneFrame(false)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
            !usePhoneFrame ? 'bg-[#1a3c2a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" /> Responsive Wide
        </button>

        {/* Offline simulator toggle */}
        <button
          onClick={() => setIsOffline(!isOffline)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all border ml-2 ${
            isOffline
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-700" /> : <Wifi className="w-3.5 h-3.5 text-emerald-700" />}
          <span>{isOffline ? 'Simulating Offline' : 'Online'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          usePhoneFrame
            ? 'max-w-[420px] bg-white rounded-[40px] border-[8px] border-slate-900 shadow-2xl p-4 my-2 min-h-[780px] flex flex-col justify-between'
            : 'max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-sm p-6'
        }`}
      >
        {/* Phone Notch/Speaker simulation */}
        {usePhoneFrame && (
          <div className="w-32 h-4 bg-slate-900 rounded-full mx-auto mb-3 shrink-0 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
          </div>
        )}

        {/* Offline Notification Banner */}
        {isOffline && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in">
            <WifiOff className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{t.common.offlineMode}</p>
              <p className="text-[11px] text-amber-800 mt-0.5">{t.common.queuedSubmissions}</p>
            </div>
          </div>
        )}

        {/* Dynamic Step View */}
        <div className="flex-1">
          {farmerStep === 'welcome' && <FarmerWelcome />}
          {farmerStep === 'consent' && <FarmerConsent />}
          {farmerStep === 'register_plot' && <FarmerRegisterPlot />}
          {farmerStep === 'capture_evidence' && <FarmerEvidenceCapture />}
          {farmerStep === 'processing' && <FarmerProcessing />}
          {farmerStep === 'results' && <FarmerResults />}
        </div>
      </div>
    </div>
  );
};
