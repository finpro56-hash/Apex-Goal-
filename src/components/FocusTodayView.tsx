import React from 'react';
import { GoalWithBreakdown, TaskItem } from '@/types';
import { Check, CheckCircle2, Flame, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusTodayViewProps {
  goals: GoalWithBreakdown[];
  onToggleTask: (task: TaskItem) => Promise<boolean>;
  onSelectGoal: (goalId: string) => void;
}

export const FocusTodayView: React.FC<FocusTodayViewProps> = ({
  goals,
  onToggleTask,
  onSelectGoal,
}) => {
  // Flatten all active, incomplete tasks across all active goals
  const activePieces: {
    task: TaskItem;
    goalTitle: string;
    goalId: string;
    milestoneTitle: string;
    category: string;
  }[] = [];

  goals.forEach((goal) => {
    if (goal.completed) return;
    goal.milestones.forEach((milestone) => {
      milestone.tasks.forEach((task) => {
        if (!task.completed) {
          activePieces.push({
            task,
            goalTitle: goal.title,
            goalId: goal.id,
            milestoneTitle: milestone.title,
            category: goal.category,
          });
        }
      });
    });
  });

  const handleToggle = async (task: TaskItem) => {
    const isDone = await onToggleTask(task);
    if (isDone) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#10b981', '#34d399', '#ffffff'],
      });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-5">
      {/* Header section */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Focus Queue
          </span>
          <span aria-hidden="true" className="text-zinc-700">·</span>
          <span className="text-xs text-zinc-500 font-mono tabular-nums">
            {activePieces.length} pieces remaining
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
          Next Actions
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Tackle individual pieces one at a time. Progress automatically syncs to your parent goals.
        </p>
      </div>

      {activePieces.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">All Caught Up!</h3>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              You have completed all pending pieces across your goals. Add new milestones or celebrate your victories!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {activePieces.map(({ task, goalTitle, goalId, milestoneTitle, category }) => (
            <div
              key={task.id}
              className="bg-zinc-950/80 border border-zinc-900 hover:border-zinc-800 rounded-2xl p-4 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => handleToggle(task)}
                  className="mt-0.5 shrink-0 min-h-[44px] min-w-[44px] -ml-2 -mt-2 flex items-center justify-center"
                  aria-label="Mark task done"
                >
                  <div className="w-6 h-6 rounded-full border border-zinc-700 group-hover:border-emerald-400 flex items-center justify-center transition-colors" />
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-100 group-hover:text-white leading-snug">
                    {task.title}
                  </p>

                  {/* Clean unboxed context metadata */}
                  <div className="mt-2 flex items-center flex-wrap gap-1.5 text-[11px] text-zinc-500 font-sans">
                    <span className="text-emerald-400/90 font-medium">{category}</span>
                    <span aria-hidden="true" className="text-zinc-700">·</span>
                    <span className="truncate max-w-[120px] text-zinc-400">{milestoneTitle}</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectGoal(goalId)}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-600 hover:text-zinc-300 transition-colors"
                  title="Open parent goal"
                  aria-label="Open parent goal"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
