import { UserPreferences } from '../userPreferencesService';
import { Goal, Task } from '../../types';

/**
 * Interface for prompt builders
 * Follows Interface Segregation Principle - focused interface
 */
export interface IPromptBuilder {
  buildPrompt(basePrompt: string, userPreferences?: UserPreferences): string;
}

/**
 * Interface for goal-based task prompt builders
 */
export interface IGoalTaskPromptBuilder {
  buildComponentsPrompt(goals: Goal[], userPreferences?: UserPreferences): string;
  buildSubtasksPrompt(
    components: any[],
    goals: Goal[],
    userPreferences?: UserPreferences
  ): string;
  buildCalendarPrompt(
    subtasks: any[],
    goals: Goal[],
    existingTasks?: Task[],
    userPreferences?: UserPreferences
  ): string;
}

