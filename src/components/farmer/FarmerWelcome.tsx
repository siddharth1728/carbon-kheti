import React, { useState } from 'react';
import { Smartphone, Lock, Eye, EyeOff, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';
import { useMRVStore } from '../../store/useMRVStore';
import { TRANSLATIONS } from '../../i18n/translations';
import { evaluatePasswordStrength, DEMO_ACCOUNTS } from '../../core/authEngine';

export const FarmerWelcome: React.FC = () => {
  const { language, setLanguage, setFarmerStep, login } = useMRVStore();
  const t = TRANSLATIONS[language];

  const [phone, setPhone] = useState('9849012345');
  const [password, setPassword] = useState('Farmer@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pwdStrength = evaluatePasswordStrength(password);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await login(phone, password);
      if (res.success) {
        setFarmerStep('consent');
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setPhone(acc.phone.replace('+91', ''));
    setPassword(acc.passwordClear);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#1a3c2a] to-[#2d6a4f] text-white p-6 rounded-3xl shadow-md space-y-2">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#52b788]/20 text-[#d8f3dc] border border-[#52b788]/30">
            {t.farmerApp.roleTitle}
          </span>
          <span className="text-[10px] font-mono text-[#b7e4c7]">INNOVASIA 2K26 · PS-13</span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">
          {language === 'te'
            ? 'నమస్కారం, రైతు ఖాతా ప్రవేశం'
            : language === 'hi'
            ? 'नमस्ते, किसान लॉगिन'
            : 'Welcome to Carbon Kheti'}
        </h2>
        <p className="text-xs text-[#d8f3dc] leading-relaxed">
          Open, conservative MRV designed for smallholder agroforestry in Telangana.
        </p>
      </div>

      {/* Language Toggle right at the top */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <label className="text-xs font-bold text-slate-700 block">
          Select Language / భాష ఎంచుకోండి / भाषा चुनें:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'en', label: 'English' },
            { id: 'te', label: 'తెలుగు (Telugu)' },
            { id: 'hi', label: 'हिन्दी (Hindi)' },
          ].map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setLanguage(lang.id as any)}
              className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                language === lang.id
                  ? 'bg-[#1a3c2a] text-white border-[#1a3c2a] shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* E.164 Mobile + Password Login Form */}
      <form onSubmit={handleLoginSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#2d6a4f]" /> Indian Mobile Number (+91 E.164)
          </label>
          <div className="flex gap-2">
            <div className="flex items-center px-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
              +91
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9849012345"
              maxLength={10}
              required
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#2d6a4f]" /> Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showPassword ? 'Hide' : 'Show'}</span>
            </button>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
          />

          {/* Friendly Password Strength Meter */}
          <div className="pt-1.5 space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Security strength: <strong>{pwdStrength.label}</strong></span>
              <span>{pwdStrength.score}/4</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex gap-1">
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-full flex-1 rounded-full transition-all ${
                    step < pwdStrength.score
                      ? pwdStrength.score <= 1
                        ? 'bg-red-500'
                        : pwdStrength.score === 2
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[#1a3c2a] hover:bg-[#2d6a4f] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Authenticating...' : 'Sign In & Enter Farm'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Seed Demo Accounts Picker */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
        <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-[#2d6a4f]" /> Quick Pre-Fill Seed Credentials
        </span>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.phone}
              type="button"
              onClick={() => handleQuickFill(acc)}
              className="text-left p-2.5 bg-white border border-slate-200 hover:border-[#2d6a4f] rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <p className="text-[11px] font-bold text-[#1a3c2a] truncate">{acc.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">{acc.phone}</p>
              <span className="inline-block mt-1 text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                {acc.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
