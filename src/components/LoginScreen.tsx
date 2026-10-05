import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { PWAInstallBanner } from './PWAInstallBanner';
import { Target, CheckCircle2, ShieldCheck, Sparkles, Layers } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, loading, authError, isSessionExpired } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-5 pb-safe max-w-md mx-auto">
      {/* Top Header */}
      <div className="pt-8 text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center justify-center mx-auto">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Apex Goal
        </h1>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
          Decompose overwhelming goals into milestones and actionable pieces. Achieve one task at a time.
        </p>
      </div>

      {/* Feature Pillars */}
      <div className="my-8 space-y-3">
        <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-900 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-zinc-200">Multi-Level Tree Decomposition</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Break big goals into strategic milestones, and milestones into immediate actionable pieces.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-900 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-zinc-200">Live Progress Rings</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              SVG completion rings automatically recalculate progress across all levels as tasks get checked off.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-900 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-zinc-200">24-Hour Secure Session Sync</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Google Auth with secure Firestore sync and automatic 24-hour token session expiration for complete privacy.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Auth Call to Action */}
      <div className="space-y-4">
        {isSessionExpired && (
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/50 text-amber-300 text-xs text-center">
            Your 24-hour session expired. Please sign in with Google to resume.
          </div>
        )}

        {authError && (
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs text-center">
            {authError}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full min-h-[48px] rounded-2xl bg-white hover:bg-zinc-100 text-black font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-[0_4px_24px_rgba(255,255,255,0.12)] active:scale-[0.99] disabled:opacity-50"
        >
          {/* Google Multi-Color SVG G Icon */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {loading ? 'Connecting to Google...' : 'Sign in with Google Mail'}
        </button>

        {/* PWA Install Component */}
        <PWAInstallBanner />

        <p className="text-[11px] text-zinc-500 text-center">
          Private & encrypted session storage · Auto-expires in 24 hours
        </p>
      </div>
    </div>
  );
};
