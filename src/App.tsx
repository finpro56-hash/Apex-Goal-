/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { goalService } from '@/services/goalService';
import { Goal, Milestone, TaskItem, GoalWithBreakdown } from '@/types';
import { TopNav } from '@/components/TopNav';
import { BottomTabBar, TabKey } from '@/components/BottomTabBar';
import { GoalCard } from '@/components/GoalCard';
import { GoalDetailView } from '@/components/GoalDetailView';
import { FocusTodayView } from '@/components/FocusTodayView';
import { NewGoalModal } from '@/components/NewGoalModal';
import { ProfileModal } from '@/components/ProfileModal';
import { LoginScreen } from '@/components/LoginScreen';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Plus, Target, CheckCircle2, Filter, AlertCircle, WifiOff } from 'lucide-react';
import confetti from 'canvas-confetti';

type GoalFilter = 'active' | 'achieved' | 'all';

function MainApp() {
  const { user, loading: authLoading } = useAuth();
  const isOnline = useOnlineStatus();

  const [rawGoals, setRawGoals] = useState<Goal[]>([]);
  const [rawMilestones, setRawMilestones] = useState<Milestone[]>([]);
  const [rawTasks, setRawTasks] = useState<TaskItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabKey>('goals');
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('active');

  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Real-time Firestore subscriptions for authenticated user
  useEffect(() => {
    if (!user) {
      setRawGoals([]);
      setRawMilestones([]);
      setRawTasks([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    const unsubGoals = goalService.subscribeGoals(user.uid, (goals) => {
      setRawGoals(goals);
      setDataLoading(false);
    });

    const unsubMilestones = goalService.subscribeMilestones(user.uid, (milestones) => {
      setRawMilestones(milestones);
    });

    const unsubTasks = goalService.subscribeTasks(user.uid, (tasks) => {
      setRawTasks(tasks);
    });

    return () => {
      unsubGoals();
      unsubMilestones();
      unsubTasks();
    };
  }, [user]);

  // Hierarchical breakdown computation
  const goalsWithBreakdown: GoalWithBreakdown[] = useMemo(() => {
    return rawGoals.map((goal) => {
      const milestones = rawMilestones
        .filter((m) => m.goalId === goal.id)
        .map((milestone) => {
          const tasks = rawTasks.filter((t) => t.milestoneId === milestone.id);
          const completedCount = tasks.filter((t) => t.completed).length;
          const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
          return {
            ...milestone,
            tasks,
            progress,
          };
        });

      const allGoalTasks = rawTasks.filter((t) => t.goalId === goal.id);
      const completedTasksCount = allGoalTasks.filter((t) => t.completed).length;
      const totalTasksCount = allGoalTasks.length;
      const overallProgress = goal.completed
        ? 100
        : totalTasksCount > 0
        ? Math.round((completedTasksCount / totalTasksCount) * 100)
        : 0;

      return {
        ...goal,
        milestones,
        totalTasksCount,
        completedTasksCount,
        overallProgress,
      };
    });
  }, [rawGoals, rawMilestones, rawTasks]);

  // Selected goal detail
  const activeGoal = useMemo(() => {
    if (!activeGoalId) return null;
    return goalsWithBreakdown.find((g) => g.id === activeGoalId) || null;
  }, [goalsWithBreakdown, activeGoalId]);

  // Filtered goals for overview
  const filteredGoals = useMemo(() => {
    return goalsWithBreakdown.filter((g) => {
      if (goalFilter === 'active') return !g.completed;
      if (goalFilter === 'achieved') return g.completed;
      return true;
    });
  }, [goalsWithBreakdown, goalFilter]);

  // Total active incomplete tasks
  const totalActiveTasks = useMemo(() => {
    return rawTasks.filter((t) => !t.completed).length;
  }, [rawTasks]);

  // Handlers
  const handleCreateGoal = async (params: {
    title: string;
    description?: string;
    category?: string;
    targetDate?: string;
    initialMilestones?: { title: string; tasks: string[] }[];
  }) => {
    if (!user) return;
    const newGoalId = await goalService.createGoal(user.uid, params);
    if (newGoalId) {
      setActiveGoalId(newGoalId);
      setActiveTab('goals');
    }
  };

  const handleToggleTask = async (task: TaskItem): Promise<boolean> => {
    return await goalService.toggleTask(task);
  };

  const handleAddTask = async (goalId: string, milestoneId: string, title: string) => {
    if (!user) return;
    const milestoneTasks = rawTasks.filter((t) => t.milestoneId === milestoneId);
    await goalService.createTask(user.uid, goalId, milestoneId, title, milestoneTasks.length + 1);
  };

  const handleDeleteTask = async (taskId: string) => {
    await goalService.deleteTask(taskId);
  };

  const handleAddMilestone = async (goalId: string, title: string) => {
    if (!user) return;
    const goalMilestones = rawMilestones.filter((m) => m.goalId === goalId);
    await goalService.createMilestone(user.uid, goalId, title, goalMilestones.length + 1);
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    await goalService.deleteMilestone(milestoneId, rawTasks);
  };

  const handleToggleGoalAchieved = async (goal: GoalWithBreakdown) => {
    if (!user) return;
    const nextCompleted = !goal.completed;
    await goalService.updateGoal(goal.id, user.uid, { completed: nextCompleted });
    if (nextCompleted) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#ffffff'],
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    await goalService.deleteGoal(goalId, rawMilestones, rawTasks);
    if (activeGoalId === goalId) {
      setActiveGoalId(null);
    }
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center animate-pulse">
          <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
        </div>
        <p className="mt-4 text-xs text-zinc-400 font-mono">Initializing Apex Goal...</p>
      </div>
    );
  }

  // Unauthenticated Screen
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar Contract (1 Row, 3 Zones) */}
      <TopNav
        onOpenProfile={() => setIsProfileOpen(true)}
        activeGoalTitle={activeGoal ? activeGoal.title : undefined}
        onBackToGoals={() => setActiveGoalId(null)}
      />

      {/* Main Body */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {/* If inside a specific goal drilldown */}
        {activeGoal ? (
          <GoalDetailView
            goal={activeGoal}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onAddMilestone={handleAddMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            onToggleGoalAchieved={handleToggleGoalAchieved}
            onDeleteGoal={handleDeleteGoal}
            onBack={() => setActiveGoalId(null)}
          />
        ) : activeTab === 'focus' ? (
          <FocusTodayView
            goals={goalsWithBreakdown}
            onToggleTask={handleToggleTask}
            onSelectGoal={(goalId) => {
              setActiveGoalId(goalId);
              setActiveTab('goals');
            }}
          />
        ) : (
          /* Goals Overview Tab */
          <div className="px-4 py-4 pb-28 space-y-5">
            {/* Header Kicker */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                  Target Ambitions
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                  Your Big Goals
                </h1>
              </div>

              {/* In-App Add Button */}
              <button
                onClick={() => setIsNewGoalOpen(true)}
                className="h-9 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-800 inline-flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                New Goal
              </button>
            </div>

            {/* PWA Prompt Component */}
            <PWAInstallBanner />

            {/* Filter Segmented Control */}
            <div className="flex items-center p-1 bg-zinc-950 border border-zinc-900 rounded-xl">
              <button
                onClick={() => setGoalFilter('active')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors min-h-[36px] ${
                  goalFilter === 'active'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Active ({goalsWithBreakdown.filter((g) => !g.completed).length})
              </button>
              <button
                onClick={() => setGoalFilter('achieved')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors min-h-[36px] ${
                  goalFilter === 'achieved'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Achieved ({goalsWithBreakdown.filter((g) => g.completed).length})
              </button>
              <button
                onClick={() => setGoalFilter('all')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors min-h-[36px] ${
                  goalFilter === 'all'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                All ({goalsWithBreakdown.length})
              </button>
            </div>

            {/* Goals List */}
            {dataLoading ? (
              <div className="py-12 text-center text-xs text-zinc-500 font-mono">
                Syncing your goals from Firestore...
              </div>
            ) : filteredGoals.length === 0 ? (
              <div className="bg-zinc-950/60 border border-dashed border-zinc-900 rounded-3xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-zinc-900 text-zinc-500 flex items-center justify-center mx-auto">
                  <Target className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    {goalFilter === 'achieved' ? 'No achieved goals yet' : 'No active goals'}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                    {goalFilter === 'achieved'
                      ? 'Complete milestones and mark big goals as achieved to populate your victory log.'
                      : 'Set a major ambition, break it into pieces, and start achieving it.'}
                  </p>
                </div>
                {goalFilter !== 'achieved' && (
                  <button
                    onClick={() => setIsNewGoalOpen(true)}
                    className="min-h-[44px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-lg shadow-emerald-500/10 inline-flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    Create First Big Goal
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onSelect={(id) => setActiveGoalId(id)}
                    onToggleGoalAchieved={handleToggleGoalAchieved}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Ergonomic Navigation Bar */}
      {!activeGoal && (
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onOpenNewGoal={() => setIsNewGoalOpen(true)}
          totalActiveTasks={totalActiveTasks}
        />
      )}

      {/* Modal: New Goal Creation */}
      <NewGoalModal
        isOpen={isNewGoalOpen}
        onClose={() => setIsNewGoalOpen(false)}
        onSubmit={handleCreateGoal}
      />

      {/* Modal: Profile & Session Security */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        totalGoalsCount={rawGoals.length}
        totalTasksCount={rawTasks.length}
        completedTasksCount={rawTasks.filter((t) => t.completed).length}
      />

      {/* Offline Toast */}
      {!isOnline && (
        <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto flex items-center justify-between p-3 rounded-2xl bg-amber-950/90 border border-amber-800 text-amber-200 text-xs shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Offline Mode: Changes will sync once back online</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
