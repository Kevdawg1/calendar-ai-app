import axios from 'axios';
import { Task, Goal } from '../types';
import { UserPreferences } from './userPreferencesService';
import { getPromptWithPreferences, parseOpenAIResponse, validateTaskArray } from '../utils/promptUtils';
import { openaiConfig } from '../config/openai';
import { taskService } from './taskService';

export interface TaskDependency {
  taskId: string;
  dependsOn: string[];
  prerequisites: string[];
  blockingTasks: string[];
}

export interface ReschedulingContext {
  newTask?: Task;
  existingTasks: Task[];
  goals: Goal[];
  userPreferences: UserPreferences;
  currentDate: string;
}

export const taskReschedulingService = {
  /**
   * Reschedules tasks intelligently based on new task additions, priorities, and dependencies
   */
  rescheduleTasks: async (context: ReschedulingContext): Promise<Task[]> => {
    try {
      console.log('Starting intelligent task rescheduling:', context);

      const systemPrompt = getReschedulingSystemPrompt();
      const userPrompt = buildReschedulingPrompt(context);
      
      const response = await makeOpenAIRequest(systemPrompt, userPrompt);
      
      let rescheduledTasks;
      try {
        const parsedResponse = parseOpenAIResponse(response);
        rescheduledTasks = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.tasks;
        rescheduledTasks = validateTaskArray(rescheduledTasks, 'rescheduled tasks');
      } catch (error) {
        console.error('Error parsing rescheduling response:', error);
        throw new Error('Failed to parse rescheduling response');
      }

      console.log('Rescheduled tasks:', rescheduledTasks);
      return rescheduledTasks;

    } catch (error) {
      console.error('Error rescheduling tasks:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  },

  /**
   * Analyzes task dependencies and identifies logical relationships
   */
  analyzeDependencies: async (tasks: Task[], goals: Goal[]): Promise<TaskDependency[]> => {
    try {
      const systemPrompt = getDependencyAnalysisSystemPrompt();
      const userPrompt = buildDependencyAnalysisPrompt(tasks, goals);
      
      const response = await makeOpenAIRequest(systemPrompt, userPrompt);
      
      let dependencies;
      try {
        const parsedResponse = parseOpenAIResponse(response);
        dependencies = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.dependencies;
        dependencies = validateTaskArray(dependencies, 'dependencies');
      } catch (error) {
        console.error('Error parsing dependency analysis:', error);
        throw new Error('Failed to parse dependency analysis');
      }

      return dependencies;
    } catch (error) {
      console.error('Error analyzing dependencies:', error);
      throw error;
    }
  },

  /**
   * Identifies potential conflicts and suggests resolutions
   */
  identifyConflicts: async (tasks: Task[], userPreferences: UserPreferences): Promise<any[]> => {
    try {
      const systemPrompt = getConflictAnalysisSystemPrompt();
      const userPrompt = buildConflictAnalysisPrompt(tasks, userPreferences);
      
      const response = await makeOpenAIRequest(systemPrompt, userPrompt);
      
      let conflicts;
      try {
        const parsedResponse = parseOpenAIResponse(response);
        conflicts = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.conflicts;
        conflicts = validateTaskArray(conflicts, 'conflicts');
      } catch (error) {
        console.error('Error parsing conflict analysis:', error);
        throw new Error('Failed to parse conflict analysis');
      }

      return conflicts;
    } catch (error) {
      console.error('Error identifying conflicts:', error);
      throw error;
    }
  }
};

function getReschedulingSystemPrompt(): string {
  return `You are an intelligent task scheduling assistant that specializes in optimizing calendar schedules based on task priorities, dependencies, and user preferences. Your role is to:

1. **Analyze Task Dependencies**: Identify logical relationships between tasks, including prerequisites, blocking tasks, and sequential dependencies.

2. **Prioritize Based on Context**: Consider task urgency, importance, and how they relate to user goals and upcoming events.

3. **Respect User Preferences**: Honor wake/sleep times, work schedules, and personal scheduling preferences.

4. **Optimize for Success**: Ensure prerequisite tasks are completed before dependent tasks, and high-priority items get appropriate time slots.

5. **Maintain Balance**: Distribute tasks evenly across available time while respecting natural energy patterns and task complexity.

6. **Avoid Conflicts**: Prevent scheduling overlaps and ensure adequate buffer time between tasks.

7. **Consider Goal Alignment**: Ensure tasks align with user's short-term, medium-term, and long-term goals.

8. **Adapt to Changes**: When new tasks are added, intelligently reschedule existing tasks to accommodate them without disrupting critical dependencies.

**Key Principles:**
- Prerequisites must be completed before dependent tasks
- High-priority tasks get prime time slots
- Related tasks should be grouped together when possible
- Buffer time should be included for complex tasks
- Life admin tasks should be distributed to avoid overwhelming any single day
- Goal-related tasks should be scheduled to maintain consistent progress

**Output Format:**
Return a JSON array of rescheduled tasks with updated startDate, startTime, and endTime values. Each task should maintain its original properties but with optimized scheduling that respects all dependencies and preferences.`;
}

function buildReschedulingPrompt(context: ReschedulingContext): string {
  const { newTask, existingTasks, goals, userPreferences, currentDate } = context;
  
  let prompt = `Please reschedule the following tasks to optimize the calendar based on priorities, dependencies, and user preferences:

**Current Date:** ${currentDate}

**User Goals:**
${goals.map(goal => `
- ${goal.text} (${goal.type} term, ${goal.priority} priority, ${goal.timeCommitment} hours/week)
`).join('\n')}

**Existing Tasks:**
${existingTasks.map(task => `
- ${task.title}
  ID: ${task.id}
  Date: ${task.startDate} ${task.startTime || ''} - ${task.endTime || ''}
  Goal: ${task.goalId}
  Category: ${task.category || 'N/A'}
  Priority: ${task.priority || 'medium'}
  Description: ${task.description || 'N/A'}
`).join('\n')}`;

  if (newTask) {
    prompt += `

**New Task to Integrate:**
- ${newTask.title}
  Date: ${newTask.startDate} ${newTask.startTime || ''} - ${newTask.endTime || ''}
  Goal: ${newTask.goalId}
  Category: ${newTask.category || 'N/A'}
  Priority: ${newTask.priority || 'medium'}
  Description: ${newTask.description || 'N/A'}`;
  }

  prompt += `

**Rescheduling Requirements:**
1. Analyze task dependencies and ensure prerequisites are scheduled before dependent tasks
2. Prioritize high-priority tasks and goal-critical activities
3. Group related tasks together when beneficial
4. Distribute life admin tasks evenly across the week
5. Ensure adequate buffer time between tasks
6. Respect user's available time blocks and preferences
7. Maintain progress toward all active goals
8. Avoid scheduling conflicts and overlaps

**Return Format:**
Provide a JSON array of rescheduled tasks. Each task object should include:
- id: string (original task ID)
- title: string (original title)
- description: string (original description)
- startDate: string (YYYY-MM-DD, optimized date)
- startTime: string (HH:MM, optimized start time)
- endTime: string (HH:MM, optimized end time)
- goalId: string (original goal ID)
- category: string (original category)
- priority: string (original priority)
- recurrence: object (if applicable, maintain original recurrence settings)
- reschedulingReason: string (brief explanation of why this task was rescheduled)

Consider the logical flow of tasks and ensure the schedule supports successful completion of all goals.`;

  return getPromptWithPreferences(prompt, userPreferences);
}

function getDependencyAnalysisSystemPrompt(): string {
  return `You are a task dependency analyzer that identifies logical relationships between tasks. Your role is to:

1. **Identify Prerequisites**: Find tasks that must be completed before others
2. **Detect Blocking Tasks**: Identify tasks that prevent others from being started
3. **Find Sequential Dependencies**: Determine tasks that should be done in a specific order
4. **Recognize Goal Dependencies**: Understand how tasks relate to achieving specific goals
5. **Identify Resource Conflicts**: Find tasks that might compete for the same resources or time

**Analysis Criteria:**
- Task content and descriptions
- Goal relationships and time commitments
- Task categories and types
- Estimated durations and complexity
- User preferences and constraints

**Output Format:**
Return a JSON array of dependency objects, each containing:
- taskId: string (the task being analyzed)
- dependsOn: string[] (array of task IDs this task depends on)
- prerequisites: string[] (array of task IDs that must be completed first)
- blockingTasks: string[] (array of task IDs that this task blocks)

Focus on logical, practical dependencies that would realistically impact task completion.`;
}

function buildDependencyAnalysisPrompt(tasks: Task[], goals: Goal[]): string {
  return `Analyze the dependencies between the following tasks and goals:

**Goals:**
${goals.map(goal => `
- ${goal.text} (${goal.type} term, ${goal.priority} priority, ${goal.timeCommitment} hours/week)
`).join('\n')}

**Tasks:**
${tasks.map(task => `
- ${task.title}
  ID: ${task.id}
  Goal: ${task.goalId}
  Category: ${task.category || 'N/A'}
  Priority: ${task.priority || 'medium'}
  Description: ${task.description || 'N/A'}
  Duration: ${task.startTime && task.endTime ? 'specified' : 'not specified'}
`).join('\n')}

**Analysis Instructions:**
1. Identify tasks that logically depend on other tasks being completed first
2. Find tasks that are prerequisites for achieving specific goals
3. Detect tasks that might block or conflict with others
4. Consider the relationship between goal types (short/medium/long term) and task scheduling
5. Analyze how life admin tasks might support or conflict with goal-related tasks

Return a JSON array of dependency objects for each task.`;
}

function getConflictAnalysisSystemPrompt(): string {
  return `You are a scheduling conflict analyzer that identifies potential issues in task scheduling. Your role is to:

1. **Detect Time Overlaps**: Find tasks scheduled at the same time
2. **Identify Resource Conflicts**: Find tasks that might compete for the same resources
3. **Spot Energy Conflicts**: Identify tasks that might be too demanding when scheduled together
4. **Find Goal Conflicts**: Detect when tasks from different goals might interfere with each other
5. **Recognize Preference Violations**: Identify when scheduling doesn't match user preferences

**Conflict Types:**
- Time overlap (tasks scheduled simultaneously)
- Energy drain (too many demanding tasks in one day)
- Goal interference (tasks from different goals conflicting)
- Preference violation (scheduling outside preferred times)
- Resource competition (tasks requiring similar resources)

**Output Format:**
Return a JSON array of conflict objects, each containing:
- conflictType: string (type of conflict identified)
- affectedTasks: string[] (array of task IDs involved in the conflict)
- severity: string (high/medium/low)
- description: string (explanation of the conflict)
- suggestedResolution: string (recommended way to resolve the conflict)

Focus on practical conflicts that would realistically impact task completion or user satisfaction.`;
}

function buildConflictAnalysisPrompt(tasks: Task[], userPreferences: UserPreferences): string {
  return `Analyze the following tasks for potential scheduling conflicts:

**Tasks:**
${tasks.map(task => `
- ${task.title}
  ID: ${task.id}
  Date: ${task.startDate} ${task.startTime || ''} - ${task.endTime || ''}
  Goal: ${task.goalId}
  Category: ${task.category || 'N/A'}
  Priority: ${task.priority || 'medium'}
  Description: ${task.description || 'N/A'}
`).join('\n')}

**User Preferences:**
- Wake time: ${userPreferences.wakeUpTime ? userPreferences.wakeUpTime.toLocaleTimeString() : 'Not set'}
- Sleep time: ${userPreferences.sleepTime ? userPreferences.sleepTime.toLocaleTimeString() : 'Not set'}
- Work schedule: ${userPreferences.hasWorkSchedule ? 'Configured' : 'Not configured'}

**Analysis Instructions:**
1. Check for time overlaps between tasks
2. Identify days with too many high-priority or complex tasks
3. Look for tasks scheduled outside user's preferred hours
4. Detect potential energy drain from scheduling too many demanding tasks together
5. Find conflicts between goal-related tasks and life admin tasks
6. Identify scheduling patterns that might lead to burnout or inefficiency

Return a JSON array of conflict objects with detailed analysis and resolution suggestions.`;
}

async function makeOpenAIRequest(systemPrompt: string, userPrompt: string): Promise<string> {
  console.log('Making OpenAI request for task rescheduling');
  
  const response = await axios.post(
    `${openaiConfig.endpoint}/openai/deployments/${openaiConfig.deployment}/chat/completions?api-version=2024-02-15-preview`,
    {
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.3,
      response_format: { type: "json_object" }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'api-key': openaiConfig.apiKey
      }
    }
  );

  if (!response.data.choices?.[0]?.message?.content) {
    console.error('Invalid response format:', response.data);
    throw new Error('Invalid response format from OpenAI');
  }

  const content = response.data.choices[0].message.content;
  console.log('OpenAI response content:', content);
  return content;
} 