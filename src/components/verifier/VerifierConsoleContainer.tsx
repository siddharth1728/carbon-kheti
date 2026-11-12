import React from 'react';
import {
  MapPin,
  Layers,
  BarChart3,
  Radio,
  Shield,
  Lock,
  DollarSign,
  FileText,
} from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';
import { VerifierTabId } from '../../types';
import { VerifierOverviewTab } from './VerifierOverviewTab';
import { SentinelImageryWindow } from './SentinelImageryWindow';
import { VerifierCarbonTab } from './VerifierCarbonTab';
import { VerifierPhenologyTab } from './VerifierPhenologyTab';
import { VerifierFraudTab } from './VerifierFraudTab';
import { VerifierAuditTab } from './VerifierAuditTab';
import { VerifierEconomicsTab } from './VerifierEconomicsTab';
import { VerifierExportTab } from './VerifierExportTab';
import { BackendConsole } from './BackendConsole';
import { Terminal } from 'lucide-react';

export const VerifierConsoleContainer: React.FC = () => {
  const { verifierTab, setVerifierTab } = useMRVStore();

  const tabs: Array<{ id: VerifierTabId; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: '1. Overview & Map', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'sentinel', label: '2. Sentinel Window (10m)', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'carbon', label: '3. Carbon Engine & Bootstrap', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'phenology', label: '4. Phenology & Radar Fallback', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'fraud', label: '5. Fraud Checks & Lab', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'audit', label: '6. Audit Chain', icon: <Lock className="w-3.5 h-3.5" /> },
    { id: 'economics', label: '7. Unit Economics', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'export', label: '8. Export Dossier', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'backend', label: '9. FastAPI Backend Console', icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Tab Navigation Pill Bar */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((t) => {
          const isActive = verifierTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setVerifierTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#1a3c2a] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Viewport */}
      <div>
        {verifierTab === 'overview' && <VerifierOverviewTab />}
        {verifierTab === 'sentinel' && <SentinelImageryWindow />}
        {verifierTab === 'carbon' && <VerifierCarbonTab />}
        {verifierTab === 'phenology' && <VerifierPhenologyTab />}
        {verifierTab === 'fraud' && <VerifierFraudTab />}
        {verifierTab === 'audit' && <VerifierAuditTab />}
        {verifierTab === 'economics' && <VerifierEconomicsTab />}
        {verifierTab === 'export' && <VerifierExportTab />}
        {verifierTab === 'backend' && <BackendConsole />}
      </div>
    </div>
  );
};
