import React, { useState } from 'react';
import {
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  Fingerprint,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { useMRVStore } from '../../store/useMRVStore';
import { TRANSLATIONS } from '../../i18n/translations';
import { evaluatePasswordStrength } from '../../core/authEngine';

export const FarmerWelcome: React.FC = () => {
  const { language, setLanguage, setFarmerStep, login, loginWithThumbprint } = useMRVStore();
  const t = TRANSLATIONS[language];

  // Strictly NO hardcoded values: clean empty inputs
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Biometric Thumbprint Scanning State
  const [isScanningThumb, setIsScanningThumb] = useState(false);
  const [isThumbVerified, setIsThumbVerified] = useState(false);

  const pwdStrength = evaluatePasswordStrength(password);

  const handleThumbprintAuth = async () => {
    if (isScanningThumb || isThumbVerified) return;
    setIsScanningThumb(true);
    setErrorMessage(null);

    // Provide immediate tactile haptic feedback
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 80, 40]);
      }
    }

    // Realistic capacitive scan validation
    setTimeout(async () => {
      try {
        const res = await loginWithThumbprint();
        if (res.success) {
          setIsThumbVerified(true);
          try {
            await Haptics.notification({ type: NotificationType.Success });
          } catch {}
          setTimeout(() => {
            setFarmerStep('consent');
          }, 500);
        } else {
          setErrorMessage(res.error || 'Thumbprint not recognized. Please try again.');
          setIsScanningThumb(false);
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Biometric authentication failed.');
        setIsScanningThumb(false);
      }
    }, 750);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

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

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#1a3c2a] to-[#2d6a4f] text-white p-5 rounded-2xl shadow-sm space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#52b788]/20 text-[#d8f3dc] border border-[#52b788]/30">
            {t.farmerApp.roleTitle}
          </span>
          <span className="text-[10px] font-mono text-[#b7e4c7]">INNOVASIA 2K26</span>
        </div>
        <h2 className="text-lg font-extrabold tracking-tight">
          {language === 'te'
            ? 'నమస్కారం, రైతు ఖాతా ప్రవేశం'
            : language === 'hi'
            ? 'नमस्ते, किसान लॉगिन'
            : 'Welcome to Carbon Kheti'}
        </h2>
        <p className="text-[11px] text-[#d8f3dc] leading-relaxed">
          Open, conservative MRV for smallholder agroforestry in Telangana.
        </p>
      </div>

      {/* Language Selector */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 block">
          Select Language / భాష / भाषा:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'en', label: 'English' },
            { id: 'te', label: 'తెలుగు' },
            { id: 'hi', label: 'हिन्दी' },
          ].map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setLanguage(lang.id as any)}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                language === lang.id
                  ? 'bg-[#1a3c2a] text-white border-[#1a3c2a] shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message Box */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* PRIMARY: One-Touch Thumbprint Biometric Sign In */}
      <div className="bg-emerald-50/80 border-2 border-emerald-300 p-5 rounded-2xl text-center space-y-3 shadow-xs">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-950">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fast Biometric Sign In</span>
        </div>

        {/* Interactive Thumbprint Scanner */}
        <div className="flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleThumbprintAuth}
            disabled={isScanningThumb || isThumbVerified}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
              isThumbVerified
                ? 'bg-emerald-600 text-white shadow-emerald-400/50'
                : isScanningThumb
                ? 'bg-amber-500 text-white animate-pulse shadow-amber-300/50'
                : 'bg-gradient-to-tr from-[#1a3c2a] to-[#2d6a4f] text-emerald-100 hover:brightness-110 shadow-emerald-900/30'
            }`}
          >
            {/* Outer animated scanning ring */}
            <span
              className={`absolute inset-0 rounded-full border-4 border-dashed transition-all ${
                isScanningThumb
                  ? 'border-white animate-spin'
                  : 'border-emerald-300/40 animate-pulse'
              }`}
            />
            {isThumbVerified ? (
              <CheckCircle2 className="w-12 h-12 text-white animate-in zoom-in-75 duration-200" />
            ) : (
              <Fingerprint className="w-12 h-12" />
            )}
          </button>

          <p className="text-xs font-extrabold text-[#1a3c2a] mt-3">
            {isThumbVerified
              ? '✓ Thumbprint Verified!'
              : isScanningThumb
              ? 'Scanning Thumbprint Sensor...'
              : 'Touch Thumbprint to Sign In'}
          </p>
          <span className="text-[10px] text-slate-500 mt-0.5">
            Tap sensor with thumb to authenticate smallholder profile
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-2">
        <div className="h-px bg-slate-200 flex-1" />
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Or Enter Mobile Number
        </span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      {/* Manual Phone Number + Password Login */}
      <form onSubmit={handleLoginSubmit} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#2d6a4f]" /> Indian Mobile Number (+91)
          </label>
          <div className="flex gap-2">
            <div className="flex items-center px-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
              +91
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 10-digit number"
              maxLength={10}
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
            placeholder="Enter password"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
          />

          {password.length > 0 && (
            <div className="pt-1 space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Strength: <strong>{pwdStrength.label}</strong></span>
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
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-[#1a3c2a] hover:bg-[#2d6a4f] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Authenticating...' : 'Sign In with Mobile & Password'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
