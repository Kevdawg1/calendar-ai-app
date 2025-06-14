import { Task, TaskUpdate } from '../types';
import { generateUUID } from '../utils/uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_STORAGE_KEY = '@calendar_ai_tasks';

// Initialize tasks from storage
let tasks: Task[] = [];

// Load tasks from storage on service initialization
const loadTasks = async () => {
  try {
    const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    if (storedTasks) {
      tasks = JSON.parse(storedTasks);
    }
  } catch (error) {
    console.error('Error loading tasks from storage:', error);
  }
};

// Save tasks to storage
const saveTasks = async () => {
  try {
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to storage:', error);
  }
};

// Initialize tasks
loadTasks();

export const taskService = {
  getAllTasks: (): Task[] => {
    return [...tasks];
  },

  getTask: (taskId: string): Task | undefined => {
    return tasks.find(task => task.id === taskId);
  },

  getTasksByGoalId: (goalId: string): Task[] => {
    return tasks.filter(task => task.goalId === goalId);
  },

  updateTask: async (taskId: string, updates: TaskUpdate): Promise<Task | undefined> => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return undefined;

    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    tasks[taskIndex] = updatedTask;
    await saveTasks();
    return updatedTask;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    tasks = tasks.filter(task => task.id !== taskId);
    await saveTasks();
  },

  addTasks: async (newTasks: Task[]): Promise<Task[]> => {
    const tasksWithIds = newTasks.map(task => ({
      ...task,
      id: generateUUID(),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    tasks.push(...tasksWithIds);
    await saveTasks();
    return tasksWithIds;
  }
}; 