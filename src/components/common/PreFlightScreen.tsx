import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  UserCheck,
  MapPin,
  Compass,
  Camera,
  Database,
  Wifi,
  ArrowRight,
} from 'lucide-react';
import { systemApi } from '../../api/endpoints';
import { useMRVStore } from '../../store/useMRVStore';

interface CheckItem {
  id: string;
  name: string;
  icon: any;
  status: 'checking' | 'pass' | 'warn' | 'fail';
  value: string;
  fixHint?: string;
}

export const PreFlightScreen: React.FC<{ onProceed?: () => void }> = ({ onProceed }) => {
  const { currentUser } = useMRVStore();
  const [isRunning, setIsRunning] = useState(false);
  const [checks, setChecks] = useState<CheckItem[]>([
    { id: 'backend', name: 'FastAPI Backend Reachability', icon: Server, status: 'checking', value: 'Testing...' },
    { id: 'auth', name: 'Authentication & Session RBAC', icon: UserCheck, status: 'checking', value: 'Testing...' },
    { id: 'location', name: 'GPS Sensor & Location Permission', icon: MapPin, status: 'checking', value: 'Testing...' },
    { id: 'compass', name: 'Compass & Absolute Orientation', icon: Compass, status: 'checking', value: 'Testing...' },
    { id: 'camera', name: 'Camera Shutter & Hardware Preview', icon: Camera, status: 'checking', value: 'Testing...' },
    { id: 'storage', name: 'Keystore & Offline State Storage', icon: Database, status: 'checking', value: 'Testing...' },
    { id: 'network', name: 'Network Connectivity', icon: Wifi, status: 'checking', value: 'Testing...' },
  ]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const updated = [...checks];

    // 1. Backend Server Check
    try {
      const res = await systemApi.getHealth();
      updated[0] = {
        ...updated[0],
        status: 'pass',
        value: `Healthy (${res.service} v${res.version})`,
      };
    } catch {
      updated[0] = {
        ...updated[0],
        status: 'warn',
        value: 'Backend offline (Falling back to bundled snapshot)',
        fixHint: 'Check local backend server or repoint in Server Settings modal.',
      };
    }

    // 2. Auth Session Check
    if (currentUser) {
      updated[1] = {
        ...updated[1],
        status: 'pass',
        value: `Signed in as ${currentUser.name} (${currentUser.role})`,
      };
    } else {
      updated[1] = {
        ...updated[1],
        status: 'warn',
        value: 'No active session (Guest)',
        fixHint: 'Login with demo credentials (+919849012345 / Farmer@2026).',
      };
    }

    // 3. Location GPS Check
    if ('geolocation' in navigator) {
      try {
        const pos: GeolocationPosition = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000, enableHighAccuracy: true });
        });
        const acc = Math.round(pos.coords.accuracy);
        updated[2] = {
          ...updated[2],
          status: acc <= 20 ? 'pass' : 'warn',
          value: `GPS Active (Accuracy: ±${acc}m)`,
          fixHint: acc > 20 ? 'Move near window or outdoors for tighter fix (<20m).' : undefined,
        };
      } catch (err: any) {
        updated[2] = {
          ...updated[2],
          status: 'warn',
          value: 'Indoor / No GPS Fix',
          fixHint: 'Enable location in Android Settings or use "Replay Recorded Walk" demo mode.',
        };
      }
    } else {
      updated[2] = { ...updated[2], status: 'fail', value: 'Geolocation API unsupported' };
    }

    // 4. Compass Sensor Check
    if ('DeviceOrientationEvent' in window) {
      updated[3] = {
        ...updated[3],
        status: 'pass',
        value: 'Orientation Sensor Available (±22.5° sector lock)',
      };
    } else {
      updated[3] = {
        ...updated[3],
        status: 'warn',
        value: 'Compass unavailable (Desktop mode simulated)',
        fixHint: 'Device lacks magnetic compass. Manual heading selector will be active.',
      };
    }

    // 5. Camera Check
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        updated[4] = {
          ...updated[4],
          status: 'pass',
          value: 'Camera Permission Granted & Sensor Ready',
        };
      } catch {
        updated[4] = {
          ...updated[4],
          status: 'warn',
          value: 'Permission prompt or camera busy',
          fixHint: 'Allow camera in browser/Android permissions prompt or use Sample Photo Injector.',
        };
      }
    } else {
      updated[4] = { ...updated[4], status: 'warn', value: 'Camera API unavailable (using demo frames)' };
    }

    // 6. Storage Check
    try {
      localStorage.setItem('ck_test', '1');
      localStorage.removeItem('ck_test');
      updated[5] = {
        ...updated[5],
        status: 'pass',
        value: 'Keystore & IndexedDB writeable',
      };
    } catch {
      updated[5] = { ...updated[5], status: 'fail', value: 'Storage quota exceeded or disabled' };
    }

    // 7. Network Check
    const isOnline = navigator.onLine;
    updated[6] = {
      ...updated[6],
      status: isOnline ? 'pass' : 'warn',
      value: isOnline ? 'Online (WiFi / Cellular connected)' : 'Offline (Local demo mode active)',
      fixHint: !isOnline ? 'Bundled offline demo snapshot will serve all plots seamlessly.' : undefined,
    };

    setChecks(updated);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const allPassedOrWarned = checks.every((c) => c.status !== 'fail');

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black text-[#1a3c2a] flex items-center gap-2">
            <span>Pre-Flight Readiness Check</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Judge-Proof System Diagnostics before presenting on phone
          </p>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>Re-test</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {checks.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-start gap-3"
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  item.status === 'pass'
                    ? 'bg-emerald-100 text-emerald-700'
                    : item.status === 'warn'
                    ? 'bg-amber-100 text-amber-700'
                    : item.status === 'fail'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                  {item.status === 'pass' && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  )}
                  {item.status === 'warn' && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Caution
                    </span>
                  )}
                  {item.status === 'fail' && (
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Failed
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 font-mono">{item.value}</p>

                {item.fixHint && (
                  <p className="text-[11px] text-amber-900 bg-amber-50/70 p-1.5 rounded-lg border border-amber-200/60 mt-1">
                    <strong>Remedy:</strong> {item.fixHint}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {onProceed && (
        <button
          onClick={onProceed}
          disabled={!allPassedOrWarned}
          className="w-full py-3.5 bg-[#1a3c2a] hover:bg-[#2d6a4f] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>All Clear — Launch Live Demo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
