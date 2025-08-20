# Meeting System for Calendar AI

## Overview

The Calendar AI app now includes a comprehensive meeting management system that integrates with the existing task scheduling functionality. The system uses sentiment analysis to create connections between meetings and tasks, allowing for intelligent task rescheduling based on meeting priorities and content.

## Key Features

### 1. Meeting Management
- **Create Meetings**: Add meetings with title, description, location, attendees, type, priority, and timing
- **Meeting Types**: Work, Personal, Social, Health, Education, and Other
- **Priority Levels**: Low, Medium, High
- **Status Tracking**: Scheduled, Completed, Cancelled

### 2. Sentiment Analysis
- **Automatic Analysis**: Meeting titles and descriptions are automatically analyzed for sentiment
- **Connection Detection**: The system identifies connections between meetings and tasks based on:
  - Thematic similarity
  - Temporal relationships
  - Goal alignment
  - Content overlap

### 3. Intelligent Task Rescheduling
- **Prerequisite Detection**: Tasks that should be completed before meetings are automatically identified
- **Priority-Based Scheduling**: High-priority meetings influence task scheduling more significantly
- **Week-Based Optimization**: Tasks in the same week as connected meetings are rescheduled to be completed before the meeting

## Technical Implementation

### Core Services

#### 1. Meeting Service (`src/services/meetingService.ts`)
- CRUD operations for meetings
- Automatic sentiment analysis on creation/update
- Meeting retrieval by date and week ranges

#### 2. Sentiment Analysis Service (`src/services/sentimentAnalysisService.ts`)
- Analyzes sentiment of meeting and task content
- Identifies connections between meetings and tasks
- Determines prerequisite tasks for meetings

#### 3. Enhanced Task Rescheduling Service (`src/services/taskReschedulingService.ts`)
- Considers meetings when rescheduling tasks
- Prioritizes tasks that prepare for upcoming meetings
- Maintains existing task dependencies and user preferences

### Data Models

#### Meeting Interface
```typescript
interface Meeting {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  type: 'work' | 'personal' | 'social' | 'health' | 'education' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  sentiment?: {
    positive: number;
    negative: number;
    neutral: number;
    keywords: string[];
  };
  relatedTaskIds?: string[];
}
```

### UI Components

#### 1. AddMeetingModal (`src/components/AddMeetingModal.tsx`)
- Form for creating and editing meetings
- Date and time pickers
- Type and priority selectors
- Attendee management

#### 2. MeetingItem (`src/components/MeetingItem.tsx`)
- Displays meeting information in the calendar
- Shows sentiment indicators
- Provides status and delete actions
- Color-coded by meeting type

#### 3. Enhanced Calendar Screen (`src/screens/CalendarScreen.tsx`)
- Displays both tasks and meetings
- Separate sections for meetings
- Dual FAB buttons for adding tasks and meetings
- Calendar dots for both tasks and meetings

## Usage Examples

### Creating a Meeting
1. Tap the meeting FAB (people icon) in the calendar
2. Fill in meeting details:
   - Title: "Project Review Meeting"
   - Description: "Review Q1 project progress and plan Q2"
   - Type: Work
   - Priority: High
   - Date and time
   - Location and attendees
3. Save the meeting

### Automatic Task Rescheduling
When a meeting is created:
1. The system analyzes the meeting content for sentiment
2. Identifies related tasks in the same week
3. Reschedules tasks to be completed before the meeting
4. Prioritizes tasks that would make the meeting more productive

### Example Scenario
**Meeting**: "Client Presentation Review" (High Priority, Work)
**Related Tasks Identified**:
- "Prepare presentation slides" → Rescheduled to day before meeting
- "Review client requirements" → Rescheduled to morning of meeting day
- "Update project timeline" → Rescheduled to day before meeting

## Integration with Existing Features

### Task Rescheduling
- Meetings are considered in the task rescheduling algorithm
- Tasks connected to meetings get higher priority
- The system respects existing task dependencies and user preferences

### Calendar Display
- Meetings appear alongside tasks in the calendar view
- Different visual indicators for meetings vs tasks
- Calendar dots show both tasks and meetings

### Goal Alignment
- Meetings can be connected to user goals through related tasks
- The system maintains progress toward goals while accommodating meetings

## Future Enhancements

1. **Recurring Meetings**: Support for weekly, monthly, or custom recurring meetings
2. **Meeting Templates**: Pre-defined meeting types with suggested durations and attendees
3. **Integration**: Calendar integration with external calendar systems
4. **Advanced Analytics**: Meeting effectiveness tracking and optimization suggestions
5. **Collaboration**: Shared meeting scheduling and attendee management

## Technical Notes

- Meetings cannot be rescheduled by the task rescheduling service (as requested)
- Sentiment analysis uses OpenAI's API for natural language processing
- All meeting data is stored locally using AsyncStorage
- The system gracefully handles API failures with fallback behaviors 