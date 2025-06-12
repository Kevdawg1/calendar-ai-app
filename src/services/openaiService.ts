import axios from 'axios';
import { Goal, Task } from '../types';
import { generateUUID } from '../utils/uuid';

const ENDPOINT = 'https://calendar-ai.openai.azure.com/';
const API_KEY = 'E5iUsb1W3fHZgYHoxYagSAPHqEe9l9hInO1wJYnD2Th4JOhCPaCiJQQJ99BFACL93NaXJ3w3AAAAACOGKXdj';
const DEPLOYMENT = 'gpt-35-turbo';

export const openaiService = {
  generateTasks: async (goals: Goal[], existingTasks?: Task[]): Promise<Task[]> => {
    try {
      const currentDate = new Date();

      // Step 1: Identify key components
      const componentsPrompt = `
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

      const componentsResponse = await makeOpenAIRequest(componentsPrompt);
      const components = JSON.parse(componentsResponse);

      // Step 2: Generate subtasks for each component
      const subtasksPrompt = `
      For each key component, generate specific subtasks that align with the goal type (${goals[0].type}).
      Consider the weekly time commitment of ${goals[0].timeCommitment} hours.

      Components:
      ${JSON.stringify(components, null, 2)}

      For each subtask, provide:
      - title: string (specific action item)
      - description: string (reasoning for why this task is important)
      - estimatedDuration: number (in minutes)
      - priority: string (high/medium/low)

      Return a JSON array of subtasks grouped by component.
      `;

      const subtasksResponse = await makeOpenAIRequest(subtasksPrompt);
      const subtasksByComponent = JSON.parse(subtasksResponse);

      // Step 3: Format tasks for calendar
      const calendarPrompt = `
      Format the following subtasks into calendar-ready tasks:
      ${JSON.stringify(subtasksByComponent, null, 2)}

      Current date: ${currentDate.toISOString().split('T')[0]}

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
      ${existingTasks ? 'Consider existing tasks and avoid scheduling conflicts.' : ''}

      Return ONLY a JSON array of these task objects.
      `;

      const calendarResponse = await makeOpenAIRequest(calendarPrompt);
      const tasks = JSON.parse(calendarResponse);

      // Add metadata to tasks
      return tasks.map((task: any) => ({
        ...task,
        id: generateUUID(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

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
  const response = await axios.post(
    `${ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`,
    {
      messages: [
        {
          role: "system",
          content: "You are an AI assistant helping to break down life goals into actionable tasks. Provide clear, specific, and well-reasoned responses."
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
        'api-key': API_KEY
      }
    }
  );

  if (!response.data.choices?.[0]?.message?.content) {
    throw new Error('Invalid response format from OpenAI');
  }

  return response.data.choices[0].message.content;
} 