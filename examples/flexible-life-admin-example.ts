import { lifeAdminService } from '../src/services/lifeAdminService';
import { flexibleLifeAdminService } from '../src/services/flexibleLifeAdminService';
import { userPreferencesService } from '../src/services/userPreferencesService';
import { LifeAdminTask } from '../src/data/lifeAdminTasks';

/**
 * Example: Scheduling life admin tasks with flexible timing
 */
async function exampleFlexibleScheduling() {
  console.log('=== Example: Flexible Life Admin Scheduling ===');

  // 1. Set up user preferences with work schedule
  const preferences = {
    wakeUpTime: new Date('2024-01-01T07:00:00'),
    sleepTime: new Date('2024-01-01T22:00:00'),
    hasWorkSchedule: true,
    workSchedule: {
      'Monday': { startTime: new Date('2024-01-01T09:00:00'), endTime: new Date('2024-01-01T17:00:00') },
      'Tuesday': { startTime: new Date('2024-01-01T09:00:00'), endTime: new Date('2024-01-01T17:00:00') },
      'Wednesday': { startTime: new Date('2024-01-01T09:00:00'), endTime: new Date('2024-01-01T17:00:00') },
      'Thursday': { startTime: new Date('2024-01-01T09:00:00'), endTime: new Date('2024-01-01T17:00:00') },
      'Friday': { startTime: new Date('2024-01-01T09:00:00'), endTime: new Date('2024-01-01T17:00:00') }
    }
  };
  await userPreferencesService.savePreferences(preferences);

  // 2. Create sample life admin tasks
  const sampleTasks: LifeAdminTask[] = [
    {
      id: 'sample-1',
      title: 'Do laundry',
      category: 'laundry',
      frequency: 'weekly',
      enabled: true
    },
    {
      id: 'sample-2',
      title: 'Grocery shopping',
      category: 'meal',
      frequency: 'weekly',
      enabled: true
    },
    {
      id: 'sample-3',
      title: 'Clean kitchen',
      category: 'household',
      frequency: 'weekly',
      enabled: true
    },
    {
      id: 'sample-4',
      title: 'Pay bills',
      category: 'admin',
      frequency: 'monthly',
      enabled: true
    },
    {
      id: 'sample-5',
      title: 'Exercise',
      category: 'personal',
      frequency: 'daily',
      enabled: true
    }
  ];

  // 3. Schedule tasks with flexible timing
  console.log('Scheduling tasks with flexible timing...');
  const flexiblyScheduledTasks = await lifeAdminService.scheduleTasksFlexibly(
    sampleTasks,
    preferences,
    {
      startWeek: '2024-01-15', // Start from a specific week
      endWeek: '2024-02-12',   // 4 weeks of scheduling
      considerExistingTasks: true,
      optimizeForUserPreferences: true,
      allowTaskSplitting: false
    }
  );

  console.log('\n=== Flexibly Scheduled Tasks ===');
  flexiblyScheduledTasks.forEach(task => {
    console.log(`${task.startDate} ${task.startTime} - ${task.title} (${task.category})`);
  });

  // 4. Compare with legacy scheduling
  console.log('\n=== Legacy Scheduling (for comparison) ===');
  const legacyScheduledTasks = await lifeAdminService.scheduleTasks(sampleTasks, preferences);
  
  legacyScheduledTasks.forEach(task => {
    console.log(`${task.startDate} ${task.startTime} - ${task.title} (${task.category})`);
  });

  // 5. Get recommended times for specific categories
  console.log('\n=== Recommended Times ===');
  const recommendedTimes = await flexibleLifeAdminService.getRecommendedTimes('household', preferences);
  console.log('Recommended times for household tasks:', recommendedTimes);

  // 6. Analyze schedule gaps
  console.log('\n=== Schedule Gaps Analysis ===');
  const gaps = await flexibleLifeAdminService.analyzeScheduleGaps(preferences, 7);
  
  gaps.forEach(gap => {
    console.log(`${gap.date} (${gap.dayOfWeek}): ${gap.availableSlots.length} available slots`);
    console.log(`  Available times: ${gap.availableSlots.join(', ')}`);
    console.log(`  Existing tasks: ${gap.existingTaskCount}`);
  });

  return {
    flexible: flexiblyScheduledTasks,
    legacy: legacyScheduledTasks,
    recommendedTimes,
    gaps
  };
}

/**
 * Example: Scheduling with different options
 */
async function exampleSchedulingOptions() {
  console.log('\n=== Example: Different Scheduling Options ===');

  const preferences = await userPreferencesService.getPreferences();
  if (!preferences) {
    console.log('No user preferences found, skipping example');
    return;
  }

  const tasks: LifeAdminTask[] = [
    { id: 'option-1', title: 'Water plants', category: 'outdoor', frequency: 'weekly', enabled: true },
    { id: 'option-2', title: 'Organize desk', category: 'admin', frequency: 'monthly', enabled: true },
    { id: 'option-3', title: 'Meal prep', category: 'meal', frequency: 'weekly', enabled: true }
  ];

  // Option 1: Start from next week
  console.log('\n--- Option 1: Start from next week ---');
  const nextWeekTasks = await lifeAdminService.scheduleTasksFlexibly(tasks, preferences, {
    startWeek: '2024-01-22', // Next week
    endWeek: '2024-02-19'
  });
  nextWeekTasks.forEach(task => {
    console.log(`${task.startDate} ${task.startTime} - ${task.title}`);
  });

  // Option 2: Optimize for user preferences only
  console.log('\n--- Option 2: Optimize for preferences only ---');
  const optimizedTasks = await lifeAdminService.scheduleTasksFlexibly(tasks, preferences, {
    optimizeForUserPreferences: true,
    considerExistingTasks: false
  });
  optimizedTasks.forEach(task => {
    console.log(`${task.startDate} ${task.startTime} - ${task.title}`);
  });

  // Option 3: Allow task splitting
  console.log('\n--- Option 3: Allow task splitting ---');
  const splitTasks = await lifeAdminService.scheduleTasksFlexibly(tasks, preferences, {
    allowTaskSplitting: true
  });
  splitTasks.forEach(task => {
    console.log(`${task.startDate} ${task.startTime} - ${task.title}`);
  });
}

/**
 * Example: Weekly availability analysis
 */
async function exampleWeeklyAvailability() {
  console.log('\n=== Example: Weekly Availability Analysis ===');

  const preferences = await userPreferencesService.getPreferences();
  if (!preferences) {
    console.log('No user preferences found, skipping example');
    return;
  }

  // Get recommended times for different categories
  const categories = ['household', 'laundry', 'meal', 'personal', 'admin'];
  
  for (const category of categories) {
    const times = await flexibleLifeAdminService.getRecommendedTimes(category, preferences);
    console.log(`${category}: ${times.join(', ')}`);
  }

  // Analyze gaps for the next 14 days
  const gaps = await flexibleLifeAdminService.analyzeScheduleGaps(preferences, 14);
  
  console.log('\nSchedule gaps for next 14 days:');
  gaps.forEach(gap => {
    if (gap.availableSlots.length > 0) {
      console.log(`${gap.date} (${gap.dayOfWeek}): ${gap.availableSlots.join(', ')}`);
    }
  });
}

/**
 * Run all examples
 */
export async function runFlexibleLifeAdminExamples() {
  try {
    const results = await exampleFlexibleScheduling();
    await exampleSchedulingOptions();
    await exampleWeeklyAvailability();
    
    console.log('\n=== All flexible life admin examples completed successfully ===');
    return results;
  } catch (error) {
    console.error('Error running flexible life admin examples:', error);
    throw error;
  }
}

// Uncomment to run examples
// runFlexibleLifeAdminExamples(); 