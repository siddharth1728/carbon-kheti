import React, { useState, useEffect } from 'react';
import { Server, CheckCircle2, AlertCircle, X, RotateCcw, ShieldCheck, Wifi } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl } from '../../api/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ServerSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [urlInput, setUrlInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ latencyMs: number; version: string; service: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(getApiBaseUrl());
      setStatusMessage(null);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const res = setApiBaseUrl(urlInput);
    if (!res.success) {
      setStatusMessage({ type: 'error', text: res.error || 'Invalid URL' });
      return;
    }
    setStatusMessage({ type: 'success', text: 'Server URL successfully updated!' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    resetApiBaseUrl();
    setUrlInput(getApiBaseUrl());
    setStatusMessage({ type: 'success', text: 'Reset to default built-in server endpoint.' });
  };

  const testConnection = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    setTestResult(null);
    const start = performance.now();
    try {
      // Temporarily set and test
      const tempUrl = urlInput.trim().replace(/\/+$/, '');
      const resp = await fetch(`${tempUrl}/health`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const latency = Math.round(performance.now() - start);
      setTestResult({
        latencyMs: latency,
        version: data.version || '1.0.0',
        service: data.service || 'Carbon Kheti MRV API',
      });
      setStatusMessage({ type: 'success', text: `Connected successfully (${latency} ms)` });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Connection failed: ${err.message || 'Cannot reach server'}. Check server status or CORS.`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#d8f3dc] text-[#1a3c2a] flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1a3c2a]">Backend Server Settings</h3>
              <p className="text-[11px] text-slate-500">Repoint mobile client without rebuilding app</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">API Base URL</label>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://api.carbonkheti.dosa.in or http://10.0.2.2:8000"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
          />
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>HTTPS strictly enforced for remote hostnames. Local development IPs (10.0.2.2 / localhost) permitted.</span>
          </div>
        </div>

        {testResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
            <div className="flex justify-between items-center text-emerald-950 font-bold">
              <span>{testResult.service}</span>
              <span className="text-[10px] font-mono bg-emerald-100 px-2 py-0.5 rounded-md">
                v{testResult.version} • {testResult.latencyMs}ms
              </span>
            </div>
          </div>
        )}

        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="text-[11px] font-medium">{statusMessage.text}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={testConnection}
            disabled={isTesting}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
            title="Reset to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 bg-[#1a3c2a] hover:bg-[#2d6a4f] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Save &amp; Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
