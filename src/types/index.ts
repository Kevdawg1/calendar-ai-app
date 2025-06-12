export interface Goal {
  id: string;
  text: string;
  type: 'short' | 'medium' | 'long';
  priority: 'low' | 'medium' | 'high';
  timeCommitment: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  duration: number;
  startDate: string;
  startTime: string;
  endTime: string;
  goalId: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  duration?: number;
  startDate?: string;
  startTime?: string;
  endTime?: string;
  status?: 'pending' | 'completed' | 'cancelled';
} 