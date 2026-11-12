import React from 'react';
import { Download, ArrowUpCircle } from 'lucide-react';

interface Props {
  info: {
    minVersion: string;
    updateUrl: string;
    message: string;
  } | null;
  onDismiss?: () => void;
}

export const UpdateRequiredModal: React.FC<Props> = ({ info, onDismiss }) => {
  if (!info) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ArrowUpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-[#1a3c2a]">App Update Required</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {info.message ||
              `A critical protocol update requires minimum app version v${info.minVersion} to ensure cryptographic audit compatibility.`}
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 font-mono">
          Minimum Protocol Version: v{info.minVersion}
        </div>

        <div className="flex gap-2 pt-2">
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Continue in Offline Demo Mode
            </button>
          )}
          <a
            href={info.updateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-[#1a3c2a] hover:bg-[#2d6a4f] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Update</span>
          </a>
        </div>
      </div>
    </div>
  );
};
