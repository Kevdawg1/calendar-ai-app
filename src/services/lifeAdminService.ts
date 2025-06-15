import axios from 'axios';
import { LifeAdminTask } from '../data/lifeAdminTasks';
import { Task } from '../types';
import { generateUUID } from '../utils/uuid';
import { UserPreferences } from './userPreferencesService';
import { getAvailableTimeBlocks, OPENAI_CONFIG } from '../utils/promptUtils';

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

      // Compose user preferences summary for prompt
      const availableBlocksText = getAvailableTimeBlocks(userPreferences);

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
        
        const prompt = `
        Schedule the following life admin tasks into a calendar:
        ${categoryTasks.map(task => `
          - ${task.title}
            Category: ${task.category}
            Frequency: ${task.frequency}
        `).join('\n')}
        ${availableBlocksText}
        For each task, create a recurring calendar event with the following rules:
        - Daily tasks: Repeat every day (interval: 1)
        - Weekly tasks: Repeat every week (interval: 1)
        - Monthly tasks: Repeat every month (interval: 1)
        - Seasonal tasks: Repeat every 3 months (interval: 3)

        For each task, provide a JSON object with:
        - title: string (from task)
        - description: string (include category and frequency)
        - duration: number (in minutes, estimate based on task type)
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
        `;

        console.log('Sending scheduling prompt for category:', category);
        const response = await makeOpenAIRequest(prompt);
        console.log('Received scheduling response for category:', category);

        let scheduledTasks;
        try {
          const parsedResponse = JSON.parse(response);
          scheduledTasks = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.tasks;
          if (!scheduledTasks || !Array.isArray(scheduledTasks)) {
            throw new Error('Invalid tasks format');
          }

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

        // Add metadata to tasks
        const tasksWithMetadata = scheduledTasks.map((task: any) => ({
          ...task,
          id: generateUUID(),
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
    `${OPENAI_CONFIG.endpoint}/openai/deployments/${OPENAI_CONFIG.deployment}/chat/completions?api-version=2024-02-15-preview`,
    {
      messages: [
        {
          role: "system",
          content: "You are an AI assistant helping to schedule recurring life admin tasks. Provide clear, specific, and well-reasoned responses. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: OPENAI_CONFIG.maxTokens,
      temperature: OPENAI_CONFIG.temperature,
      response_format: { type: "json_object" }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'api-key': OPENAI_CONFIG.apiKey
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