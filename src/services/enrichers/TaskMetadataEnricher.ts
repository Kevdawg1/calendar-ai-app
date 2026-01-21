import { ITaskMetadataEnricher } from '../interfaces/ITaskMetadataEnricher';
import { Task } from '../../types';
import { generateUUID } from '../../utils/uuid';

/**
 * Task metadata enricher
 * Follows Single Responsibility Principle - only enriches tasks with metadata
 */
export class TaskMetadataEnricher implements ITaskMetadataEnricher {
  enrichTasks(tasks: Task[]): Task[] {
    const now = new Date().toISOString();
    
    return tasks.map((task) => ({
      ...task,
      id: task.id || generateUUID(),
      status: task.status || 'pending',
      createdAt: task.createdAt || now,
      updatedAt: task.updatedAt || now,
    }));
  }
}

