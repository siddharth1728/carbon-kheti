import React, { useState } from 'react';
import {
  Leaf,
  Play,
  Globe,
  Info,
  Smartphone,
  BarChart3,
  QrCode,
  ShieldAlert,
  Sliders,
  User,
  LogOut,
  AlertTriangle,
  Server,
  Activity,
  Bug,
  X,
} from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';
import { AppPersonaMode } from '../../types';
import { SupportedLanguage } from '../../i18n/translations';
import { ServerSettingsModal } from '../common/ServerSettingsModal';
import { PreFlightScreen } from '../common/PreFlightScreen';
import { DiagnosticsScreen } from '../common/DiagnosticsScreen';

export const TopNavbar: React.FC = () => {
  const {
    personaMode,
    setPersonaMode,
    language,
    setLanguage,
    setMethodsModalOpen,
    guidedDemo,
    startGuidedDemo,
    stopGuidedDemo,
    currentUser,
    logout,
    chaos,
    toggleChaos,
  } = useMRVStore();

  const [chaosModalOpen, setChaosModalOpen] = useState(false);
  const [serverModalOpen, setServerModalOpen] = useState(false);
  const [preFlightModalOpen, setPreFlightModalOpen] = useState(false);
  const [diagnosticsModalOpen, setDiagnosticsModalOpen] = useState(false);
  const [logoTaps, setLogoTaps] = useState(0);

  const handleLogoTap = () => {
    const next = logoTaps + 1;
    if (next >= 5) {
      setServerModalOpen(true);
      setLogoTaps(0);
    } else {
      setLogoTaps(next);
      setTimeout(() => setLogoTaps(0), 3000);
    }
  };

  const personas: Array<{ id: AppPersonaMode; label: string; icon: React.ReactNode }> = [
    { id: 'farmer', label: 'Farmer App (PWA)', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'verifier', label: 'Verifier Console', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'public_verify', label: 'Public Verify (Buyer)', icon: <QrCode className="w-3.5 h-3.5" /> },
    { id: 'adversarial', label: 'Test the System', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="bg-[#1a3c2a] text-white border-b border-[#2d6a4f] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div onClick={handleLogoTap} className="flex items-center gap-3 cursor-pointer select-none" title="Tip: Tap 5 times to open hidden Server Settings">
          <div className="w-9 h-9 rounded-xl bg-[#2d6a4f] flex items-center justify-center text-white shadow-inner">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">Carbon Kheti</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#2d6a4f] text-[#d8f3dc] tracking-wider">
                Open MRV
              </span>
            </div>
            <p className="text-[11px] text-[#b7e4c7] hidden sm:block">
              Telangana Agroforestry • UTM Zones 43N &amp; 44N
            </p>
          </div>
        </div>

        {/* Persona Mode Switcher */}
        <nav aria-label="Portal persona switcher" className="flex items-center bg-[#132d20] p-1 rounded-xl border border-[#2d6a4f]/50 overflow-x-auto no-scrollbar">
          {personas.map((p) => {
            const isActive = personaMode === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPersonaMode(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#2d6a4f] text-white shadow-sm font-semibold'
                    : 'text-[#b7e4c7] hover:text-white hover:bg-[#1a3c2a]'
                }`}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User, Chaos, Language, and Demo Controls */}
        <div className="flex items-center gap-2">
          {/* User Profile Chip */}
          {currentUser && (
            <div className="hidden lg:flex items-center gap-1.5 bg-[#132d20] px-2.5 py-1 rounded-xl border border-[#2d6a4f]/50 text-xs text-[#d8f3dc]">
              <User className="w-3.5 h-3.5 text-[#52b788]" />
              <span className="font-semibold truncate max-w-[120px]">{currentUser.name}</span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#2d6a4f] text-white font-mono">
                {currentUser.role}
              </span>
              <button
                onClick={logout}
                title="Logout"
                className="text-[#b7e4c7] hover:text-white ml-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Pre-Flight Diagnostics Trigger */}
          <button
            onClick={() => setPreFlightModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#132d20] hover:bg-[#2d6a4f] text-[#d8f3dc] border border-[#2d6a4f]/50 rounded-xl text-[11px] font-medium transition-all cursor-pointer"
            title="Open Pre-Flight Readiness Checklist"
          >
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Pre-Flight</span>
          </button>

          {/* Server Settings Trigger */}
          <button
            onClick={() => setServerModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#132d20] hover:bg-[#2d6a4f] text-[#d8f3dc] border border-[#2d6a4f]/50 rounded-xl text-[11px] font-medium transition-all cursor-pointer"
            title="Configure Backend API Server Endpoint"
          >
            <Server className="w-3 h-3 text-blue-400" />
            <span className="hidden sm:inline">Server</span>
          </button>

          {/* Chaos Engineering Panel Trigger */}
          <button
            onClick={() => setChaosModalOpen(!chaosModalOpen)}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#132d20] hover:bg-[#2d6a4f] text-[#d8f3dc] border border-[#2d6a4f]/50 rounded-xl text-[11px] font-medium transition-all cursor-pointer"
            title="Open Chaos Engineering & Fault Injection Panel"
          >
            <Sliders className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Chaos</span>
          </button>

          {/* Diagnostics Trigger */}
          <button
            onClick={() => setDiagnosticsModalOpen(true)}
            className="p-1.5 bg-[#132d20] hover:bg-[#2d6a4f] text-slate-300 border border-[#2d6a4f]/50 rounded-xl text-[11px] transition-all cursor-pointer"
            title="View Diagnostics & Telemetry"
          >
            <Bug className="w-3 h-3 text-purple-400" />
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-[#132d20] rounded-xl border border-[#2d6a4f]/50 p-0.5 text-xs">
            <Globe className="w-3.5 h-3.5 ml-2 mr-1 text-[#b7e4c7]" />
            {(['en', 'te', 'hi'] as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  language === lang
                    ? 'bg-[#2d6a4f] text-white font-bold'
                    : 'text-[#b7e4c7] hover:text-white'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'te' ? 'తెలుగు' : 'हिन्दी'}
              </button>
            ))}
          </div>

          {/* Persistent single Demo Data Chip */}
          <button
            onClick={() => setMethodsModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#234e38] hover:bg-[#2d6a4f] text-[#d8f3dc] border border-[#3d8363] rounded-xl text-[11px] font-medium transition-all cursor-pointer shadow-sm"
            title="Click to view scientific methodology and limitations"
          >
            <Info className="w-3 h-3 text-[#74c69d]" />
            <span>Demo data</span>
          </button>

          {/* Guided 4-Minute Demo Button */}
          <button
            onClick={() => {
              if (guidedDemo.isActive) stopGuidedDemo();
              else startGuidedDemo();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              guidedDemo.isActive
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 animate-pulse'
                : 'bg-[#52b788] hover:bg-[#74c69d] text-slate-950'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{guidedDemo.isActive ? 'Exit Demo' : 'Play 4-Min Demo'}</span>
          </button>
        </div>
      </div>

      {/* Chaos Engineering Dropdown Drawer */}
      {chaosModalOpen && (
        <div className="bg-[#0f2419] border-t border-[#2d6a4f] px-4 py-3 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-bold">Chaos Engineering / System Resilience Simulator:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'offlineSimulated', label: 'Offline Network Queue' },
                { key: 'gpsDeniedSimulated', label: 'Deny GPS Geolocation' },
                { key: 'sentinelOutageSimulated', label: 'Copernicus Sentinel Outage (Fallback to Cache)' },
                { key: 'slowApiSimulated', label: 'Simulate 2500ms Slow Satellite API' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-1.5 cursor-pointer text-[#d8f3dc]">
                  <input
                    type="checkbox"
                    checked={chaos[item.key as keyof typeof chaos]}
                    onChange={() => toggleChaos(item.key as any)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Hidden Server Settings Modal */}
      <ServerSettingsModal isOpen={serverModalOpen} onClose={() => setServerModalOpen(false)} />

      {/* Pre-Flight Modal */}
      {preFlightModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreFlightModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <PreFlightScreen onProceed={() => setPreFlightModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Diagnostics Modal */}
      {diagnosticsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setDiagnosticsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <DiagnosticsScreen />
          </div>
        </div>
      )}
    </header>
  );
};
