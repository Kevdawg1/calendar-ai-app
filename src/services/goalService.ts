import { Goal } from '../types';
import { generateUUID } from '../utils/uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOALS_KEY = '@calendar_ai_goals';

export const goalService = {
  getAllGoals: async (): Promise<Goal[]> => {
    const data = await AsyncStorage.getItem(GOALS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getGoal: async (goalId: string): Promise<Goal | undefined> => {
    const goals = await goalService.getAllGoals();
    return goals.find(goal => goal.id === goalId);
  },

  addGoal: async (goalData: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> => {
    const goals = await goalService.getAllGoals();
    const newGoal: Goal = {
      ...goalData,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };
    const updatedGoals = [...goals, newGoal];
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updatedGoals));
    return newGoal;
  },

  updateGoal: async (goalId: string, updates: Partial<Omit<Goal, 'id' | 'createdAt' | 'text'>>): Promise<Goal | undefined> => {
    const goals = await goalService.getAllGoals();
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    if (goalIndex === -1) return undefined;
    const updatedGoal = {
      ...goals[goalIndex],
      ...updates,
      text: goals[goalIndex].text, // Prevent title update
    };
    goals[goalIndex] = updatedGoal;
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    return updatedGoal;
  },

  deleteGoal: async (goalId: string): Promise<void> => {
    const goals = await goalService.getAllGoals();
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updatedGoals));
  },
}; 