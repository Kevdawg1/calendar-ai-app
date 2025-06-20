export type Task = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endTime: string;
  goalId: string;
  status: 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal';
    interval: number;
    endDate: string;
  };
};

export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>;

export type Goal = {
  id: string;
  text: string;
  type: 'personal' | 'professional' | 'health' | 'learning';
  priority: 'low' | 'medium' | 'high';
  timeCommitment: number;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type GoalUpdate = Partial<Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>>; 