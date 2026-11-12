import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, QrCode, ShieldAlert, FileText } from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';
import { generateReportJSON, triggerFileDownload } from '../../services/exportService';

export const VerifierExportTab: React.FC = () => {
  const { currentPlot, currentMRV, auditChain, verifyChainResult, isChainVerified } = useMRVStore();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const reportId = `${currentPlot.id}-2025-VERIFIED`;
  const isChainBroken = verifyChainResult && !verifyChainResult.valid;
  const rootHash = auditChain.length > 0 ? auditChain[auditChain.length - 1].currentHash : '0'.repeat(64);

  useEffect(() => {
    const publicVerifyUrl = `${window.location.origin}/#verify/${reportId}`;
    QRCode.toDataURL(publicVerifyUrl, {
      margin: 1,
      width: 140,
      color: { dark: '#1a3c2a', light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [reportId]);

  const handleDownloadJSON = () => {
    if (isChainBroken) return;
    const jsonStr = generateReportJSON({
      plot: currentPlot as any,
      mrv: currentMRV,
      auditChain,
    });
    triggerFileDownload(jsonStr, `carbon_kheti_${currentPlot.id}.json`, 'application/json');
  };

  const handlePrint = () => {
    if (isChainBroken) return;
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Red Warning Banner if Chain is Broken per Bug B9 */}
      {isChainBroken && (
        <div className="p-5 bg-red-100 border-2 border-red-500 rounded-3xl flex items-start gap-3.5 text-red-950 shadow-md">
          <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-black text-sm uppercase tracking-wider text-red-900">
              EXPORT PROHIBITED: CRYPTOGRAPHIC CHAIN TAMPER DETECTED
            </h4>
            <p className="leading-relaxed">
              Record #{verifyChainResult.brokenIdx} payload hash does not match stored block digest.
              Under Carbon Kheti integrity rules, no verification dossier or credit certificate may be exported from a broken audit trail.
            </p>
            <p className="font-semibold text-red-800 pt-1">
              Click &ldquo;Restore State&rdquo; in the Audit Log tab to return to an uncompromised chain.
            </p>
          </div>
        </div>
      )}

      {/* Header & Export Actions */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-[#1a3c2a] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2d6a4f]" />
            Verification-Ready Estimate Dossier
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dossier ID: <span className="font-mono font-bold text-slate-800">{reportId}</span> • Exportable PDF &amp; Structured JSON
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadJSON}
            disabled={Boolean(isChainBroken)}
            className="px-4 py-2.5 bg-[#1a3c2a] hover:bg-[#2d6a4f] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={Boolean(isChainBroken)}
            className="px-4 py-2.5 bg-[#2d6a4f] hover:bg-[#1a3c2a] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* Printable Official Dossier Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Dossier Header */}
        <div className="border-b border-slate-200 pb-5 flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
              Official MRV Audit Dossier
            </span>
            <h2 className="text-2xl font-black text-[#1a3c2a] tracking-tight">
              Smallholder Agroforestry Verification Report
            </h2>
            <p className="text-xs text-slate-500">
              Prepared for Accredited Validation &amp; Verification Bodies (VVBs) • Telangana State (UTM 44N)
            </p>
          </div>

          {qrDataUrl && (
            <div className="flex flex-col items-center">
              <img src={qrDataUrl} alt="Public Verify QR Code" className="w-24 h-24 rounded-lg border border-slate-200 p-1" />
              <span className="text-[9px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                <QrCode className="w-3 h-3" /> Scan to Verify
              </span>
            </div>
          )}
        </div>

        {/* 3 Summary Stat Blocks */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Farmer &amp; Location</span>
            <p className="text-base font-extrabold text-[#1a3c2a] mt-0.5">{currentPlot.farmerName}</p>
            <p className="text-xs text-slate-600">{currentPlot.village}, {currentPlot.district}</p>
          </div>

          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
            <span className="text-[10px] uppercase font-bold text-emerald-900">95% Verifiable Lower Bound</span>
            <p className="text-base font-extrabold text-emerald-900 mt-0.5">
              {currentMRV.finalCreditsPerHa.toFixed(2)} <span className="text-xs font-normal">tCO₂e / ha / yr</span>
            </p>
            <p className="text-xs text-emerald-800">Total: {currentMRV.totalFarmCredits.toFixed(2)} tCO₂e / yr</p>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200">
            <span className="text-[10px] uppercase font-bold text-amber-900">Over-Crediting Avoided</span>
            <p className="text-base font-extrabold text-amber-950 mt-0.5">
              {currentMRV.deductions.uncertaintyHaircutCo2ePerHa.toFixed(2)} <span className="text-xs font-normal">tCO₂e / ha</span>
            </p>
            <p className="text-xs text-amber-800">Uncertainty haircut deduction</p>
          </div>
        </div>

        {/* Parameters & Pools */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h5 className="font-bold text-[#1a3c2a] uppercase text-[11px] tracking-wider">Accounting Parameters</h5>
            <ul className="space-y-1 text-slate-600">
              <li>• <strong>Belowground Ratio:</strong> R = 0.25 (IPCC GPG 2006)</li>
              <li>• <strong>Baseline Deduction:</strong> {currentMRV.derivedBaselineDagb.toFixed(2)} t biomass/ha (Derived matched control)</li>
              <li>• <strong>Carbon Fraction:</strong> 0.47 t C / dry biomass tonne</li>
              <li>• <strong>CO₂ Stoichiometry:</strong> 44/12 mass ratio factor</li>
              <li>• <strong>Permanence Reserve:</strong> 15.0% pooled risk buffer</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h5 className="font-bold text-[#1a3c2a] uppercase text-[11px] tracking-wider">Excluded Carbon Pools</h5>
            <ul className="space-y-1 text-slate-600">
              <li>• <strong>Dead Wood:</strong> Excluded to avoid baseline inflation</li>
              <li>• <strong>Litter:</strong> Excluded due to rapid tropical monsoon turnover</li>
              <li>• <strong>Soil Organic Carbon (SOC):</strong> Excluded without soil core lab tests</li>
            </ul>
          </div>
        </div>

        {/* Cryptographic Provenance Root */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700">Cryptographic SHA-256 Provenance Root:</span>
          <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto shadow-inner">
            {rootHash}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            {auditChain.length} event blocks sealed • Status: {isChainVerified ? 'Verified 100% Intact' : 'Pending Re-verification'}
          </p>
        </div>
      </div>
    </div>
  );
};
