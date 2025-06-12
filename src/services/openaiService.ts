import axios from 'axios';

const ENDPOINT = 'https://calendar-ai.openai.azure.com/';
const API_KEY = 'E5iUsb1W3fHZgYHoxYagSAPHqEe9l9hInO1wJYnD2Th4JOhCPaCiJQQJ99BFACL93NaXJ3w3AAAAACOGKXdj';
const DEPLOYMENT = 'gpt-35-turbo';

interface Goal {
  text: string;
  type: 'short' | 'medium' | 'long';
  priority: 'low' | 'medium' | 'high';
  timeCommitment: number;
}

interface Task {
  title: string;
  duration: number;
  startDate: string;
}

export const generateTasks = async (goals: Goal[]): Promise<Task[]> => {
  try {
    const currentDate = new Date();
    const systemMessage = `
    You are an assistant for planning granular tasks to achieve the life goals of the user. 
    ---
    RULES:
    Break down the following goals into more than one specific task.
    For each task, provide a JSON object with these exact fields: title (string), duration (number in minutes), and startDate (string in YYYY-MM-DD format). The startDate should be greater than the current date ${currentDate.toISOString().split('T')[0]}. 
    Each task should be a single task that can be completed in a single day.
    Each task must be specific and measurable.
    Return ONLY a JSON array of these task objects, nothing else. No additional text or explanation.
    `;

    const prompt = `
    
    Goals:
    ${goals.map(goal => `
      - ${goal.text}
        Type: ${goal.type}
        Priority: ${goal.priority}
        Weekly Time: ${goal.timeCommitment} hours
    `).join('\n')}`;

    console.log('Sending prompt to Azure OpenAI:', prompt);

    const response = await axios.post(
      `${ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`,
      {
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
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

    console.log('Raw response:', response.data);
    
    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    const content = response.data.choices[0].message.content;
    console.log('Response content:', content);

    try {
      const parsedContent = JSON.parse(content);
      let tasks: { title: string; duration: number; startDate: string }[] = [];

      // Handle array, object with tasks array, or single task object
      if (Array.isArray(parsedContent)) {
        tasks = parsedContent;
      } else if (parsedContent.tasks && Array.isArray(parsedContent.tasks)) {
        tasks = parsedContent.tasks;
      } else if (
        parsedContent &&
        typeof parsedContent === 'object' &&
        typeof parsedContent.title === 'string' &&
        typeof parsedContent.duration === 'number' &&
        typeof parsedContent.startDate === 'string'
      ) {
        tasks = [parsedContent];
      } else {
        throw new Error('Response does not contain a valid tasks array, is not an array, or is not a valid single task object');
      }

      console.log('Parsed tasks:', tasks);

      // Validate each task
      const validTasks = tasks.filter((task: { title: string; duration: number; startDate: string }) => {
        const isValid = 
          typeof task.title === 'string' &&
          typeof task.duration === 'number' &&
          typeof task.startDate === 'string' &&
          !isNaN(Date.parse(task.startDate));

        if (!isValid) {
          console.warn('Invalid task format:', task);
        }
        return isValid;
      });

      if (validTasks.length === 0) {
        throw new Error('No valid tasks found in response');
      }

      return validTasks;
    } catch (parseError: any) {
      console.error('Error parsing response:', parseError);
      throw new Error(`Failed to parse tasks: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error generating tasks:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}; 