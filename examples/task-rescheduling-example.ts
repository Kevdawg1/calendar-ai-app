import { taskService } from '../src/services/taskService';
import { goalService } from '../src/services/goalService';
import { userPreferencesService } from '../src/services/userPreferencesService';
import { Task, Goal } from '../src/types';

/**
 * Example: Adding a new high-priority task and seeing how the system reschedules existing tasks
 */
async function exampleAddHighPriorityTask() {
  console.log('=== Example: Adding High Priority Task ===');

  // 1. Set up user preferences
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

  // 2. Create some goals
  const workGoal: Goal = {
    id: 'work-goal-1',
    text: 'Complete quarterly project',
    type: 'medium',
    priority: 'high',
    timeCommitment: 10,
    createdAt: new Date().toISOString(),
    color: '#FF6B6B'
  };
  await goalService.addGoal(workGoal);

  const personalGoal: Goal = {
    id: 'personal-goal-1',
    text: 'Learn new programming language',
    type: 'long',
    priority: 'medium',
    timeCommitment: 5,
    createdAt: new Date().toISOString(),
    color: '#4ECDC4'
  };
  await goalService.addGoal(personalGoal);

  // 3. Add some existing tasks
  const existingTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: 'Research project requirements',
      description: 'Gather requirements for the quarterly project',
      startDate: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00',
      goalId: 'work-goal-1',
      status: 'pending',
      priority: 'medium'
    },
    {
      title: 'Study programming basics',
      description: 'Review fundamental concepts',
      startDate: '2024-01-15',
      startTime: '18:00',
      endTime: '19:00',
      goalId: 'personal-goal-1',
      status: 'pending',
      priority: 'low'
    },
    {
      title: 'Grocery shopping',
      description: 'Buy groceries for the week',
      startDate: '2024-01-15',
      startTime: '16:00',
      endTime: '17:00',
      goalId: 'life-admin',
      status: 'pending',
      category: 'meal',
      priority: 'medium'
    }
  ];

  for (const task of existingTasks) {
    await taskService.addTask(task);
  }

  console.log('Initial tasks added');

  // 4. Add a new high-priority task that should trigger rescheduling
  const newHighPriorityTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
    title: 'Prepare quarterly presentation',
    description: 'Create presentation for quarterly review meeting',
    startDate: '2024-01-15',
    startTime: '14:00',
    endTime: '16:00',
    goalId: 'work-goal-1',
    status: 'pending',
    priority: 'high'
  };

  console.log('Adding high-priority task...');
  const addedTask = await taskService.addTaskWithRescheduling(newHighPriorityTask);

  console.log('New task added:', addedTask.title);

  // 5. Check the rescheduled tasks
  const allTasks = await taskService.getAllTasks();
  console.log('\n=== Final Schedule ===');
  allTasks
    .sort((a, b) => new Date(a.startDate + ' ' + (a.startTime || '00:00')).getTime() - 
                     new Date(b.startDate + ' ' + (b.startTime || '00:00')).getTime())
    .forEach(task => {
      console.log(`${task.startTime || 'All day'} - ${task.title} (${task.priority || 'medium'} priority)`);
    });
}

/**
 * Example: Analyzing task dependencies and conflicts
 */
async function exampleAnalyzeDependencies() {
  console.log('\n=== Example: Analyzing Dependencies ===');

  const analysis = await taskService.analyzeTaskDependencies();
  
  console.log('Dependencies found:', analysis.dependencies.length);
  analysis.dependencies.forEach((dep: any) => {
    console.log(`Task "${dep.taskId}" depends on: ${dep.prerequisites.join(', ')}`);
  });

  console.log('\nConflicts found:', analysis.conflicts.length);
  analysis.conflicts.forEach((conflict: any) => {
    console.log(`${conflict.conflictType}: ${conflict.description} (${conflict.severity} severity)`);
  });
}

/**
 * Example: Optimizing the entire schedule
 */
async function exampleOptimizeSchedule() {
  console.log('\n=== Example: Optimizing Schedule ===');

  console.log('Before optimization:');
  const beforeTasks = await taskService.getAllTasks();
  beforeTasks
    .sort((a, b) => new Date(a.startDate + ' ' + (a.startTime || '00:00')).getTime() - 
                     new Date(b.startDate + ' ' + (b.startTime || '00:00')).getTime())
    .forEach(task => {
      console.log(`${task.startTime || 'All day'} - ${task.title}`);
    });

  await taskService.optimizeSchedule();

  console.log('\nAfter optimization:');
  const afterTasks = await taskService.getAllTasks();
  afterTasks
    .sort((a, b) => new Date(a.startDate + ' ' + (a.startTime || '00:00')).getTime() - 
                     new Date(b.startDate + ' ' + (b.startTime || '00:00')).getTime())
    .forEach(task => {
      console.log(`${task.startTime || 'All day'} - ${task.title}`);
    });
}

/**
 * Run all examples
 */
export async function runReschedulingExamples() {
  try {
    await exampleAddHighPriorityTask();
    await exampleAnalyzeDependencies();
    await exampleOptimizeSchedule();
    
    console.log('\n=== All examples completed successfully ===');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run examples
// runReschedulingExamples(); 