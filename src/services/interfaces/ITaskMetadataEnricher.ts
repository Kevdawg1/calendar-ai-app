import { Task } from '../../types';

/**
 * Interface for enriching tasks with metadata
 * Follows Single Responsibility Principle
 */
export interface ITaskMetadataEnricher {
  /**
   * Add metadata to tasks (id, status, timestamps)
   */
  enrichTasks(tasks: Task[]): Task[];
}

