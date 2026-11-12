import { useEffect, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import { useMRVStore } from './store/useMRVStore';
import { TopNavbar } from './components/layout/TopNavbar';
import { MethodsModal } from './components/layout/MethodsModal';
import { GuidedDemoBar } from './components/layout/GuidedDemoBar';
import { FarmerAppContainer } from './components/farmer/FarmerAppContainer';
import { VerifierConsoleContainer } from './components/verifier/VerifierConsoleContainer';
import { PublicVerifyPage } from './components/public/PublicVerifyPage';
import { AdversarialPage } from './components/adversarial/AdversarialPage';
import { UpdateRequiredModal } from './components/common/UpdateRequiredModal';
import { onUpdateRequired, onServerWakeState } from './api/client';
import { Leaf, ShieldCheck, Heart, Loader2 } from 'lucide-react';

export default function App() {
  const { personaMode, setPersonaMode, guidedDemo, nextDemoStep, farmerStep, setFarmerStep, walk } =
    useMRVStore();

  const [updateInfo, setUpdateInfo] = useState<{
    minVersion: string;
    updateUrl: string;
    message: string;
  } | null>(null);
  const [serverWaking, setServerWaking] = useState(false);
  const [serverRetryCount, setServerRetryCount] = useState(0);

  // Subscribe to version contract enforcement & server wake-up events
  useEffect(() => {
    onUpdateRequired((info) => setUpdateInfo(info));
    onServerWakeState((isWaking, retryCount) => {
      setServerWaking(isWaking);
      setServerRetryCount(retryCount);
    });
  }, []);

  // Android Hardware Back Button integration via @capacitor/app
  useEffect(() => {
    let backListenerHandle: any = null;

    const setupBackHandler = async () => {
      try {
        backListenerHandle = await CapApp.addListener('backButton', () => {
          if (personaMode === 'farmer') {
            if (farmerStep === 'register_plot' && walk.isWalking) {
              const confirmExit = window.confirm(
                'A boundary walk is currently in progress. Discard walked GPS track and return?'
              );
              if (confirmExit) {
                setFarmerStep('consent');
              }
              return;
            }

            if (farmerStep === 'capture_evidence') {
              const confirmExit = window.confirm(
                'Leave photo capture session? Captured unsaved frames will be cleared.'
              );
              if (confirmExit) {
                setFarmerStep('register_plot');
              }
              return;
            }

            if (farmerStep === 'results') {
              setFarmerStep('register_plot');
              return;
            }

            if (farmerStep === 'register_plot') {
              setFarmerStep('consent');
              return;
            }

            if (farmerStep === 'consent') {
              setFarmerStep('welcome');
              return;
            }

            // On welcome step, minimize / exit
            CapApp.exitApp();
          } else {
            setPersonaMode('farmer');
          }
        });
      } catch {
        // Web fallback if Capacitor native bridge not mounted
      }
    };

    setupBackHandler();

    return () => {
      if (backListenerHandle && typeof backListenerHandle.remove === 'function') {
        backListenerHandle.remove();
      }
    };
  }, [personaMode, farmerStep, walk.isWalking, setFarmerStep, setPersonaMode]);

  // Listen to hash routing for public verify URLs like /#verify/TS-RR-01-2025-VERIFIED
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.startsWith('#verify')) {
        setPersonaMode('public_verify');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setPersonaMode]);

  // Guided demo auto-advance timer when playing
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (guidedDemo.isActive && guidedDemo.isPlaying) {
      timer = setTimeout(() => {
        nextDemoStep();
      }, 9500); // 9.5s per slide for smooth 4-min narrative
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [guidedDemo.isActive, guidedDemo.isPlaying, guidedDemo.currentStep, nextDemoStep]);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#1a3c2a] font-sans antialiased flex flex-col selection:bg-[#2d6a4f] selection:text-white">
      {/* Sticky Top Navigation */}
      <TopNavbar />

      {/* Server Wake-up notification banner (Cold start handling) */}
      {serverWaking && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-sm animate-pulse sticky top-14 z-30">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Connecting to server / Backend waking up (attempt {serverRetryCount} of 3)... Stand by.</span>
        </div>
      )}

      {/* Main Persona Content Viewport */}
      <main className="flex-1 w-full pb-20">
        {personaMode === 'farmer' && <FarmerAppContainer />}
        {personaMode === 'verifier' && <VerifierConsoleContainer />}
        {personaMode === 'public_verify' && <PublicVerifyPage />}
        {personaMode === 'adversarial' && <AdversarialPage />}
      </main>

      {/* Floating Guided 4-Minute Demo Control Bar */}
      <GuidedDemoBar />

      {/* Persistent Methods & Limitations Modal */}
      <MethodsModal />

      {/* Version Contract Update Modal */}
      <UpdateRequiredModal info={updateInfo} onDismiss={() => setUpdateInfo(null)} />

      {/* Production Footer */}
      <footer className="bg-[#132d20] text-[#b7e4c7] border-t border-[#2d6a4f] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <Leaf className="w-4 h-4 text-[#52b788]" />
            <span className="font-bold text-white">Carbon Kheti</span>
            <span className="text-slate-500">•</span>
            <span>INNOVASIA 2K26 (PS-13) • Team DoSA</span>
          </div>

          <div className="flex items-center gap-6 text-[#95d5b2]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#52b788]" />
              Conservative 95% Lower-Bound Crediting
            </span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" /> for Telangana Smallholders
            </span>
          </div>

          <div className="text-slate-400 text-center md:text-right font-mono text-[11px]">
            UTM Zones 43N &amp; 44N • WGS84 EPSG:4326 • Not a Registry/Marketplace
          </div>
        </div>
      </footer>
    </div>
  );
}
