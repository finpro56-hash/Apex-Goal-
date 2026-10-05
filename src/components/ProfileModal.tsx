import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { 
  X, 
  ShieldCheck, 
  RefreshCw, 
  LogOut, 
  Clock, 
  Mail, 
  Download, 
  Sparkles,
  Smartphone
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalGoalsCount: number;
  totalTasksCount: number;
  completedTasksCount: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  totalGoalsCount,
  totalTasksCount,
  completedTasksCount,
}) => {
  const { user, session, timeRemainingMs, refreshSession, logout } = useAuth();
  const { isInstallable, install, isIOS } = usePWAInstall();

  if (!isOpen) return null;

  const formatTime = (ms: number) => {
    if (ms <= 0) return 'Expired';
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const sessionStartFormatted = session
    ? new Date(session.sessionStartedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Unknown';

  const sessionExpiresFormatted = session
    ? new Date(session.sessionExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Unknown';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto pb-safe shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-settings-title"
      >
        <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <h2 id="profile-settings-title" className="text-base font-bold text-white tracking-tight">
              Session & Account
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-500 hover:text-white rounded-full"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 text-emerald-400 font-bold text-lg flex items-center justify-center">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {user.displayName || 'Google User'}
              </h3>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 truncate mt-0.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
            </div>
          </div>
        )}

        {/* Lifetime Productivity Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-900 text-center">
            <div className="text-xs text-zinc-500">Goals</div>
            <div className="text-lg font-bold text-white tabular-nums font-mono mt-0.5">
              {totalGoalsCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-900 text-center">
            <div className="text-xs text-zinc-500">Pieces Done</div>
            <div className="text-lg font-bold text-emerald-400 tabular-nums font-mono mt-0.5">
              {completedTasksCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-900 text-center">
            <div className="text-xs text-zinc-500">Total Pieces</div>
            <div className="text-lg font-bold text-zinc-300 tabular-nums font-mono mt-0.5">
              {totalTasksCount}
            </div>
          </div>
        </div>

        {/* 24-Hour Session Security Center */}
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/90 p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">24-Hour Session Security</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-medium bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Your login automatically expires 24 hours after authentication to keep your goals and data private. Tokens are refreshed securely in the background.
          </p>

          <div className="space-y-2 pt-1 border-t border-zinc-800/60 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                Time Remaining:
              </span>
              <span className="font-mono text-emerald-300 font-semibold tabular-nums">
                {formatTime(timeRemainingMs)}
              </span>
            </div>

            <div className="flex items-center justify-between text-zinc-500 text-[11px]">
              <span>Started Today At:</span>
              <span className="font-mono text-zinc-400">{sessionStartFormatted}</span>
            </div>

            <div className="flex items-center justify-between text-zinc-500 text-[11px]">
              <span>Expires At:</span>
              <span className="font-mono text-zinc-400">{sessionExpiresFormatted}</span>
            </div>
          </div>

          <button
            onClick={refreshSession}
            className="w-full min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 flex items-center justify-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            Validate & Extend 24h Window
          </button>
        </div>

        {/* PWA App Installation Button */}
        {isInstallable && (
          <button
            onClick={install}
            className="w-full min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-2 transition shadow-md"
          >
            <Download className="w-4 h-4" />
            Install as Mobile App (PWA)
          </button>
        )}

        {/* Log Out */}
        <div className="pt-2 border-t border-zinc-900">
          <button
            onClick={async () => {
              await logout();
              onClose();
            }}
            className="w-full min-h-[44px] rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-900/40 text-xs font-medium flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            Log Out of Session
          </button>
        </div>
      </div>
    </div>
  );
};
