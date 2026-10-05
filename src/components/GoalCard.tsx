import React from 'react';
import { GoalWithBreakdown } from '@/types';
import { ProgressRing } from './ProgressRing';
import { ChevronRight, Check } from 'lucide-react';

interface GoalCardProps {
  goal: GoalWithBreakdown;
  onSelect: (goalId: string) => void;
  onToggleGoalAchieved: (goal: GoalWithBreakdown, e: React.MouseEvent) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onSelect,
  onToggleGoalAchieved,
}) => {
  const isAllDone = goal.completed || (goal.totalTasksCount > 0 && goal.completedTasksCount === goal.totalTasksCount);

  return (
    <div
      onClick={() => onSelect(goal.id)}
      className="group relative w-full bg-zinc-950/70 hover:bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800/90 rounded-2xl p-4 transition-all duration-200 cursor-pointer text-left active:scale-[0.99]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(goal.id);
        }
      }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Column: Title, Metadata, Milestones Count */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`text-base font-semibold tracking-tight truncate ${
                isAllDone ? 'line-through text-zinc-500' : 'text-zinc-100 group-hover:text-emerald-300'
              } transition-colors`}
            >
              {goal.title}
            </h3>
          </div>

          {goal.description && (
            <p className="mt-1 text-xs text-zinc-400 line-clamp-1">
              {goal.description}
            </p>
          )}

          {/* Clean Unboxed Metadata with middots - Zero Pill Discipline */}
          <div className="mt-2.5 flex items-center flex-wrap gap-2 text-xs text-zinc-400 font-sans">
            <span className="text-zinc-300 font-medium">{goal.category}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="tabular-nums">
              {goal.completedTasksCount} / {goal.totalTasksCount} pieces done
            </span>
            {goal.targetDate && (
              <>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="text-zinc-400">Target {goal.targetDate}</span>
              </>
            )}
          </div>

          {/* Milestones count teaser */}
          <div className="mt-2 text-[11px] text-zinc-400">
            {goal.milestones.length === 0 ? (
              <span className="text-emerald-400/80 font-medium">+ Add milestones & break down</span>
            ) : (
              <span>{goal.milestones.length} milestone{goal.milestones.length > 1 ? 's' : ''} established</span>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic SVG Progress Ring & Quick Check */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <ProgressRing
            progress={goal.overallProgress}
            size={52}
            strokeWidth={4.5}
          />

          <button
            onClick={(e) => onToggleGoalAchieved(goal, e)}
            className={`min-h-[32px] min-w-[32px] rounded-full border flex items-center justify-center transition-colors ${
              goal.completed
                ? 'bg-emerald-500 border-emerald-500 text-black'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
            title={goal.completed ? 'Mark goal incomplete' : 'Mark goal achieved'}
            aria-label={goal.completed ? 'Mark goal incomplete' : 'Mark goal achieved'}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
