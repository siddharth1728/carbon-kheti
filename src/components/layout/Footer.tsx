import React from 'react';
import { Leaf, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#143224] text-[#b7e4c7] border-t border-[#2d6a4f] py-6 px-4 mt-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <Leaf className="w-4 h-4 text-[#52b788]" />
          <span className="font-semibold text-white">Carbon Kheti MRV Engine</span>
          <span className="text-slate-400">•</span>
          <span>Open Architecture for Smallholder Agroforestry</span>
        </div>

        <div className="flex items-center gap-6 text-[#95d5b2]">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#52b788]" /> Conservative Lower-Bound Crediting
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#52b788]" /> Sentinel-1 & 2 Multispectral
          </span>
        </div>

        <div className="text-slate-400 text-center md:text-right">
          Telangana, India • Built for Third-Party VVB Verification
        </div>
      </div>
    </footer>
  );
};
