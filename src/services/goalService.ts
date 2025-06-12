import { Goal } from '../types';
import { generateUUID } from '../utils/uuid';

// In a real application, this would be replaced with a database
let goals: Goal[] = [];

export const goalService = {
  getAllGoals: (): Goal[] => {
    return [...goals];
  },

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>): Goal => {
    const newGoal: Goal = {
      ...goal,
      id: generateUUID(),
      createdAt: new Date().toISOString()
    };
    goals.push(newGoal);
    return newGoal;
  },

  updateGoal: (goalId: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>): Goal => {
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    const updatedGoal = {
      ...goals[goalIndex],
      ...updates
    };

    goals[goalIndex] = updatedGoal;
    return updatedGoal;
  },

  deleteGoal: (goalId: string): void => {
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    goals.splice(goalIndex, 1);
  }
}; 