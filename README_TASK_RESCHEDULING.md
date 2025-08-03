# Intelligent Task Rescheduling System

## Overview

The Intelligent Task Rescheduling System automatically optimizes your calendar when new tasks are added, ensuring logical task flow, preventing conflicts, and maintaining progress toward your goals.

## Key Features

### 🎯 Priority-Based Rescheduling
- High-priority tasks get prime time slots
- Goal-critical activities receive preferential scheduling
- Maintains balance between different goal types

### 🔗 Dependency Analysis
- Identifies prerequisite tasks that must be completed first
- Ensures logical task sequences
- Prevents scheduling dependent tasks before prerequisites

### ⚡ Conflict Prevention
- Prevents time overlaps between tasks
- Avoids energy conflicts (too many demanding tasks together)
- Respects your work schedule and personal preferences

### 🎨 Personalization
- Honors your wake/sleep times
- Respects your work schedule
- Considers your natural energy patterns

## How It Works

### 1. Automatic Rescheduling
When you add a new task, the system:
1. Analyzes all existing tasks and their relationships
2. Identifies dependencies and conflicts
3. Reschedules tasks to optimize your schedule
4. Maintains progress toward all your goals

### 2. Smart Integration
The system considers:
- **Task Priorities**: High/medium/low priority levels
- **Goal Alignment**: How tasks relate to your short/medium/long-term goals
- **Time Commitments**: Weekly time allocations for each goal
- **User Preferences**: Your preferred scheduling times and constraints

### 3. Conflict Resolution
Automatically resolves:
- Time overlaps
- Energy conflicts
- Goal interference
- Preference violations

## Usage

### Adding Tasks with Rescheduling

```typescript
import { taskService } from './src/services/taskService';

// Add a new task and automatically reschedule existing tasks
const newTask = await taskService.addTaskWithRescheduling({
  title: 'Prepare quarterly presentation',
  description: 'Create presentation for quarterly review',
  startDate: '2024-01-15',
  startTime: '14:00',
  endTime: '16:00',
  goalId: 'work-goal-1',
  priority: 'high'
});
```

### Manual Schedule Optimization

```typescript
// Optimize your entire schedule
await taskService.optimizeSchedule();
```

### Analyzing Dependencies

```typescript
// Get insights into task relationships and conflicts
const analysis = await taskService.analyzeTaskDependencies();

console.log('Dependencies:', analysis.dependencies);
console.log('Conflicts:', analysis.conflicts);
```

## Example Scenarios

### Scenario 1: Adding a High-Priority Work Task
```
Before: 
- 10:00 AM: Research project requirements
- 2:00 PM: Grocery shopping
- 6:00 PM: Study programming

After adding "Prepare quarterly presentation" (high priority):
- 10:00 AM: Research project requirements
- 2:00 PM: Prepare quarterly presentation (high priority)
- 4:00 PM: Grocery shopping (moved)
- 6:00 PM: Study programming
```

### Scenario 2: Life Admin Integration
```
Before:
- 9:00 AM: Work meeting
- 2:00 PM: Project planning
- 5:00 PM: Gym workout

After adding "Doctor appointment" (time-sensitive):
- 9:00 AM: Work meeting
- 2:00 PM: Doctor appointment (new)
- 3:30 PM: Project planning (moved)
- 5:00 PM: Gym workout
```

## Configuration

### User Preferences
Set your preferences to get personalized scheduling:

```typescript
import { userPreferencesService } from './src/services/userPreferencesService';

await userPreferencesService.savePreferences({
  wakeUpTime: new Date('2024-01-01T07:00:00'),
  sleepTime: new Date('2024-01-01T22:00:00'),
  hasWorkSchedule: true,
  workSchedule: {
    'Monday': { startTime: new Date('2024-01-01T09:00:00'), endTime: new Date('2024-01-01T17:00:00') },
    // ... other days
  }
});
```

### Task Priorities
Set task priorities to influence scheduling:

```typescript
const task = {
  title: 'Important deadline',
  priority: 'high', // 'low' | 'medium' | 'high'
  // ... other properties
};
```

## System Prompts

The system uses sophisticated AI prompts to make intelligent scheduling decisions:

### Main Rescheduling Prompt
- Analyzes task dependencies and priorities
- Considers user preferences and constraints
- Optimizes for goal achievement
- Prevents conflicts and overlaps

### Dependency Analysis Prompt
- Identifies prerequisite relationships
- Finds blocking tasks
- Recognizes goal dependencies
- Detects resource conflicts

### Conflict Analysis Prompt
- Finds time overlaps
- Identifies energy conflicts
- Detects goal interference
- Recognizes preference violations

## Benefits

1. **Improved Success Rate**: Prerequisites are completed before dependent tasks
2. **Better Time Management**: Optimal use of available time blocks
3. **Reduced Stress**: Balanced workload distribution
4. **Goal Achievement**: Consistent progress toward all active goals
5. **Conflict Prevention**: Automatic detection and resolution of scheduling issues
6. **Personalization**: Respects individual preferences and patterns

## Technical Details

### Architecture
- **Azure OpenAI Integration**: Uses GPT models for intelligent analysis
- **Dependency Graph**: Maps task relationships and dependencies
- **Conflict Detection**: Identifies and resolves scheduling conflicts
- **Preference Engine**: Incorporates user preferences into scheduling decisions

### Performance
- **Real-time Analysis**: Reschedules tasks immediately when new ones are added
- **Batch Optimization**: Can optimize entire schedules on demand
- **Incremental Updates**: Only reschedules affected tasks when possible

### Error Handling
- **Graceful Degradation**: Falls back to regular scheduling if AI analysis fails
- **Validation**: Ensures all rescheduled tasks are valid
- **Logging**: Comprehensive logging for debugging and optimization

## Future Enhancements

1. **Learning Capabilities**: System learns from user behavior and preferences
2. **Predictive Scheduling**: Anticipates future conflicts and adjusts proactively
3. **Integration**: Connects with external calendars and task management systems
4. **Advanced Analytics**: Provides insights into scheduling patterns
5. **Collaborative Scheduling**: Considers team member availability

## Support

For questions or issues with the rescheduling system:
1. Check the logs for detailed error information
2. Verify your user preferences are set correctly
3. Ensure your goals and tasks have appropriate priorities
4. Review the example files for usage patterns 