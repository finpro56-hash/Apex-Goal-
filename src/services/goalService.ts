import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { handleFirestoreError, OperationType } from '@/firebase/errors';
import { Goal, Milestone, TaskItem } from '@/types';

// Helper to generate URL-safe alphanumeric IDs conforming to rules regex ^[a-zA-Z0-9_\-]+$
export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'id_';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const goalService = {
  // Listen to all goals for this authenticated user
  subscribeGoals(userId: string, onUpdate: (goals: Goal[]) => void, onError?: (err: unknown) => void) {
    const q = query(collection(db, 'goals'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const goals: Goal[] = [];
        snapshot.forEach((doc) => {
          goals.push(doc.data() as Goal);
        });
        // Sort by creation date descending
        goals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(goals);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, 'goals');
      }
    );
  },

  // Listen to all milestones for this authenticated user
  subscribeMilestones(userId: string, onUpdate: (milestones: Milestone[]) => void, onError?: (err: unknown) => void) {
    const q = query(collection(db, 'milestones'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const milestones: Milestone[] = [];
        snapshot.forEach((doc) => {
          milestones.push(doc.data() as Milestone);
        });
        milestones.sort((a, b) => a.order - b.order);
        onUpdate(milestones);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, 'milestones');
      }
    );
  },

  // Listen to all tasks for this authenticated user
  subscribeTasks(userId: string, onUpdate: (tasks: TaskItem[]) => void, onError?: (err: unknown) => void) {
    const q = query(collection(db, 'tasks'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const tasks: TaskItem[] = [];
        snapshot.forEach((doc) => {
          tasks.push(doc.data() as TaskItem);
        });
        tasks.sort((a, b) => a.order - b.order);
        onUpdate(tasks);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, 'tasks');
      }
    );
  },

  // Create a new overarching goal
  async createGoal(
    userId: string,
    params: {
      title: string;
      description?: string;
      category?: string;
      targetDate?: string;
      initialMilestones?: { title: string; tasks: string[] }[];
    }
  ): Promise<string> {
    const goalId = generateId();
    const now = new Date().toISOString();

    const goalData: Goal = {
      id: goalId,
      userId,
      title: params.title.trim().slice(0, 200),
      description: (params.description || '').slice(0, 1000),
      category: (params.category || 'General').slice(0, 50),
      targetDate: params.targetDate || '',
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'goals', goalId), goalData);

      // If initial template breakdown is provided, insert them sequentially
      if (params.initialMilestones && params.initialMilestones.length > 0) {
        for (let mIdx = 0; mIdx < params.initialMilestones.length; mIdx++) {
          const mItem = params.initialMilestones[mIdx];
          const mId = generateId();
          const milestoneDoc: Milestone = {
            id: mId,
            goalId,
            userId,
            title: mItem.title.trim().slice(0, 200),
            order: mIdx + 1,
            completed: false,
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'milestones', mId), milestoneDoc);

          for (let tIdx = 0; tIdx < mItem.tasks.length; tIdx++) {
            const tTitle = mItem.tasks[tIdx];
            const tId = generateId();
            const taskDoc: TaskItem = {
              id: tId,
              goalId,
              milestoneId: mId,
              userId,
              title: tTitle.trim().slice(0, 200),
              completed: false,
              order: tIdx + 1,
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'tasks', tId), taskDoc);
          }
        }
      }

      return goalId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `goals/${goalId}`);
    }
  },

  // Update goal metadata
  async updateGoal(
    goalId: string,
    userId: string,
    updates: Partial<Pick<Goal, 'title' | 'description' | 'category' | 'targetDate' | 'completed'>>
  ): Promise<void> {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'goals', goalId), {
        ...updates,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `goals/${goalId}`);
    }
  },

  // Delete goal along with its milestones and tasks
  async deleteGoal(goalId: string, milestones: Milestone[], tasks: TaskItem[]): Promise<void> {
    try {
      // Delete tasks of this goal
      const goalTasks = tasks.filter((t) => t.goalId === goalId);
      for (const t of goalTasks) {
        await deleteDoc(doc(db, 'tasks', t.id));
      }

      // Delete milestones of this goal
      const goalMilestones = milestones.filter((m) => m.goalId === goalId);
      for (const m of goalMilestones) {
        await deleteDoc(doc(db, 'milestones', m.id));
      }

      // Delete goal
      await deleteDoc(doc(db, 'goals', goalId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `goals/${goalId}`);
    }
  },

  // Create milestone
  async createMilestone(userId: string, goalId: string, title: string, order: number): Promise<string> {
    const mId = generateId();
    const milestoneDoc: Milestone = {
      id: mId,
      goalId,
      userId,
      title: title.trim().slice(0, 200),
      order,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'milestones', mId), milestoneDoc);
      return mId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `milestones/${mId}`);
    }
  },

  // Update milestone
  async updateMilestone(milestoneId: string, updates: Partial<Pick<Milestone, 'title' | 'completed' | 'order'>>): Promise<void> {
    try {
      await updateDoc(doc(db, 'milestones', milestoneId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `milestones/${milestoneId}`);
    }
  },

  // Delete milestone and its tasks
  async deleteMilestone(milestoneId: string, tasks: TaskItem[]): Promise<void> {
    try {
      const mTasks = tasks.filter((t) => t.milestoneId === milestoneId);
      for (const t of mTasks) {
        await deleteDoc(doc(db, 'tasks', t.id));
      }
      await deleteDoc(doc(db, 'milestones', milestoneId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `milestones/${milestoneId}`);
    }
  },

  // Create actionable task
  async createTask(userId: string, goalId: string, milestoneId: string, title: string, order: number): Promise<string> {
    const taskId = generateId();
    const taskDoc: TaskItem = {
      id: taskId,
      goalId,
      milestoneId,
      userId,
      title: title.trim().slice(0, 200),
      completed: false,
      order,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'tasks', taskId), taskDoc);
      return taskId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `tasks/${taskId}`);
    }
  },

  // Toggle task completed
  async toggleTask(task: TaskItem): Promise<boolean> {
    const nextCompleted = !task.completed;
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : null,
      });
      return nextCompleted;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${task.id}`);
    }
  },

  // Delete individual task
  async deleteTask(taskId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
    }
  }
};
