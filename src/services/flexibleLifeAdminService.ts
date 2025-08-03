import axios from 'axios';
import { LifeAdminTask } from '../data/lifeAdminTasks';
import { Task } from '../types';
import { generateUUID } from '../utils/uuid';
import { UserPreferences } from './userPreferencesService';
import { getPromptWithPreferences, parseOpenAIResponse, validateTaskArray } from '../utils/promptUtils';
import { openaiConfig } from '../config/openai';
import { taskService } from './taskService';
import { taskReschedulingService, ReschedulingContext } from './taskReschedulingService';
import { goalService } from './goalService';

export interface WeeklyAvailability {
  [dayOfWeek: string]: {
    available: boolean;
    preferredTimes: string[];
    maxTasks: number;
  };
}

export interface FlexibleSchedulingOptions {
  startWeek?: string; // YYYY-MM-DD format, defaults to current week
  endWeek?: string; // YYYY-MM-DD format, defaults to 4 weeks from start
  considerExistingTasks?: boolean;
  optimizeForUserPreferences?: boolean;
  allowTaskSplitting?: boolean; // Allow splitting large tasks across multiple days
}

export const flexibleLifeAdminService = {
  /**
   * Schedule life admin tasks with flexible timing and weekly availability consideration
   */
  scheduleTasksFlexibly: async (
    tasks: LifeAdminTask[], 
    userPreferences?: UserPreferences,
    options: FlexibleSchedulingOptions = {}
  ): Promise<Task[]> => {
    try {
      console.log('Starting flexible life admin task scheduling:', tasks);

      // Set default options
      const {
        startWeek = getCurrentWeekStart(),
        endWeek = getWeekStart(4), // 4 weeks from start
        considerExistingTasks = true,
        optimizeForUserPreferences = true,
        allowTaskSplitting = false
      } = options;

      // Get existing tasks for conflict analysis
      const existingTasks = considerExistingTasks ? await taskService.getAllTasks() : [];
      const existingLifeAdminTasks = existingTasks.filter(task => task.goalId === 'life-admin');

      // Analyze weekly availability
      const weeklyAvailability = analyzeWeeklyAvailability(userPreferences, existingTasks);

      // Group tasks by category and frequency
      const tasksByCategory = groupTasksByCategory(tasks);

      // Schedule tasks for each category with flexibility
      const allScheduledTasks: Task[] = [];
      
      for (const [category, categoryTasks] of Object.entries(tasksByCategory)) {
        console.log(`Scheduling tasks for category: ${category}`);
        
        const scheduledTasks = await scheduleCategoryTasks(
          category,
          categoryTasks,
          weeklyAvailability,
          existingTasks,
          userPreferences,
          {
            startWeek,
            endWeek,
            allowTaskSplitting
          }
        );

        allScheduledTasks.push(...scheduledTasks);
      }

      // If optimization is enabled, use the rescheduling service to optimize the schedule
      if (optimizeForUserPreferences && userPreferences) {
        const goals = await goalService.getAllGoals();
        const context: ReschedulingContext = {
          existingTasks: [...existingTasks, ...allScheduledTasks],
          goals: goals,
          userPreferences: userPreferences,
          currentDate: new Date().toISOString().split('T')[0]
        };

        const optimizedTasks = await taskReschedulingService.rescheduleTasks(context);
        
        // Update the scheduled tasks with optimized scheduling
        const optimizedScheduledTasks = allScheduledTasks.map(scheduledTask => {
          const optimizedTask = optimizedTasks.find(opt => opt.id === scheduledTask.id);
          return optimizedTask ? { ...scheduledTask, ...optimizedTask } : scheduledTask;
        });

        console.log('Tasks optimized with rescheduling service');
        return optimizedScheduledTasks;
      }

      console.log('Final scheduled tasks:', allScheduledTasks);
      return allScheduledTasks;

    } catch (error) {
      console.error('Error scheduling tasks flexibly:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  },

  /**
   * Get recommended scheduling times for life admin tasks based on user preferences
   */
  getRecommendedTimes: async (
    taskCategory: string,
    userPreferences?: UserPreferences
  ): Promise<string[]> => {
    try {
      const prompt = getPromptWithPreferences(`
        Based on the user's preferences and the task category "${taskCategory}", 
        recommend the best times to schedule this type of task.
        
        Consider:
        - User's wake/sleep times
        - Work schedule constraints
        - Natural energy patterns
        - Task complexity and duration
        - Typical timing for this category of tasks
        
        Return a JSON array of recommended time slots in HH:MM format.
        Example: ["08:00", "12:00", "18:00"]
        
        Focus on times when the user is likely to be available and have energy for this type of task.
      `, userPreferences);

      const response = await makeOpenAIRequest(prompt);
      const parsedResponse = parseOpenAIResponse(response);
      
      return Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.times || [];
    } catch (error) {
      console.error('Error getting recommended times:', error);
      // Fallback to default times
      return getDefaultTimesForCategory(taskCategory);
    }
  },

  /**
   * Analyze current schedule and suggest optimal times for new life admin tasks
   */
  analyzeScheduleGaps: async (
    userPreferences?: UserPreferences,
    daysAhead: number = 7
  ): Promise<any[]> => {
    try {
      const existingTasks = await taskService.getAllTasks();
      const weeklyAvailability = analyzeWeeklyAvailability(userPreferences, existingTasks);
      
      const gaps = [];
      const currentDate = new Date();
      
      for (let i = 0; i < daysAhead; i++) {
        const checkDate = new Date(currentDate);
        checkDate.setDate(currentDate.getDate() + i);
        const dayOfWeek = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        if (weeklyAvailability[dayOfWeek]?.available) {
          const dayTasks = existingTasks.filter(task => 
            task.startDate === checkDate.toISOString().split('T')[0]
          );
          
          const availableSlots = findAvailableTimeSlots(
            dayTasks,
            weeklyAvailability[dayOfWeek],
            userPreferences
          );
          
          if (availableSlots.length > 0) {
            gaps.push({
              date: checkDate.toISOString().split('T')[0],
              dayOfWeek,
              availableSlots,
              existingTaskCount: dayTasks.length
            });
          }
        }
      }
      
      return gaps;
    } catch (error) {
      console.error('Error analyzing schedule gaps:', error);
      return [];
    }
  }
};

/**
 * Helper functions
 */

function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek; // Sunday is 0
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysToSubtract);
  return weekStart.toISOString().split('T')[0];
}

function getWeekStart(weeksFromNow: number): string {
  const weekStart = new Date(getCurrentWeekStart());
  weekStart.setDate(weekStart.getDate() + (weeksFromNow * 7));
  return weekStart.toISOString().split('T')[0];
}

function analyzeWeeklyAvailability(
  userPreferences?: UserPreferences,
  existingTasks: Task[] = []
): WeeklyAvailability {
  const availability: WeeklyAvailability = {};
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  daysOfWeek.forEach(day => {
    const dayTasks = existingTasks.filter(task => {
      const taskDate = new Date(task.startDate);
      const taskDay = taskDate.toLocaleDateString('en-US', { weekday: 'long' });
      return taskDay === day;
    });

    // Check if user has work schedule for this day
    const hasWork = userPreferences?.hasWorkSchedule && 
                   userPreferences?.workSchedule?.[day] !== undefined;

    // Determine availability based on user preferences and existing tasks
    const available = !hasWork || day === 'Saturday' || day === 'Sunday';
    const maxTasks = available ? 6 : 3; // Fewer tasks on work days
    const preferredTimes = getPreferredTimesForDay(day, userPreferences, hasWork);

    availability[day] = {
      available,
      preferredTimes,
      maxTasks: Math.max(0, maxTasks - dayTasks.length)
    };
  });

  return availability;
}

function getPreferredTimesForDay(
  day: string,
  userPreferences: UserPreferences | undefined,
  hasWork: boolean = false
): string[] {
  if (hasWork) {
    // Work days: prefer early morning, lunch break, or evening
    return ['07:00', '12:00', '18:00', '19:00'];
  } else {
    // Weekend: more flexible timing
    return ['09:00', '10:00', '14:00', '15:00', '16:00'];
  }
}

function groupTasksByCategory(tasks: LifeAdminTask[]): Record<string, LifeAdminTask[]> {
  return tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, LifeAdminTask[]>);
}

async function scheduleCategoryTasks(
  category: string,
  categoryTasks: LifeAdminTask[],
  weeklyAvailability: WeeklyAvailability,
  existingTasks: Task[],
  userPreferences?: UserPreferences,
  options?: {
    startWeek: string;
    endWeek: string;
    allowTaskSplitting: boolean;
  }
): Promise<Task[]> {
  const defaultOptions = {
    startWeek: getCurrentWeekStart(),
    endWeek: getWeekStart(4),
    allowTaskSplitting: false
  };
  const finalOptions = { ...defaultOptions, ...options };
  
  const prompt = getPromptWithPreferences(`
    Schedule the following ${category} life admin tasks with flexible timing:
    ${categoryTasks.map(task => `
      - ${task.title}
        Frequency: ${task.frequency}
        Category: ${task.category}
    `).join('\n')}

    Weekly Availability:
    ${Object.entries(weeklyAvailability).map(([day, availability]) => `
      ${day}: ${availability.available ? 'Available' : 'Limited'} (${availability.maxTasks} tasks max)
      Preferred times: ${availability.preferredTimes.join(', ')}
    `).join('\n')}

    Scheduling Period: ${finalOptions.startWeek} to ${finalOptions.endWeek}

    For each task, provide a JSON object with:
    - title: string (from task)
    - description: string (include category and frequency)
    - startDate: string (YYYY-MM-DD, choose optimal date within the period)
    - startTime: string (HH:MM, choose from preferred times for that day)
    - endTime: string (HH:MM, estimate appropriate duration)
    - recurrence: object
      - frequency: string (daily/weekly/monthly/seasonal based on task frequency)
      - interval: number (1 for daily/weekly/monthly, 3 for seasonal)
      - endDate: string (YYYY-MM-DD, use ${getWeekStart(12)}) // 12 weeks from start

    Scheduling Guidelines:
    1. Distribute tasks evenly across available days
    2. Respect daily task limits
    3. Use preferred times for each day
    4. Avoid scheduling too many tasks on the same day
    5. Consider task dependencies and logical grouping
    6. Start with the most important or time-sensitive tasks
    7. Leave buffer time between tasks
    8. Consider user's energy patterns (morning for complex tasks, evening for routine tasks)

    Return ONLY a JSON array of these task objects.
  `, userPreferences);

  const response = await makeOpenAIRequest(prompt);
  
  let scheduledTasks;
  try {
    const parsedResponse = parseOpenAIResponse(response);
    scheduledTasks = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.tasks;
    scheduledTasks = validateTaskArray(scheduledTasks, 'tasks');

    // Add metadata and validate
    const tasksWithMetadata = scheduledTasks.map((task: any) => ({
      ...task,
      id: generateUUID(),
      goalId: 'life-admin',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: category
    }));

    return tasksWithMetadata;
  } catch (error) {
    console.error('Error parsing scheduled tasks for category:', category, error);
    throw new Error(`Failed to parse scheduled tasks response for category: ${category}`);
  }
}

function findAvailableTimeSlots(
  dayTasks: Task[],
  dayAvailability: { available: boolean; preferredTimes: string[]; maxTasks: number },
  userPreferences?: UserPreferences
): string[] {
  if (!dayAvailability.available || dayAvailability.maxTasks <= 0) {
    return [];
  }

  // Filter out times that are already occupied
  const occupiedTimes = dayTasks.map(task => task.startTime).filter(Boolean);
  return dayAvailability.preferredTimes.filter(time => !occupiedTimes.includes(time));
}

function getDefaultTimesForCategory(category: string): string[] {
  const categoryTimes: Record<string, string[]> = {
    'household': ['09:00', '14:00', '18:00'],
    'laundry': ['08:00', '10:00', '16:00'],
    'meal': ['07:00', '12:00', '17:00'],
    'personal': ['08:00', '19:00', '20:00'],
    'admin': ['10:00', '14:00', '15:00'],
    'maintenance': ['09:00', '13:00', '16:00'],
    'outdoor': ['08:00', '15:00', '17:00'],
    'pet': ['07:00', '12:00', '18:00']
  };

  return categoryTimes[category] || ['10:00', '14:00', '16:00'];
}

async function makeOpenAIRequest(prompt: string): Promise<string> {
  console.log('Making OpenAI request for flexible life admin scheduling');
  
  const response = await axios.post(
    `${openaiConfig.endpoint}/openai/deployments/${openaiConfig.deployment}/chat/completions?api-version=2024-02-15-preview`,
    {
      messages: [
        {
          role: "system",
          content: "You are an intelligent life admin scheduling assistant that creates flexible, personalized schedules based on user preferences and availability. Consider weekly patterns, energy levels, and task complexity when scheduling."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.4,
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