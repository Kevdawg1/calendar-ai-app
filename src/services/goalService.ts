import { Goal } from '../types';
import { generateUUID } from '../utils/uuid';

// In a real application, this would be replaced with a database
let goals: Goal[] = [];

export const goalService = {
  getAllGoals: (): Goal[] => {
    return [...goals];
  },

  getGoal: (goalId: string): Goal | undefined => {
    return goals.find(goal => goal.id === goalId);
  },

  addGoal: (goalData: Omit<Goal, 'id' | 'createdAt'>): Goal => {
    const newGoal: Goal = {
      ...goalData,
      id: generateUUID(),
      createdAt: new Date().toISOString()
    };
    goals.push(newGoal);
    return newGoal;
  },

  updateGoal: (goalId: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>): Goal | undefined => {
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    if (goalIndex === -1) return undefined;

    const updatedGoal = {
      ...goals[goalIndex],
      ...updates
    };

    goals[goalIndex] = updatedGoal;
    return updatedGoal;
  },

  deleteGoal: (goalId: string): void => {
    goals = goals.filter(goal => goal.id !== goalId);
  }
}; 