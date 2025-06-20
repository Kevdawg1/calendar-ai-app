import axios from 'axios';
import { LifeAdminTask } from '../data/lifeAdminTasks';
import { Task } from '../types';
import { generateUUID } from '../utils/uuid';
import { UserPreferences } from './userPreferencesService';
import { getPromptWithPreferences, parseOpenAIResponse, validateTaskArray } from '../utils/promptUtils';
import { openaiConfig } from '../config/openai';
import { taskService } from './taskService';

export const lifeAdminService = {
  scheduleTasks: async (tasks: LifeAdminTask[], userPreferences?: UserPreferences): Promise<Task[]> => {
    try {
      console.log('Starting task scheduling for life admin tasks:', tasks);

      // Get current date and format it as YYYY-MM-DD
      const currentDate = new Date();
      const startDate = currentDate.toISOString().split('T')[0];
      
      // Calculate end date (1 year from now)
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      const endDateStr = endDate.toISOString().split('T')[0];

      // Get existing tasks to check for duplicates
      const existingTasks = await taskService.getAllTasks();
      const existingLifeAdminTasks = existingTasks.filter(task => task.goalId === 'life-admin');

      // Group tasks by category
      const tasksByCategory = tasks.reduce((acc, task) => {
        if (!acc[task.category]) {
          acc[task.category] = [];
        }
        acc[task.category].push(task);
        return acc;
      }, {} as Record<string, LifeAdminTask[]>);

      // Schedule tasks for each category separately
      const allScheduledTasks: Task[] = [];
      
      for (const [category, categoryTasks] of Object.entries(tasksByCategory)) {
        console.log(`Scheduling tasks for category: ${category}`);
        
        const prompt = getPromptWithPreferences(`
        Schedule the following life admin tasks into a calendar:
        ${categoryTasks.map(task => `
          - ${task.title}
            Category: ${task.category}
            Frequency: ${task.frequency}
        `).join('\n')}
        For each task, create a recurring calendar event with the following rules:
        - Daily tasks: Repeat every day (interval: 1)
        - Weekly tasks: Repeat every week (interval: 1)
        - Monthly tasks: Repeat every month (interval: 1)
        - Seasonal tasks: Repeat every 3 months (interval: 3)

        For each task, provide a JSON object with:
        - title: string (from task)
        - description: string (include category and frequency)
        - startDate: string (YYYY-MM-DD, use ${startDate})
        - startTime: string (HH:MM, suggest appropriate time based on task type)
        - endTime: string (HH:MM)
        - recurrence: object
          - frequency: string (daily/weekly/monthly/seasonal)
          - interval: number (1 for daily/weekly/monthly, 3 for seasonal)
          - endDate: string (YYYY-MM-DD, use ${endDateStr})

        Consider:
        - Group similar tasks together
        - Schedule tasks at appropriate times (e.g., morning for personal care, evening for cleaning)
        - Allow buffer time between tasks
        - Consider task dependencies
        - Spread tasks across the week/month to avoid clustering
        - For ${category} tasks, consider typical times for these activities
        Do not schedule tasks during work/study or sleep hours.

        Return ONLY a JSON array of these task objects.
        `, userPreferences);

        console.log('Sending scheduling prompt for category:', category);
        const response = await makeOpenAIRequest(prompt);
        console.log('Received scheduling response for category:', category);

        let scheduledTasks;
        try {
          const parsedResponse = parseOpenAIResponse(response);
          scheduledTasks = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.tasks;
          scheduledTasks = validateTaskArray(scheduledTasks, 'tasks');

          // Validate and fix recurrence settings
          scheduledTasks = scheduledTasks.map((task: any) => {
            // Ensure recurrence object exists
            if (!task.recurrence) {
              task.recurrence = {
                frequency: 'daily',
                interval: 1,
                endDate: endDateStr
              };
            }

            // Ensure proper interval based on frequency
            if (task.recurrence.frequency === 'seasonal') {
              task.recurrence.interval = 3;
            } else {
              task.recurrence.interval = 1;
            }

            // Ensure endDate is set
            if (!task.recurrence.endDate) {
              task.recurrence.endDate = endDateStr;
            }

            return task;
          });
        } catch (error) {
          console.error('Error parsing scheduled tasks for category:', category, error);
          throw new Error(`Failed to parse scheduled tasks response for category: ${category}`);
        }

        // Filter out duplicates and add metadata to tasks
        const tasksWithMetadata = scheduledTasks
          .filter((task: any) => {
            // Check if a task with the same title and goalId already exists
            const isDuplicate = existingLifeAdminTasks.some(existingTask => 
              existingTask.title === task.title && existingTask.goalId === 'life-admin'
            );
            if (isDuplicate) {
              console.log(`Skipping duplicate task: ${task.title}`);
            }
            return !isDuplicate;
          })
          .map((task: any) => ({
            ...task,
            id: generateUUID(),
            goalId: 'life-admin',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));

        allScheduledTasks.push(...tasksWithMetadata);
      }

      console.log('Final scheduled tasks:', allScheduledTasks);
      return allScheduledTasks;

    } catch (error) {
      console.error('Error scheduling tasks:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }
};

async function makeOpenAIRequest(prompt: string): Promise<string> {
  console.log('Making OpenAI request with prompt:', prompt);
  
  const response = await axios.post(
    `${openaiConfig.endpoint}/openai/deployments/${openaiConfig.deployment}/chat/completions?api-version=2024-02-15-preview`,
    {
      messages: [
        {
          role: "system",
          content: "You are an AI assistant helping to break down life goals into actionable tasks. Provide clear, specific, and well-reasoned responses. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
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