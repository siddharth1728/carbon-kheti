import React from 'react';
import { Play, Pause, ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';

interface DemoStepInfo {
  step: number;
  persona: string;
  title: string;
  caption: string;
}

const DEMO_STEPS: DemoStepInfo[] = [
  {
    step: 0,
    persona: 'Farmer Mobile App',
    title: '1. Welcome & Transparent Onboarding',
    caption:
      'We begin in the Farmer Mobile App. Smallholders in Telangana can immediately choose Telugu, Hindi, or English. Notice the thesis: high verification fees normally price out small plots. We turn that around.',
  },
  {
    step: 1,
    persona: 'Farmer Mobile App',
    title: '2. Plain-Language FPIC Consent',
    caption:
      'Before taking a single photo, the farmer reviews clear FPIC consent terms in their native language: 75% guaranteed revenue share, what satellites measure, and the unconditional right to leave anytime.',
  },
  {
    step: 2,
    persona: 'Farmer Mobile App',
    title: '3. Boundary Mapping & Real Overlap Check',
    caption:
      'The farmer registers their plot in acres and hectares. Our real Turf.js GIS engine immediately checks against neighboring registered farms to prevent double-counting or territorial disputes.',
  },
  {
    step: 3,
    persona: 'Farmer Mobile App',
    title: '4. Guided Evidence Capture & Real EXIF Parsing',
    caption:
      'Farmers capture 4 boundary corners and a canopy photo with random facing challenges. We parse real EXIF bytes with exifr and compute perceptual dHashes to stop photo reuse and out-of-boundary fraud live.',
  },
  {
    step: 4,
    persona: 'Farmer Mobile App',
    title: '5. Honest Credit Range & Rupee Payout',
    caption:
      'Rather than promising a deceptive single number, we show a conservative credit range and estimated payout in ₹ Rupees, with an Evidence Confidence Score and actionable tips to narrow the band.',
  },
  {
    step: 5,
    persona: 'Verifier Console',
    title: '6. Spatial Distribution & 10m Inner Buffer',
    caption:
      'Switching to the Verifier Console: auditors inspect all 6 Telangana plots on real satellite maps, complete with a 10m inner buffer that eliminates boundary pixel contamination.',
  },
  {
    step: 6,
    persona: 'Verifier Console',
    title: '7. Paired Delta dAGB & 1,000x Spatial Bootstrap',
    caption:
      'Inspect the true paired anniversary biomass delta dAGB = AGB(Y2) - AGB(Y1). The 1,000x bootstrap with spatial autocorrelation design effect strictly credits the 95% lower bound—paying for uncertainty with credits, not trust.',
  },
  {
    step: 7,
    persona: 'Verifier Console',
    title: '8. Cryptographic SHA-256 Chain & Live Tamper Check',
    caption:
      'Every remote-sensing ingestion and evidence event is locked into an immutable SHA-256 hash chain. One click on "VERIFY CHAIN" independently recomputes all blocks to catch unauthorized data tampering.',
  },
];

export const GuidedDemoBar: React.FC = () => {
  const { guidedDemo, nextDemoStep, prevDemoStep, toggleDemoPlay, stopGuidedDemo } = useMRVStore();

  if (!guidedDemo.isActive) return null;

  const current = DEMO_STEPS[guidedDemo.currentStep] || DEMO_STEPS[0];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-4xl w-[94vw] bg-[#1a3c2a] text-white p-4 rounded-3xl shadow-2xl border-2 border-[#52b788] animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Caption Info */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#52b788] text-[#132d20] text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-current" /> Demo Tour
            </span>
            <span className="text-xs text-[#b7e4c7] font-semibold">
              Step {current.step + 1} of {DEMO_STEPS.length} • {current.persona}
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">{current.title}</h4>
          <p className="text-xs text-[#d8f3dc] leading-relaxed">{current.caption}</p>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={prevDemoStep}
            disabled={current.step === 0}
            className="p-2 rounded-xl bg-[#2d6a4f] hover:bg-[#40916c] disabled:opacity-40 disabled:hover:bg-[#2d6a4f] text-white transition-all cursor-pointer"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={toggleDemoPlay}
            className="px-3 py-2 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#132d20] font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            {guidedDemo.isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{guidedDemo.isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={nextDemoStep}
            className="p-2 rounded-xl bg-[#2d6a4f] hover:bg-[#40916c] text-white transition-all cursor-pointer"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={stopGuidedDemo}
            className="p-2 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 transition-all ml-1 cursor-pointer"
            title="Exit Demo Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
