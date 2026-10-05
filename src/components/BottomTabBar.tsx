import React from 'react';
import { Target, CheckCircle2, Shield, Plus } from 'lucide-react';

export type TabKey = 'goals' | 'focus' | 'profile';

interface BottomTabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onOpenNewGoal: () => void;
  totalActiveTasks: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewGoal,
  totalActiveTasks,
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-900 pb-safe"
      role="navigation"
      aria-label="Main application navigation"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Tab 1: Goals */}
        <button
          onClick={() => onTabChange('goals')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'goals' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          aria-label="Goals Overview"
        >
          <Target className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-tight mt-1">Goals</span>
        </button>

        {/* Center Floating Action Button: Add Goal */}
        <div className="flex items-center justify-center px-2">
          <button
            onClick={onOpenNewGoal}
            className="w-12 h-12 -mt-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-[0_4px_20px_rgba(16,185,129,0.35)] active:scale-95 transition-all"
            aria-label="Create New Big Goal"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 2: Focus / Next Actions */}
        <button
          onClick={() => onTabChange('focus')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors relative ${
            activeTab === 'focus' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          aria-label="Today Focus Next Tasks"
        >
          <div className="relative">
            <CheckCircle2 className="w-5 h-5" />
            {totalActiveTasks > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-emerald-500 text-black text-[9px] font-bold flex items-center justify-center tabular-nums">
                {totalActiveTasks > 99 ? '99+' : totalActiveTasks}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight mt-1">Focus</span>
        </button>

        {/* Tab 3: Security & Session */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'profile' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          aria-label="Profile and 24h Session Status"
        >
          <Shield className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-tight mt-1">Session</span>
        </button>
      </div>
    </nav>
  );
};
