export interface Goal {
  id: string;
  text: string;
  type: 'short' | 'medium' | 'long';
  priority: 'low' | 'medium' | 'high';
  timeCommitment: number;
  createdAt: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  startTime?: string;
  endTime?: string;
  goalId: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  category?: 'household' | 'laundry' | 'meal' | 'personal' | 'admin' | 'maintenance' | 'outdoor' | 'pet';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  enabled?: boolean;
  priority?: 'low' | 'medium' | 'high';
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'none';
    interval: number;
    endDate: string;
  };
  recurringGroupId?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  startDate?: string;
  startTime?: string;
  endTime?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'none';
    interval: number;
    endDate: string;
  };
  recurringGroupId?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  type: 'work' | 'personal' | 'social' | 'health' | 'education' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'completed' | 'cancelled';
  goalId?: string;
  createdAt: string;
  updatedAt: string;
  sentiment?: {
    positive: number;
    negative: number;
    neutral: number;
    keywords: string[];
  };
  relatedTaskIds?: string[];
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'none';
    interval: number;
    endDate: string;
  };
}

export interface MeetingUpdate {
  title?: string;
  description?: string;
  startDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  attendees?: string[];
  type?: 'work' | 'personal' | 'social' | 'health' | 'education' | 'other';
  priority?: 'low' | 'medium' | 'high';
  status?: 'scheduled' | 'completed' | 'cancelled';
  goalId?: string;
  sentiment?: {
    positive: number;
    negative: number;
    neutral: number;
    keywords: string[];
  };
  relatedTaskIds?: string[];
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'none';
    interval: number;
    endDate: string;
  };
} 