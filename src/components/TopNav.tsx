import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { ShieldCheck, WifiOff, Clock } from 'lucide-react';

interface TopNavProps {
  onOpenProfile: () => void;
  activeGoalTitle?: string;
  onBackToGoals?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenProfile,
  activeGoalTitle,
  onBackToGoals,
}) => {
  const { user, timeRemainingMs } = useAuth();
  const isOnline = useOnlineStatus();

  // Format milliseconds into remaining hours and minutes (e.g. 23h 48m)
  const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return 'Expired';
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-black/90 backdrop-blur-md border-b border-zinc-900/80 px-4 h-14 flex items-center justify-between">
      {/* Zone 1: Brand Title or Back Navigation */}
      <div className="flex items-center gap-3">
        {activeGoalTitle ? (
          <button
            onClick={onBackToGoals}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] -ml-2 px-2"
            aria-label="Back to all goals"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium text-zinc-200 truncate max-w-[180px]">
              Goals
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <span className="text-base font-bold tracking-tight text-white font-sans">
              Apex Goal
            </span>
          </div>
        )}
      </div>

      {/* Zone 2: Quiet Metadata (Online state & 24h session timer) */}
      <div className="flex items-center gap-3 text-xs text-zinc-400">
        {!isOnline && (
          <span className="flex items-center gap-1.5 text-amber-400 text-xs">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline</span>
          </span>
        )}

        {user && timeRemainingMs > 0 && (
          <div
            title="Session duration remaining (expires after 24 hours)"
            className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px] tabular-nums"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>{formatTimeRemaining(timeRemainingMs)}</span>
          </div>
        )}
      </div>

      {/* Zone 3: Primary Action / User Profile Avatar */}
      <div className="flex items-center gap-2">
        {user ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full hover:ring-2 hover:ring-emerald-500/30 transition"
            aria-label="Open User Profile and Session Settings"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-zinc-800 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-emerald-400 font-medium text-xs flex items-center justify-center">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
          </button>
        ) : (
          <div className="w-8 h-8" />
        )}
      </div>
    </header>
  );
};
