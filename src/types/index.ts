export interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  sessionStartedAt: number;
  sessionExpiresAt: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  targetDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  userId: string;
  title: string;
  order: number;
  completed: boolean;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  milestoneId: string;
  goalId: string;
  userId: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  order: number;
  createdAt: string;
}

export interface GoalWithBreakdown extends Goal {
  milestones: (Milestone & {
    tasks: TaskItem[];
    progress: number; // 0 to 100
  })[];
  totalTasksCount: number;
  completedTasksCount: number;
  overallProgress: number; // 0 to 100
}
