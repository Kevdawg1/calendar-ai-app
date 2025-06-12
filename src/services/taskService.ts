import { Task, TaskUpdate } from '../types';
import { generateUUID } from '../utils/uuid';

// In a real application, this would be replaced with a database
let tasks: Task[] = [];

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

  updateTask: (taskId: string, updates: TaskUpdate): Task | undefined => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return undefined;

    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    tasks[taskIndex] = updatedTask;
    return updatedTask;
  },

  deleteTask: (taskId: string): void => {
    tasks = tasks.filter(task => task.id !== taskId);
  },

  addTasks: (newTasks: Task[]): Task[] => {
    const tasksWithIds = newTasks.map(task => ({
      ...task,
      id: generateUUID(),
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    tasks.push(...tasksWithIds);
    return tasksWithIds;
  }
}; 