import { Task, TaskUpdate } from '../types';
import { generateUUID } from '../utils/uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';
import { taskReschedulingService, ReschedulingContext } from './taskReschedulingService';
import { goalService } from './goalService';
import { userPreferencesService } from './userPreferencesService';

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

// Helper function to generate recurring task instances
const generateRecurringTasks = (task: Task): Task[] => {
  console.log('Generating recurring tasks for task:', task);
  console.log('Task recurrence:', task.recurrence);
  console.log('Task startDate:', task.startDate);
  console.log('Task endDate:', task.recurrence?.endDate);
  
  if (!task.recurrence || task.recurrence.frequency === 'none') {
    console.log('No recurrence or frequency is none, returning empty array');
    return [];
  }

  const recurringTasks: Task[] = [];
  const startDate = new Date(task.startDate);
  const endDate = new Date(task.recurrence.endDate);
  let currentDate = new Date(startDate);
  const recurringGroupId = task.recurringGroupId || task.id; // Use existing group ID or task ID as group ID

  console.log('Start date:', startDate);
  console.log('End date:', endDate);
  console.log('Recurring group ID:', recurringGroupId);

  // Check if end date is after start date
  if (endDate <= startDate) {
    console.log('End date is not after start date, returning empty array');
    return [];
  }

  // Start from the next occurrence (skip the original task date)
  switch (task.recurrence.frequency) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + task.recurrence.interval);
      break;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + (7 * task.recurrence.interval));
      break;
    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + task.recurrence.interval);
      break;
    case 'seasonal':
      currentDate.setMonth(currentDate.getMonth() + (3 * task.recurrence.interval));
      break;
    default:
      currentDate.setDate(currentDate.getDate() + 1);
  }
  console.log('Initial current date (after skipping original):', currentDate);
  console.log('Current date <= end date?', currentDate <= endDate);

  let taskCount = 0;
  while (currentDate <= endDate) {
    const newTask: Task = {
      ...task,
      id: generateUUID(), // Each recurring task gets its own unique ID
      startDate: currentDate.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recurringGroupId: recurringGroupId, // Share the same group ID
    };
    recurringTasks.push(newTask);
    taskCount++;

    console.log(`Created recurring task ${taskCount}:`, newTask.startDate);

    // Move to next occurrence based on frequency
    switch (task.recurrence.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + task.recurrence.interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * task.recurrence.interval));
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + task.recurrence.interval);
        break;
      case 'seasonal':
        currentDate.setMonth(currentDate.getMonth() + (3 * task.recurrence.interval));
        break;
      default:
        currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  console.log(`Generated ${recurringTasks.length} recurring tasks`);
  return recurringTasks;
};

// Helper function to get the next interval based on frequency
const getNextInterval = (frequency: string, interval: number): number => {
  switch (frequency) {
    case 'daily':
      return interval; // For daily, start from the next day
    case 'weekly':
      return interval * 7; // For weekly, start from the next week
    case 'monthly':
      return interval * 30; // For monthly, start from the next month (approximate)
    case 'seasonal':
      return interval * 90; // For seasonal, start from the next season (approximate)
    default:
      return 1;
  }
};

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

  addTask: async (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const taskWithMetadata = {
      ...newTask,
      id: generateUUID(),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const tasks = await taskService.addTasks([taskWithMetadata]);
    return tasks[0];
  },

  addTasks: async (newTasks: Task[]): Promise<Task[]> => {
    if (!isInitialized) {
      await loadTasks();
    }
    
    console.log('Adding tasks:', newTasks);
    console.log('Tasks with recurrence:', newTasks.filter(task => task.recurrence));
    
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
    
    console.log('Unique new tasks:', uniqueNewTasks);
    
    const tasksWithIds = uniqueNewTasks.map(task => {
      const taskWithId = {
        ...task,
        id: task.id || generateUUID(), // Use existing ID if provided, otherwise generate new one
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Set recurringGroupId for tasks with recurrence
      if (task.recurrence) {
        taskWithId.recurringGroupId = taskWithId.id;
        console.log('Set recurringGroupId for task:', taskWithId.id);
      }

      return taskWithId;
    });

    console.log('Tasks with IDs:', tasksWithIds);
    console.log('Tasks with recurrence after ID assignment:', tasksWithIds.filter(task => task.recurrence));

    // Add the original tasks
    tasks.push(...tasksWithIds);
    
    // Generate recurring tasks for tasks with recurrence
    const allRecurringTasks: Task[] = [];
    tasksWithIds.forEach(task => {
      if (task.recurrence) {
        console.log('Generating recurring tasks for:', task.title);
        const recurringTasks = generateRecurringTasks(task);
        console.log('Generated recurring tasks:', recurringTasks.length);
        allRecurringTasks.push(...recurringTasks);
      }
    });
    
    // Add the recurring tasks
    if (allRecurringTasks.length > 0) {
      tasks.push(...allRecurringTasks);
      console.log(`Generated ${allRecurringTasks.length} recurring tasks`);
    } else {
      console.log('No recurring tasks were generated');
    }
    
    await saveTasks();

    // Schedule notifications for all new tasks
    const allNewTasks = [...tasksWithIds, ...allRecurringTasks];
    for (const task of allNewTasks) {
      if (task.startTime) {
        try {
          await notificationService.scheduleTaskNotification(task);
        } catch (error) {
          console.error('Error scheduling notification for task:', task.id, error);
        }
      }
    }

    return [...tasksWithIds, ...allRecurringTasks];
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

    // Find all tasks that belong to the same recurring group
    const recurringGroupId = task.recurringGroupId || task.id;
    const recurringGroupTasks = tasks.filter(t => t.recurringGroupId === recurringGroupId);
    
    // Sort tasks by start date to maintain order
    recurringGroupTasks.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    // Find the original task's position in the sequence
    const originalTaskIndex = recurringGroupTasks.findIndex(t => t.id === taskId);
    if (originalTaskIndex === -1) return tasks;

    // Calculate the new start date if it's being updated
    const newStartDate = updates.startDate ? new Date(updates.startDate) : new Date(task.startDate);
    const originalStartDate = new Date(task.startDate);
    
    // Calculate the offset from the original start date
    const dateOffset = newStartDate.getTime() - originalStartDate.getTime();

    const updatedTasks = tasks.map(t => {
      if (t.recurringGroupId === recurringGroupId && new Date(t.startDate) >= new Date(task.startDate)) {
        // Find this task's position in the sequence
        const taskIndex = recurringGroupTasks.findIndex(rt => rt.id === t.id);
        if (taskIndex === -1) return t;

        // Calculate the new start date for this task
        let newTaskStartDate = new Date(t.startDate);
        if (updates.startDate && t.recurrence) {
          // Calculate the relative position from the original task
          const relativePosition = taskIndex - originalTaskIndex;
          
          // Apply the same offset plus the frequency spacing
          newTaskStartDate = new Date(originalStartDate.getTime() + dateOffset);
          
          // Add the frequency spacing based on the relative position
          switch (t.recurrence.frequency) {
            case 'daily':
              newTaskStartDate.setDate(newTaskStartDate.getDate() + (relativePosition * t.recurrence.interval));
              break;
            case 'weekly':
              newTaskStartDate.setDate(newTaskStartDate.getDate() + (relativePosition * 7 * t.recurrence.interval));
              break;
            case 'monthly':
              newTaskStartDate.setMonth(newTaskStartDate.getMonth() + (relativePosition * t.recurrence.interval));
              break;
            case 'seasonal':
              newTaskStartDate.setMonth(newTaskStartDate.getMonth() + (relativePosition * 3 * t.recurrence.interval));
              break;
          }
        }

        return {
          ...t,
          ...updates,
          startDate: newTaskStartDate.toISOString().split('T')[0], // Update with calculated date
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    tasks = updatedTasks;
    await saveTasks();
    return updatedTasks;
  },

  updateTaskRecurrence: async (taskId: string, updates: TaskUpdate): Promise<Task[]> => {
    if (!isInitialized) {
      await loadTasks();
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return tasks;

    // If recurrence is being added or changed, generate recurring instances
    if (updates.recurrence && (!task.recurrence || 
        task.recurrence.frequency !== updates.recurrence.frequency ||
        task.recurrence.interval !== updates.recurrence.interval ||
        task.recurrence.endDate !== updates.recurrence.endDate)) {
      
      // Remove existing recurring instances of this task
      const recurringGroupId = task.recurringGroupId || task.id;
      tasks = tasks.filter(t => t.recurringGroupId !== recurringGroupId || t.id === taskId);

      // Update the original task
      const updatedTask = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
        recurringGroupId: task.id, // Set the group ID to the original task's ID
      };
      
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = updatedTask;
      }

      // Generate new recurring instances
      const newRecurringTasks = generateRecurringTasks(updatedTask);
      console.log('newRecurringTasks', newRecurringTasks);
      tasks.push(...newRecurringTasks);
      
    } else {
      // Regular update without recurrence change
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    await saveTasks();
    return [...tasks];
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

  updateSingleOccurrence: async (taskId: string, updates: TaskUpdate): Promise<Task[]> => {
    if (!isInitialized) {
      await loadTasks();
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return tasks;

    // If this is a recurring task, create a new single task and remove this occurrence from the series
    if (task.recurrence) {
      // Create a new task with the updates but without recurrence
      const newTask: Task = {
        ...task,
        ...updates,
        id: generateUUID(),
        recurrence: undefined, // Remove recurrence
        recurringGroupId: undefined, // Remove from recurring group
        updatedAt: new Date().toISOString(),
      };

      // Remove only this specific occurrence from the recurring series
      tasks = tasks.filter(t => t.id !== taskId);

      // Add the new single task
      tasks.push(newTask);
    } else {
      // Regular single task update
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    await saveTasks();
    return [...tasks];
  },

  deleteSingleOccurrence: async (taskId: string): Promise<Task[]> => {
    if (!isInitialized) {
      await loadTasks();
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return tasks;

    // Remove the specific task
    tasks = tasks.filter(t => t.id !== taskId);
    await saveTasks();
    return [...tasks];
  },

  deleteAllRecurringOccurrences: async (taskId: string): Promise<Task[]> => {
    if (!isInitialized) {
      await loadTasks();
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.recurrence) return tasks;

    // Remove all tasks that belong to the same recurring group
    const recurringGroupId = task.recurringGroupId || task.id;
    tasks = tasks.filter(t => t.recurringGroupId !== recurringGroupId);

    await saveTasks();
    return [...tasks];
  },

  /**
   * Add a new task and intelligently reschedule existing tasks
   */
  addTaskWithRescheduling: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      console.log('Adding task with intelligent rescheduling:', task);

      // Add the new task first
      const newTask = await taskService.addTask(task);

      // Get all tasks including the new one
      const allTasks = await taskService.getAllTasks();
      
      // Get user goals and preferences for rescheduling context
      const goals = await goalService.getAllGoals();
      const userPreferences = await userPreferencesService.getPreferences();

      if (!userPreferences) {
        console.warn('No user preferences found, skipping rescheduling');
        return newTask;
      }

      // Create rescheduling context
      const context: ReschedulingContext = {
        newTask: newTask,
        existingTasks: allTasks,
        goals: goals,
        userPreferences: userPreferences,
        currentDate: new Date().toISOString().split('T')[0]
      };

      // Perform intelligent rescheduling
      const rescheduledTasks = await taskReschedulingService.rescheduleTasks(context);

      // Update existing tasks with new scheduling
      for (const rescheduledTask of rescheduledTasks) {
        if (rescheduledTask.id !== newTask.id) { // Don't update the new task
          await taskService.updateTask(rescheduledTask.id, {
            startDate: rescheduledTask.startDate,
            startTime: rescheduledTask.startTime,
            endTime: rescheduledTask.endTime
          });
        }
      }

      console.log('Task rescheduling completed successfully');
      return newTask;

    } catch (error) {
      console.error('Error adding task with rescheduling:', error);
      // Fall back to regular task addition if rescheduling fails
      return await taskService.addTask(task);
    }
  },

  /**
   * Trigger rescheduling for all tasks (useful for periodic optimization)
   */
  optimizeSchedule: async (): Promise<void> => {
    try {
      console.log('Starting schedule optimization');

      const allTasks = await taskService.getAllTasks();
      const goals = await goalService.getAllGoals();
      const userPreferences = await userPreferencesService.getPreferences();

      if (!userPreferences) {
        console.warn('No user preferences found, skipping optimization');
        return;
      }

      // Create rescheduling context without a new task
      const context: ReschedulingContext = {
        existingTasks: allTasks,
        goals: goals,
        userPreferences: userPreferences,
        currentDate: new Date().toISOString().split('T')[0]
      };

      // Perform intelligent rescheduling
      const rescheduledTasks = await taskReschedulingService.rescheduleTasks(context);

      // Update all tasks with optimized scheduling
      for (const rescheduledTask of rescheduledTasks) {
        await taskService.updateTask(rescheduledTask.id, {
          startDate: rescheduledTask.startDate,
          startTime: rescheduledTask.startTime,
          endTime: rescheduledTask.endTime
        });
      }

      console.log('Schedule optimization completed successfully');

    } catch (error) {
      console.error('Error optimizing schedule:', error);
      throw error;
    }
  },

  /**
   * Analyze task dependencies and conflicts
   */
  analyzeTaskDependencies: async (): Promise<any> => {
    try {
      console.log('Analyzing task dependencies');

      const allTasks = await taskService.getAllTasks();
      const goals = await goalService.getAllGoals();
      const userPreferences = await userPreferencesService.getPreferences();

      if (!userPreferences) {
        console.warn('No user preferences found, skipping dependency analysis');
        return { dependencies: [], conflicts: [] };
      }

      // Analyze dependencies
      const dependencies = await taskReschedulingService.analyzeDependencies(allTasks, goals);
      
      // Identify conflicts
      const conflicts = await taskReschedulingService.identifyConflicts(allTasks, userPreferences);

      return {
        dependencies,
        conflicts,
        analysisDate: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error analyzing task dependencies:', error);
      throw error;
    }
  }
}; 