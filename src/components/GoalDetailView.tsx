import React, { useState } from 'react';
import { GoalWithBreakdown, Milestone, TaskItem } from '@/types';
import { ProgressRing } from './ProgressRing';
import { DatePickerInput } from './DatePickerInput';
import confetti from 'canvas-confetti';
import { 
  Check, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  Circle, 
  Flag, 
  Sparkles,
  X
} from 'lucide-react';

interface GoalDetailViewProps {
  goal: GoalWithBreakdown;
  onToggleTask: (task: TaskItem) => Promise<boolean>;
  onAddTask: (goalId: string, milestoneId: string, title: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onAddMilestone: (goalId: string, title: string) => Promise<void>;
  onDeleteMilestone: (milestoneId: string) => Promise<void>;
  onToggleGoalAchieved: (goal: GoalWithBreakdown) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onBack: () => void;
  onUpdateGoalDate?: (goalId: string, targetDate: string) => Promise<void>;
}

export const GoalDetailView: React.FC<GoalDetailViewProps> = ({
  goal,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onAddMilestone,
  onDeleteMilestone,
  onToggleGoalAchieved,
  onDeleteGoal,
  onBack,
  onUpdateGoalDate,
}) => {
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [taskInputs, setTaskInputs] = useState<{ [milestoneId: string]: string }>({});
  const [expandedMilestones, setExpandedMilestones] = useState<{ [milestoneId: string]: boolean }>({});
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);
  const [isEditingTargetDate, setIsEditingTargetDate] = useState(false);
  const [draftTargetDate, setDraftTargetDate] = useState<string>('');

  // Toggle milestone collapse state (defaults to closed/false when goal is opened)
  const toggleMilestoneExpanded = (mId: string) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [mId]: !prev[mId],
    }));
  };

  const handleTaskCheck = async (task: TaskItem) => {
    const nextState = await onToggleTask(task);
    if (nextState) {
      // Small celebratory burst
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#10b981', '#34d399', '#ffffff'],
      });
    }
  };

  const handleTaskSubmit = async (milestoneId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = (taskInputs[milestoneId] || '').trim();
    if (!title) return;

    await onAddTask(goal.id, milestoneId, title);
    setTaskInputs((prev) => ({ ...prev, [milestoneId]: '' }));
  };

  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    await onAddMilestone(goal.id, newMilestoneTitle.trim());
    setNewMilestoneTitle('');
    setIsAddingMilestone(false);
  };

  const handleGoalComplete = async () => {
    await onToggleGoalAchieved(goal);
    if (!goal.completed) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#ffffff'],
      });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-28 space-y-6">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors min-h-[44px] px-2 -ml-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to all goals
        </button>

        <button
          onClick={() => setIsDeletingGoal(true)}
          className="text-zinc-600 hover:text-rose-400 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Delete this entire goal"
          aria-label="Delete goal"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Goal Header Hero Card */}
      <div className="relative bg-zinc-950 border border-zinc-900 rounded-3xl p-5 overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                {goal.category}
              </span>
              {goal.completed && (
                <span className="text-xs text-zinc-400">· Achieved</span>
              )}
            </div>

            <h1 className={`mt-1.5 text-xl font-bold tracking-tight text-white ${goal.completed ? 'line-through text-zinc-400' : ''}`}>
              {goal.title}
            </h1>

            {goal.description && (
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                {goal.description}
              </p>
            )}

            {/* Unboxed Metadata Line */}
            <div className="mt-3 flex items-center flex-wrap gap-2 text-xs text-zinc-400 font-sans">
              <span className="tabular-nums">
                {goal.completedTasksCount} of {goal.totalTasksCount} pieces done
              </span>
              <span aria-hidden="true" className="text-zinc-700">·</span>
              <button
                type="button"
                onClick={() => {
                  setDraftTargetDate(goal.targetDate || '');
                  setIsEditingTargetDate(true);
                }}
                className="group inline-flex items-center gap-1.5 text-zinc-300 hover:text-emerald-300 transition-colors py-1 px-2.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 cursor-pointer min-h-[30px]"
                title="Click to change target date with visual calendar"
                aria-label="Edit target date"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors shrink-0" />
                <span className="font-medium">{goal.targetDate ? `Target ${goal.targetDate}` : 'Set target date'}</span>
              </button>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-2">
            <ProgressRing
              progress={goal.overallProgress}
              size={64}
              strokeWidth={5.5}
            />
            <button
              onClick={handleGoalComplete}
              className={`min-h-[36px] px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                goal.completed
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              {goal.completed ? 'Achieved' : 'Mark Achieved'}
            </button>
          </div>
        </div>

        {/* Milestone Breakdown Summary Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-900/80 flex items-center justify-between text-xs text-zinc-400">
          <span>{goal.milestones.length} Milestones defined</span>
          <span className="tabular-nums font-mono text-emerald-400">
            {goal.overallProgress}% Complete
          </span>
        </div>
      </div>

      {/* Goal Pieces Breakdown / Milestones Tree */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-200 uppercase tracking-wider text-[11px]">
            Goal Breakdown & Milestones
          </h2>

          <button
            onClick={() => setIsAddingMilestone(true)}
            className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors min-h-[44px] px-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>
        </div>

        {/* Inline Add Milestone Form */}
        {isAddingMilestone && (
          <form
            onSubmit={handleMilestoneSubmit}
            className="bg-zinc-950 border border-emerald-500/40 rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">New Milestone Phase</span>
              <button
                type="button"
                onClick={() => setIsAddingMilestone(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              placeholder="e.g. Phase 1: Research & Blueprint"
              autoFocus
              maxLength={200}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="h-9 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold"
              >
                Save Milestone
              </button>
            </div>
          </form>
        )}

        {/* Milestones Empty State */}
        {goal.milestones.length === 0 && !isAddingMilestone && (
          <div className="bg-zinc-950/50 border border-dashed border-zinc-800/80 rounded-2xl p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 text-zinc-500 flex items-center justify-center mx-auto">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">No milestones yet</p>
              <p className="mt-1 text-xs text-zinc-500">
                Break this big goal into 2 to 4 key milestones to start conquering it piece by piece.
              </p>
            </div>
            <button
              onClick={() => setIsAddingMilestone(true)}
              className="mt-2 h-9 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-800 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              Add First Milestone
            </button>
          </div>
        )}

        {/* Milestones List */}
        {goal.milestones.map((milestone, mIdx) => {
          const isExpanded = Boolean(expandedMilestones[milestone.id]);
          const completedCount = milestone.tasks.filter((t) => t.completed).length;
          const totalCount = milestone.tasks.length;
          const milestoneProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          const isMilestoneDone = totalCount > 0 && completedCount === totalCount;

          return (
            <div
              key={milestone.id}
              className="bg-zinc-950/80 border border-zinc-900 rounded-2xl overflow-hidden transition-all duration-200"
            >
              {/* Milestone Accordion Header */}
              <div className="p-4 flex items-center justify-between gap-3 bg-zinc-900/40">
                <button
                  onClick={() => toggleMilestoneExpanded(milestone.id)}
                  className="flex-1 flex items-center gap-3 text-left min-h-[44px]"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isMilestoneDone
                        ? 'bg-emerald-500 text-black'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {isMilestoneDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : mIdx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        isMilestoneDone ? 'line-through text-zinc-500' : 'text-zinc-100'
                      }`}
                    >
                      {milestone.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5 font-mono tabular-nums">
                      <span>{completedCount} / {totalCount} completed</span>
                      <span>·</span>
                      <span className={isMilestoneDone ? 'text-emerald-400' : 'text-zinc-400'}>
                        {milestoneProgress}%
                      </span>
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onDeleteMilestone(milestone.id)}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-600 hover:text-rose-400 transition-colors"
                    title="Delete milestone"
                    aria-label="Delete milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMilestoneExpanded(milestone.id);
                    }}
                    className="p-2 min-h-[44px] min-w-[44px] rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                    title={isExpanded ? 'Collapse sub-tasks' : 'Expand sub-tasks'}
                    aria-label={isExpanded ? 'Collapse milestone' : 'Expand milestone'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Milestone Progress Hairline */}
              <div className="w-full bg-zinc-900 h-1">
                <div
                  className="bg-emerald-500 h-1 transition-all duration-300"
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>

              {/* Collapsible Tasks Body */}
              {isExpanded && (
                <div className="p-4 space-y-3">
                  {/* Task Items */}
                  {milestone.tasks.length === 0 ? (
                    <p className="text-xs text-zinc-600 py-1 italic">
                      No actionable tasks yet. Add small concrete steps below.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {milestone.tasks.map((task) => (
                        <li
                          key={task.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-900 transition-colors group"
                        >
                          <button
                            onClick={() => handleTaskCheck(task)}
                            className="flex-1 flex items-start gap-3 text-left min-h-[40px] py-0.5"
                          >
                            <div className="mt-0.5 shrink-0">
                              {task.completed ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-zinc-700 hover:border-emerald-400 flex items-center justify-center transition-colors" />
                              )}
                            </div>
                            <span
                              className={`text-xs leading-relaxed ${
                                task.completed
                                  ? 'line-through text-zinc-500'
                                  : 'text-zinc-200 group-hover:text-white'
                              }`}
                            >
                              {task.title}
                            </span>
                          </button>

                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="text-zinc-600 hover:text-rose-400 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                            title="Delete task"
                            aria-label="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Inline Rapid Task Adder */}
                  <form
                    onSubmit={(e) => handleTaskSubmit(milestone.id, e)}
                    className="flex items-center gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={taskInputs[milestone.id] || ''}
                      onChange={(e) =>
                        setTaskInputs((prev) => ({
                          ...prev,
                          [milestone.id]: e.target.value,
                        }))
                      }
                      placeholder="+ Add actionable task..."
                      maxLength={200}
                      className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!(taskInputs[milestone.id] || '').trim()}
                      className="min-h-[44px] px-3.5 rounded-xl bg-zinc-900 hover:bg-emerald-500 hover:text-black text-zinc-300 disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:hover:text-zinc-300 text-xs font-medium transition-colors border border-zinc-800"
                    >
                      Add
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Goal Confirmation Modal */}
      {isDeletingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-semibold text-white">Delete this Goal?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This will permanently remove <span className="text-white font-medium">"{goal.title}"</span> along with all its milestones and broken down pieces.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setIsDeletingGoal(false)}
                className="min-h-[44px] px-4 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onDeleteGoal(goal.id);
                  onBack();
                }}
                className="min-h-[44px] px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Delete Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Target Date Edit Modal Dialog */}
      {isEditingTargetDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Goal Target Date
                </h3>
                <p className="text-[11px] text-zinc-500">Pick a completion date for this ambition</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingTargetDate(false)}
                className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center text-zinc-500 hover:text-white rounded-full transition-colors"
                aria-label="Close date picker dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <DatePickerInput
              value={draftTargetDate}
              onChange={(newDate) => {
                setDraftTargetDate(newDate);
              }}
              label="Select Target Date"
              placeholder="Tap to open visual calendar..."
              showQuickPresets={true}
            />

            <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
              {draftTargetDate ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraftTargetDate('');
                  }}
                  className="text-rose-400 hover:text-rose-300 transition-colors py-1 font-medium min-h-[36px] flex items-center"
                >
                  Clear Date
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={async () => {
                  if (onUpdateGoalDate) {
                    await onUpdateGoalDate(goal.id, draftTargetDate);
                  }
                  setIsEditingTargetDate(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
