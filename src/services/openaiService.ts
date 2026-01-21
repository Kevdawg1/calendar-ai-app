import { Goal, Task } from '../types';
import { UserPreferences } from './userPreferencesService';
import { IAIClient } from './interfaces/IAIClient';
import { IResponseParser } from './interfaces/IResponseParser';
import { ITaskMetadataEnricher } from './interfaces/ITaskMetadataEnricher';
import { IGoalTaskPromptBuilder } from './interfaces/IPromptBuilder';
import { ServiceFactory } from './factories/ServiceFactory';
import { GoalTaskPromptBuilder } from './builders/GoalTaskPromptBuilder';
import { SubtaskParser } from './parsers/SubtaskParser';

/**
 * OpenAI Service - Refactored to follow SOLID principles
 * 
 * Single Responsibility: Only orchestrates task generation workflow
 * Open/Closed: Can be extended with different AI clients or prompt builders
 * Liskov Substitution: Uses interfaces that can be substituted
 * Interface Segregation: Uses focused interfaces
 * Dependency Inversion: Depends on abstractions, not concrete implementations
 */
export class OpenAIService {
  private aiClient: IAIClient;
  private responseParser: IResponseParser;
  private taskMetadataEnricher: ITaskMetadataEnricher;
  private promptBuilder: IGoalTaskPromptBuilder;
  private subtaskParser: SubtaskParser;

  constructor(
    aiClient?: IAIClient,
    responseParser?: IResponseParser,
    taskMetadataEnricher?: ITaskMetadataEnricher,
    promptBuilder?: IGoalTaskPromptBuilder
  ) {
    // Dependency Injection with fallback to factory
    this.aiClient = aiClient || ServiceFactory.getAIClient();
    this.responseParser = responseParser || ServiceFactory.getResponseParser();
    this.taskMetadataEnricher = taskMetadataEnricher || ServiceFactory.getTaskMetadataEnricher();
    this.promptBuilder = promptBuilder || new GoalTaskPromptBuilder();
    this.subtaskParser = new SubtaskParser(this.responseParser);
  }

  async generateTasks(
    goals: Goal[],
    existingTasks?: Task[],
    userPreferences?: UserPreferences
  ): Promise<Task[]> {
    try {
      console.log('Starting task generation for goals:', goals);

      // Step 1: Identify key components
      const componentsPrompt = this.promptBuilder.buildComponentsPrompt(goals, userPreferences);
      console.log('Step 1: Sending components prompt');
      
      const componentsResponse = await this.aiClient.makeRequest(
        'You are an AI assistant helping to break down life goals into actionable tasks. Provide clear, specific, and well-reasoned responses. Always return valid JSON.',
        componentsPrompt,
        { maxTokens: 2000, temperature: 0.7 }
      );
      
      console.log('Step 1: Received components response:', componentsResponse);
      
      let components;
      try {
        const parsedResponse = this.responseParser.parse(componentsResponse);
        components = this.responseParser.extractArray(parsedResponse, 'components');
        components = this.responseParser.validateTaskArray(components, 'components');
      } catch (error) {
        console.error('Error parsing components:', error);
        throw new Error('Failed to parse components response');
      }

      // Step 2: Generate subtasks for each component
      const subtasksPrompt = this.promptBuilder.buildSubtasksPrompt(components, goals, userPreferences);
      console.log('Step 2: Sending subtasks prompt');
      
      const subtasksResponse = await this.aiClient.makeRequest(
        'You are an AI assistant helping to break down life goals into actionable tasks. Provide clear, specific, and well-reasoned responses. Always return valid JSON.',
        subtasksPrompt,
        { maxTokens: 2000, temperature: 0.7 }
      );
      
      console.log('Step 2: Received subtasks response:', subtasksResponse);

      let subtasksByComponent;
      try {
        subtasksByComponent = this.subtaskParser.parseSubtasks(subtasksResponse);
        subtasksByComponent = this.responseParser.validateTaskArray(subtasksByComponent, 'subtasks');
      } catch (error) {
        console.error('Error parsing subtasks:', error);
        throw new Error('Failed to parse subtasks response');
      }

      // Step 3: Format tasks for calendar
      const calendarPrompt = this.promptBuilder.buildCalendarPrompt(
        subtasksByComponent,
        goals,
        existingTasks,
        userPreferences
      );
      
      console.log('Step 3: Sending calendar prompt');
      
      const calendarResponse = await this.aiClient.makeRequest(
        'You are an AI assistant helping to break down life goals into actionable tasks. Provide clear, specific, and well-reasoned responses. Always return valid JSON.',
        calendarPrompt,
        { maxTokens: 5000, temperature: 0.7 }
      );
      
      console.log('Step 3: Received calendar response:', calendarResponse);

      let tasks;
      try {
        const parsedResponse = this.responseParser.parse(calendarResponse);
        tasks = this.responseParser.extractArray(parsedResponse, 'tasks');
        tasks = this.responseParser.validateTaskArray(tasks, 'tasks');
      } catch (error) {
        console.error('Error parsing tasks:', error);
        throw new Error('Failed to parse tasks response');
      }

      // Add metadata to tasks
      const tasksWithMetadata = this.taskMetadataEnricher.enrichTasks(tasks);

      console.log('Final tasks generated:', tasksWithMetadata);
      return tasksWithMetadata;

    } catch (error) {
      console.error('Error generating tasks:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }
}

// Export singleton instance for backward compatibility
export const openaiService = new OpenAIService(); 