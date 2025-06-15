import axios from 'axios';
import { Goal, Task } from '../types';
import { generateUUID } from '../utils/uuid';
import { UserPreferences } from './userPreferencesService';
import { getAvailableTimeBlocks, OPENAI_CONFIG } from '../utils/promptUtils';

export const openaiService = {
  generateTasks: async (goals: Goal[], existingTasks?: Task[], userPreferences?: UserPreferences): Promise<Task[]> => {
    try {
      const currentDate = new Date();
      console.log('Starting task generation for goals:', goals);

      // Compose user preferences summary for prompt
      const availableBlocksText = getAvailableTimeBlocks(userPreferences);

      // Step 1: Identify key components
      const componentsPrompt = `
      Analyze the following life goal and identify its key components:
      ${goals.map(goal => `
        - ${goal.text}
          Type: ${goal.type}
          Priority: ${goal.priority}
          Weekly Time: ${goal.timeCommitment} hours
      `).join('\n')}
      ${availableBlocksText}
      Return a JSON array of components, each with:
      - name: string (name of the component)
      - description: string (brief explanation of why this component is important)
      - priority: string (high/medium/low based on the goal's priority)
      `;

      console.log('Step 1: Sending components prompt');
      const componentsResponse = await makeOpenAIRequest(componentsPrompt);
      console.log('Step 1: Received components response:', componentsResponse);
      
      let components;
      try {
        const parsedResponse = JSON.parse(componentsResponse);
        components = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.components;
        if (!components || !Array.isArray(components)) {
          throw new Error('Invalid components format');
        }
      } catch (error) {
        console.error('Error parsing components:', error);
        throw new Error('Failed to parse components response');
      }

      let taskPeriodIncrement = 0;
      if (goals[0].type === 'short') {
        taskPeriodIncrement = 1;
      } else if (goals[0].type === 'medium') {
        taskPeriodIncrement = 3;
      } else if (goals[0].type === 'long') {
        taskPeriodIncrement = 12;
      }
      let taskPeriodStart = new Date();
      let taskPeriodEnd = new Date();
      taskPeriodEnd.setMonth(taskPeriodStart.getMonth() + taskPeriodIncrement);

      // Step 2: Generate subtasks for each component
      const subtasksPrompt = `
      For each key component, generate specific subtasks over the ${taskPeriodIncrement} month period.
      Consider the weekly time commitment of ${goals[0].timeCommitment} hours.
      ${availableBlocksText}
      Components:
      ${JSON.stringify(components, null, 2)}
      For each subtask, provide:
      - title: string (specific action item)
      - description: string (reasoning for why this task is important)
      - estimatedDuration: number (in minutes)
      - priority: string (high/medium/low)
      - timeframe: string (specific date range based on the goal type's increment)
      Return a JSON array of subtasks grouped by component.
      `;

      console.log('Step 2: Sending subtasks prompt');
      const subtasksResponse = await makeOpenAIRequest(subtasksPrompt);
      console.log('Step 2: Received subtasks response:', subtasksResponse);

      let subtasksByComponent;
      try {
        const parsedResponse = JSON.parse(subtasksResponse);
        console.log('Parsed response:', parsedResponse);
        
        // Handle the object structure where each component is a key with an array of subtasks
        if (typeof parsedResponse === 'object' && !Array.isArray(parsedResponse)) {
          // Check if the response has a 'tasks' property
          const tasksObject = parsedResponse.tasks || parsedResponse;
          subtasksByComponent = Object.entries(tasksObject).flatMap(([component, subtasks]) => 
            (subtasks as any[]).map(subtask => ({
              ...subtask,
              component
            }))
          );
        } else if (Array.isArray(parsedResponse)) {
          subtasksByComponent = parsedResponse;
        } else {
          throw new Error('Invalid subtasks format');
        }
        
        if (!subtasksByComponent || !Array.isArray(subtasksByComponent)) {
          throw new Error('Invalid subtasks format');
        }
      } catch (error) {
        console.error('Error parsing subtasks:', error);
        throw new Error('Failed to parse subtasks response');
      }

      // Step 3: Format tasks for calendar
      const calendarPrompt = `
      Format the following subtasks into calendar-ready tasks:
      ${JSON.stringify(subtasksByComponent, null, 2)}
      Current date: ${currentDate.toISOString().split('T')[0]}
      ${availableBlocksText}
      For each task, provide a JSON object with:
      - title: string (from subtask)
      - description: string (from subtask)
      - duration: number (from estimatedDuration)
      - startDate: string (YYYY-MM-DD, must be after current date)
      - startTime: string (HH:MM)
      - endTime: string (HH:MM)
      - goalId: string (${goals[0].id})
      Consider:
      - Spread tasks across available time
      - Respect the goal's weekly time commitment
      - Group related tasks together
      - Account for task dependencies
      - Schedule tasks between ${taskPeriodStart.toISOString().split('T')[0]} and ${taskPeriodEnd.toISOString().split('T')[0]}
      ${existingTasks ? 'Consider existing tasks and avoid scheduling conflicts.' : ''}
      Do not schedule tasks during work/study or sleep hours.
      Return ONLY a JSON array of these task objects.
      `;

      console.log('Step 3: Sending calendar prompt');
      const calendarResponse = await makeOpenAIRequest(calendarPrompt);
      console.log('Step 3: Received calendar response:', calendarResponse);

      let tasks;
      try {
        const parsedResponse = JSON.parse(calendarResponse);
        tasks = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.tasks;
        if (!tasks || !Array.isArray(tasks)) {
          throw new Error('Invalid tasks format');
        }
      } catch (error) {
        console.error('Error parsing tasks:', error);
        throw new Error('Failed to parse tasks response');
      }

      // Add metadata to tasks
      const tasksWithMetadata = tasks.map((task: any) => ({
        ...task,
        id: generateUUID(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      console.log('Final tasks generated:', tasksWithMetadata);
      return tasksWithMetadata;

    } catch (error) {
      console.error('Error generating tasks:', error);
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
          content: "You are an AI assistant helping to break down life goals into actionable tasks. Provide clear, specific, and well-reasoned responses. Always return valid JSON."
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