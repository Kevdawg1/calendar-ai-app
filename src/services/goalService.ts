import { Goal } from '../types';
import { generateUUID } from '../utils/uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOALS_KEY = '@calendar_ai_goals';

// Helper function to ensure AsyncStorage is ready
const ensureAsyncStorageReady = async (): Promise<void> => {
  try {
    // Test AsyncStorage with a simple operation
    await AsyncStorage.setItem('@test_key', 'test_value');
    await AsyncStorage.removeItem('@test_key');
  } catch (error) {
    console.warn('AsyncStorage not ready, waiting...');
    // Wait a bit and try again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

export const goalService = {
  getAllGoals: async (): Promise<Goal[]> => {
    try {
      await ensureAsyncStorageReady();
      const data = await AsyncStorage.getItem(GOALS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all goals:', error);
      return [];
    }
  },

  getGoal: async (goalId: string): Promise<Goal | undefined> => {
    try {
      const goals = await goalService.getAllGoals();
      return goals.find(goal => goal.id === goalId);
    } catch (error) {
      console.error('Error getting goal:', error);
      return undefined;
    }
  },

  addGoal: async (goalData: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> => {
    try {
      await ensureAsyncStorageReady();
      const goals = await goalService.getAllGoals();
      const newGoal: Goal = {
        ...goalData,
        id: generateUUID(),
        createdAt: new Date().toISOString(),
      };
      const updatedGoals = [...goals, newGoal];
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updatedGoals));
      return newGoal;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  },

  updateGoal: async (goalId: string, updates: Partial<Omit<Goal, 'id' | 'createdAt' | 'text'>>): Promise<Goal | undefined> => {
    try {
      await ensureAsyncStorageReady();
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
    } catch (error) {
      console.error('Error updating goal:', error);
      return undefined;
    }
  },

  deleteGoal: async (goalId: string): Promise<void> => {
    try {
      await ensureAsyncStorageReady();
      const goals = await goalService.getAllGoals();
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },
}; 