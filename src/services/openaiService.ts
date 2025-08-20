import axios from 'axios';
import { Goal, Task } from '../types';
import { generateUUID } from '../utils/uuid';
import { UserPreferences } from './userPreferencesService';
import { getPromptWithPreferences, parseOpenAIResponse, validateTaskArray } from '../utils/promptUtils';
import { openaiConfig } from '../config/openai';

export const openaiService = {
  generateTasks: async (goals: Goal[], existingTasks?: Task[], userPreferences?: UserPreferences): Promise<Task[]> => {
    try {
      const currentDate = new Date();
      console.log('Starting task generation for goals:', goals);

      // Step 1: Identify key components
      const componentsPrompt = getPromptWithPreferences(`
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
      `, userPreferences);

      console.log('Step 1: Sending components prompt');
      const componentsResponse = await makeOpenAIRequest(componentsPrompt);
      console.log('Step 1: Received components response:', componentsResponse);
      
      let components;
      try {
        const parsedResponse = parseOpenAIResponse(componentsResponse);
        components = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.components;
        components = validateTaskArray(components, 'components');
      } catch (error) {
        console.error('Error parsing components:', error);
        throw new Error('Failed to parse components response');
      }

      // Calculate goal timeline based on goal type
      let taskPeriodIncrement = 0;
      let goalDurationMonths = 0;
      
      if (goals[0].type === 'short') {
        taskPeriodIncrement = 1;
        goalDurationMonths = 3; // 1-3 months for short term goals
      } else if (goals[0].type === 'medium') {
        taskPeriodIncrement = 3;
        goalDurationMonths = 12; // 3-12 months for medium term goals
      } else if (goals[0].type === 'long') {
        taskPeriodIncrement = 12;
        goalDurationMonths = 60; // 1-5 years for long term goals
      }
      
      let taskPeriodStart = new Date();
      let taskPeriodEnd = new Date();
      taskPeriodEnd.setMonth(taskPeriodStart.getMonth() + goalDurationMonths);

      // Step 2: Generate subtasks for each component
      const subtasksPrompt = getPromptWithPreferences(`
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
      
      Example format:
      {
        "tasks": [
          {
            "component": "Component Name",
            "subtasks": [
              {
                "title": "Specific task",
                "description": "Why this is important",
                "estimatedDuration": 30,
                "priority": "medium",
                "timeframe": "Month 1-2"
              }
            ]
          }
        ]
      }
      `, userPreferences);

      console.log('Step 2: Sending subtasks prompt');
      const subtasksResponse = await makeOpenAIRequest(subtasksPrompt);
      console.log('Step 2: Received subtasks response:', subtasksResponse);

      let subtasksByComponent;
      try {
        const parsedResponse = parseOpenAIResponse(subtasksResponse);
        console.log('Parsed response:', parsedResponse);
        console.log('Response type:', typeof parsedResponse);
        console.log('Is array:', Array.isArray(parsedResponse));
        if (typeof parsedResponse === 'object' && parsedResponse !== null) {
          console.log('Response keys:', Object.keys(parsedResponse));
          if (parsedResponse.tasks) {
            console.log('Tasks type:', typeof parsedResponse.tasks);
            console.log('Tasks is array:', Array.isArray(parsedResponse.tasks));
          }
        }
        
        // Handle the object structure where each component is a key with an array of subtasks
        if (typeof parsedResponse === 'object' && !Array.isArray(parsedResponse)) {
          // Check if the response has a 'tasks' property
          const tasksObject = parsedResponse.tasks || parsedResponse;
          
          // Handle the case where tasks is an array of component objects
          if (Array.isArray(tasksObject)) {
            subtasksByComponent = tasksObject.flatMap((componentObj: any) => {
              const componentName = componentObj.component || 'Unknown';
              const subtasks = componentObj.subtasks || [];
              
              if (!Array.isArray(subtasks)) {
                console.warn('Subtasks is not an array for component:', componentName);
                return [];
              }
              
              return subtasks.map((subtask: any) => ({
                ...subtask,
                component: componentName
              }));
            });
          } else {
            // Handle the case where tasks is an object with component keys
            subtasksByComponent = Object.entries(tasksObject).flatMap(([component, subtasks]) => {
              if (!Array.isArray(subtasks)) {
                console.warn('Subtasks is not an array for component:', component);
                return [];
              }
              
              return subtasks.map((subtask: any) => ({
                ...subtask,
                component
              }));
            });
          }
        } else if (Array.isArray(parsedResponse)) {
          subtasksByComponent = parsedResponse;
        } else {
          console.warn('Unexpected response format, attempting fallback parsing');
          // Fallback: try to extract any array-like structure
          if (parsedResponse && typeof parsedResponse === 'object') {
            const allKeys = Object.keys(parsedResponse);
            const arrayKeys = allKeys.filter(key => Array.isArray(parsedResponse[key]));
            
            if (arrayKeys.length > 0) {
              console.log('Found array keys:', arrayKeys);
              subtasksByComponent = arrayKeys.flatMap(key => {
                const items = parsedResponse[key];
                return items.map((item: any) => ({
                  ...item,
                  component: key
                }));
              });
            } else {
              throw new Error('No valid array structure found in response');
            }
          } else {
            throw new Error('Invalid subtasks format');
          }
        }
        
        // Ensure we have a valid array before validation
        if (!Array.isArray(subtasksByComponent)) {
          console.error('subtasksByComponent is not an array:', subtasksByComponent);
          throw new Error('Failed to extract subtasks array');
        }
        
        subtasksByComponent = validateTaskArray(subtasksByComponent, 'subtasks');
      } catch (error) {
        console.error('Error parsing subtasks:', error);
        throw new Error('Failed to parse subtasks response');
      }

      // Step 3: Format tasks for calendar
      const calendarPrompt = getPromptWithPreferences(`
      Format the following subtasks into calendar-ready tasks:
      ${JSON.stringify(subtasksByComponent, null, 2)}
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
      `, userPreferences);

      console.log('Step 3: Sending calendar prompt');
      const calendarResponse = await makeOpenAIRequest(calendarPrompt);
      console.log('Step 3: Received calendar response:', calendarResponse);

      let tasks;
      try {
        const parsedResponse = parseOpenAIResponse(calendarResponse);
        tasks = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.tasks;
        tasks = validateTaskArray(tasks, 'tasks');
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