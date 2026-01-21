import { IGoalTaskPromptBuilder } from '../interfaces/IPromptBuilder';
import { Goal, Task } from '../../types';
import { UserPreferences } from '../userPreferencesService';
import { PromptBuilder } from './PromptBuilder';

/**
 * Prompt builder for goal-based task generation
 * Follows Single Responsibility Principle - only builds goal-related prompts
 */
export class GoalTaskPromptBuilder extends PromptBuilder implements IGoalTaskPromptBuilder {
  buildComponentsPrompt(goals: Goal[], userPreferences?: UserPreferences): string {
    const basePrompt = `
      Analyze the following life goal and identify its key components:
      ${goals.map(goal => `
        - ${goal.text}
          Type: ${goal.type}
          Priority: ${goal.priority}
          Weekly Time: ${goal.timeCommitment} hours
      `).join('\n')}
      Return a JSON array of components, each with:
      - name: string (name of the component)
      - description: string (brief explanation of why this component is important)
      - priority: string (high/medium/low based on the goal's priority)
    `;

    return this.buildPrompt(basePrompt, userPreferences);
  }

  buildSubtasksPrompt(
    components: any[],
    goals: Goal[],
    userPreferences?: UserPreferences
  ): string {
    const goalDurationMonths = this.getGoalDurationMonths(goals[0].type);
    
    const basePrompt = `
      For each key component, generate specific subtasks over the ${goalDurationMonths} month period.
      Consider the weekly time commitment of ${goals[0].timeCommitment} hours.
      
      Goal Timeline:
      - Goal Type: ${goals[0].type} term
      - Duration: ${goalDurationMonths} months
      - Distribution: Spread tasks evenly across the timeline
      
      Components:
      ${JSON.stringify(components, null, 2)}
      
      For each subtask, provide:
      - title: string (specific action item)
      - description: string (reasoning for why this task is important)
      - estimatedDuration: number (in minutes)
      - priority: string (high/medium/low)
      - timeframe: string (specific month/quarter range within the ${goalDurationMonths} month period)
      
      IMPORTANT: Distribute subtasks across the entire ${goalDurationMonths} month timeline:
      - Short term (3 months): Spread across months 1, 2, 3
      - Medium term (12 months): Spread across quarters 1-4
      - Long term (60 months): Spread across years 1-5
      
      Return a JSON object with a "tasks" array. Each item in the array should have:
      - component: string (name of the component)
      - subtasks: array of subtask objects (each with title, description, estimatedDuration, priority, timeframe)
    `;

    return this.buildPrompt(basePrompt, userPreferences);
  }

  buildCalendarPrompt(
    subtasks: any[],
    goals: Goal[],
    existingTasks?: Task[],
    userPreferences?: UserPreferences
  ): string {
    const goalDurationMonths = this.getGoalDurationMonths(goals[0].type);
    const currentDate = new Date();
    const taskPeriodStart = new Date();
    const taskPeriodEnd = new Date();
    taskPeriodEnd.setMonth(taskPeriodStart.getMonth() + goalDurationMonths);

    const basePrompt = `
      Format the following subtasks into calendar-ready tasks:
      ${JSON.stringify(subtasks, null, 2)}
      Current date: ${currentDate.toISOString().split('T')[0]}
      
      Goal Timeline:
      - Goal Type: ${goals[0].type} term
      - Duration: ${goalDurationMonths} months (${taskPeriodStart.toISOString().split('T')[0]} to ${taskPeriodEnd.toISOString().split('T')[0]})
      - Weekly Time Commitment: ${goals[0].timeCommitment} hours
      
      For each task, provide a JSON object with:
      - title: string (clear, actionable task name)
      - description: string (brief explanation of what needs to be done)
      - startDate: string (YYYY-MM-DD, distribute across the ${goalDurationMonths} month period)
      - startTime: string (HH:MM, suggest appropriate time based on task type)
      - endTime: string (HH:MM)
      - recurrence: object (if task should repeat)
        - frequency: string (daily/weekly/monthly/seasonal)
        - interval: number (1 for daily/weekly/monthly, 3 for seasonal)
        - endDate: string (YYYY-MM-DD, use ${taskPeriodEnd.toISOString().split('T')[0]})
      - goalId: string (${goals[0].id})
      
      CRITICAL SCHEDULING REQUIREMENTS:
      1. DISTRIBUTE tasks evenly across the ${goalDurationMonths} month timeline
      2. Do NOT schedule all tasks on the same day or week
      3. Spread tasks throughout the goal duration period
      4. Consider the goal type:
         - Short term (1-3 months): Spread tasks across 3 months
         - Medium term (3-12 months): Spread tasks across 12 months  
         - Long term (1-5 years): Spread tasks across 5 years
      5. Respect the weekly time commitment of ${goals[0].timeCommitment} hours
      6. Group related tasks together when beneficial
      7. Account for task dependencies
      8. Schedule tasks between ${taskPeriodStart.toISOString().split('T')[0]} and ${taskPeriodEnd.toISOString().split('T')[0]}
      ${existingTasks ? 'Consider existing tasks and avoid scheduling conflicts.' : ''}
      
      Do not schedule tasks during work/study or sleep hours.
      Return ONLY a JSON array of these task objects.
    `;

    return this.buildPrompt(basePrompt, userPreferences);
  }

  private getGoalDurationMonths(goalType: 'short' | 'medium' | 'long'): number {
    switch (goalType) {
      case 'short':
        return 3;
      case 'medium':
        return 12;
      case 'long':
        return 60;
      default:
        return 12;
    }
  }
}

