import React, { useState } from 'react';
import { Download, Bug, Smartphone } from 'lucide-react';
import { getApiBaseUrl, APP_VERSION } from '../../api/client';
import { useMRVStore } from '../../store/useMRVStore';

export const DiagnosticsScreen: React.FC = () => {
  const { isOffline, offlineQueueCount, currentUser, selectedPlotId, auditChain } = useMRVStore();
  const [exported, setExported] = useState(false);

  const diagnosticsData = {
    appVersion: APP_VERSION,
    buildTimestamp: '2026-11-12T15:00:00.000Z',
    backendUrl: getApiBaseUrl(),
    userAgent: navigator.userAgent,
    networkOnline: navigator.onLine,
    simulatedOffline: isOffline,
    offlineQueueCount,
    currentUser: currentUser ? { phone: currentUser.phone, role: currentUser.role } : null,
    selectedPlotId,
    auditChainLength: auditChain.length,
    rootHash: auditChain.length > 0 ? auditChain[auditChain.length - 1].currentHash : null,
  };

  const exportDiagnosticsJson = () => {
    const jsonStr = JSON.stringify(diagnosticsData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbon_kheti_diag_${Date.now()}.json`;
    a.click();
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
          <Bug className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#1a3c2a]">App Diagnostics &amp; Telemetry</h2>
          <p className="text-xs text-slate-500">Live operational state for technical presentation</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-400">App Version:</span>
          <span className="font-bold text-slate-800">v{APP_VERSION} (Production Build)</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-400">API Gateway:</span>
          <span className="font-bold text-[#1a3c2a] truncate max-w-[240px]">{diagnosticsData.backendUrl}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-400">Hardware Platform:</span>
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-slate-500" /> Android / Web Hybrid
          </span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-400">Audit Blocks:</span>
          <span className="font-bold text-slate-800">{auditChain.length} Verified Records</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-slate-400">Root SHA-256:</span>
          <span className="font-bold text-slate-800 text-[10px] truncate max-w-[200px]">{diagnosticsData.rootHash}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Offline Queue:</span>
          <span className="font-bold text-slate-800">{offlineQueueCount} pending items</span>
        </div>
      </div>

      <button
        onClick={exportDiagnosticsJson}
        className="w-full py-3 bg-[#1a3c2a] hover:bg-[#2d6a4f] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>{exported ? 'Diagnostics Exported!' : 'Export Diagnostics JSON'}</span>
      </button>
    </div>
  );
};
