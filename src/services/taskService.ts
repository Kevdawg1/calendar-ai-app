import { Task, TaskUpdate } from '../types';
import { generateUUID } from '../utils/uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_STORAGE_KEY = '@calendar_ai_tasks';

// Initialize tasks from storage
let tasks: Task[] = [];
let isInitialized = false;

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

// Load tasks from storage on service initialization
const loadTasks = async () => {
  try {
    await ensureAsyncStorageReady();
    const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    if (storedTasks) {
      tasks = JSON.parse(storedTasks);
    }
    isInitialized = true;
  } catch (error) {
    console.error('Error loading tasks from storage:', error);
    isInitialized = true; // Still mark as initialized even if there's an error
  }
};

// Save tasks to storage
const saveTasks = async () => {
  try {
    await ensureAsyncStorageReady();
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to storage:', error);
  }
};

// Initialize tasks
loadTasks();

export const taskService = {
  getAllTasks: async (): Promise<Task[]> => {
    if (!isInitialized) {
      await loadTasks();
    }
    return [...tasks];
  },

  getTask: async (taskId: string): Promise<Task | undefined> => {
    if (!isInitialized) {
      await loadTasks();
    }
    return tasks.find(task => task.id === taskId);
  },

  getTasksByGoalId: async (goalId: string): Promise<Task[]> => {
    if (!isInitialized) {
      await loadTasks();
    }
    return tasks.filter(task => task.goalId === goalId);
  },

  updateTask: async (taskId: string, updates: TaskUpdate): Promise<Task | undefined> => {
    if (!isInitialized) {
      await loadTasks();
    }
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
    if (!isInitialized) {
      await loadTasks();
    }
    tasks = tasks.filter(task => task.id !== taskId);
    await saveTasks();
  },

  addTasks: async (newTasks: Task[]): Promise<Task[]> => {
    if (!isInitialized) {
      await loadTasks();
    }
    
    // Filter out duplicates based on different criteria for different task types
    const uniqueNewTasks = newTasks.filter(newTask => {
      // For life admin tasks, check by title and goalId
      if (newTask.goalId === 'life-admin') {
        return !tasks.some(existingTask =>
          existingTask.title === newTask.title &&
          existingTask.goalId === 'life-admin'
        );
      }
      
      // For other tasks, check by title, startDate, and startTime
      return !tasks.some(existingTask =>
        existingTask.title === newTask.title &&
        existingTask.startDate === newTask.startDate &&
        existingTask.startTime === newTask.startTime
      );
    });
    
    const tasksWithIds = uniqueNewTasks.map(task => ({
      ...task,
      id: task.id || generateUUID(), // Use existing ID if provided, otherwise generate new one
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    tasks.push(...tasksWithIds);
    await saveTasks();
    return tasksWithIds;
  },

  updateTaskColors: async (goalId: string, color: string): Promise<void> => {
    if (!isInitialized) {
      await loadTasks();
    }
    tasks = tasks.map(task => {
      if (task.goalId === goalId) {
        return { ...task, color };
      }
      return task;
    });
    await saveTasks();
  },

  updateRecurringTask: async (taskId: string, updates: TaskUpdate): Promise<Task[]> => {
    if (!isInitialized) {
      await loadTasks();
    }
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.recurrence) return tasks;

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId || (
        t.recurrence &&
        t.title === task.title &&
        t.goalId === task.goalId &&
        t.startTime === task.startTime &&
        t.endTime === task.endTime &&
        new Date(t.startDate) >= new Date(task.startDate)
      )) {
        return {
          ...t,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    tasks = updatedTasks;
    await saveTasks();
    return updatedTasks;
  },

  clearAllTasks: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
      tasks = []; // Clear tasks in memory
      isInitialized = true; // Ensure service is marked as initialized
    } catch (error) {
      console.error('Error clearing tasks:', error);
      throw error;
    }
  },

  removeDuplicateLifeAdminTasks: async (): Promise<void> => {
    if (!isInitialized) {
      await loadTasks();
    }
    
    // Group life admin tasks by title
    const lifeAdminTasks = tasks.filter(task => task.goalId === 'life-admin');
    const tasksByTitle = lifeAdminTasks.reduce((acc, task) => {
      if (!acc[task.title]) {
        acc[task.title] = [];
      }
      acc[task.title].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
    
    // Remove duplicates, keeping only the first occurrence
    const tasksToRemove: string[] = [];
    Object.values(tasksByTitle).forEach(taskGroup => {
      if (taskGroup.length > 1) {
        // Keep the first task, remove the rest
        taskGroup.slice(1).forEach(task => {
          tasksToRemove.push(task.id);
        });
      }
    });
    
    // Remove duplicate tasks
    tasks = tasks.filter(task => !tasksToRemove.includes(task.id));
    await saveTasks();
    
    console.log(`Removed ${tasksToRemove.length} duplicate life admin tasks`);
  },
}; 