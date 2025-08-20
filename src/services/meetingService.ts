import { Meeting, MeetingUpdate } from '../types';
import { generateUUID } from '../utils/uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sentimentAnalysisService } from './sentimentAnalysisService';

const MEETINGS_STORAGE_KEY = '@calendar_ai_meetings';

// Initialize meetings from storage
let meetings: Meeting[] = [];
let isInitialized = false;

// Helper function to ensure AsyncStorage is ready
const ensureAsyncStorageReady = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('@test_key', 'test_value');
    await AsyncStorage.removeItem('@test_key');
  } catch (error) {
    console.warn('AsyncStorage not ready, waiting...');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

// Load meetings from AsyncStorage
const loadMeetings = async (): Promise<void> => {
  try {
    await ensureAsyncStorageReady();
    const storedMeetings = await AsyncStorage.getItem(MEETINGS_STORAGE_KEY);
    if (storedMeetings) {
      meetings = JSON.parse(storedMeetings);
      console.log('Loaded meetings from storage:', meetings.length);
    } else {
      meetings = [];
      console.log('No meetings found in storage, initializing empty array');
    }
    isInitialized = true;
  } catch (error) {
    console.error('Error loading meetings:', error);
    meetings = [];
    isInitialized = true;
  }
};

// Save meetings to AsyncStorage
const saveMeetings = async (): Promise<void> => {
  try {
    await ensureAsyncStorageReady();
    await AsyncStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(meetings));
    console.log('Saved meetings to storage:', meetings.length);
  } catch (error) {
    console.error('Error saving meetings:', error);
  }
};

export const meetingService = {
  getAllMeetings: async (): Promise<Meeting[]> => {
    if (!isInitialized) {
      await loadMeetings();
    }
    return [...meetings];
  },

  getMeeting: async (meetingId: string): Promise<Meeting | undefined> => {
    if (!isInitialized) {
      await loadMeetings();
    }
    return meetings.find(meeting => meeting.id === meetingId);
  },

  getMeetingsByDate: async (date: string): Promise<Meeting[]> => {
    if (!isInitialized) {
      await loadMeetings();
    }
    return meetings.filter(meeting => meeting.startDate === date);
  },

  getMeetingsByWeek: async (startDate: string, endDate: string): Promise<Meeting[]> => {
    if (!isInitialized) {
      await loadMeetings();
    }
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return meetingDate >= start && meetingDate <= end;
    });
  },

  addMeeting: async (newMeeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> => {
    if (!isInitialized) {
      await loadMeetings();
    }

    const meetingWithMetadata = {
      ...newMeeting,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Analyze sentiment for the meeting
    const meetingWithSentiment = await sentimentAnalysisService.updateMeetingSentiment(meetingWithMetadata);

    meetings.push(meetingWithSentiment);
    await saveMeetings();
    
    console.log('Added new meeting:', meetingWithSentiment);
    return meetingWithSentiment;
  },

  updateMeeting: async (meetingId: string, updates: MeetingUpdate): Promise<Meeting | undefined> => {
    if (!isInitialized) {
      await loadMeetings();
    }

    const meetingIndex = meetings.findIndex(meeting => meeting.id === meetingId);
    if (meetingIndex === -1) return undefined;

    const updatedMeeting = {
      ...meetings[meetingIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Re-analyze sentiment if title or description changed
    if (updates.title || updates.description) {
      const meetingWithSentiment = await sentimentAnalysisService.updateMeetingSentiment(updatedMeeting);
      meetings[meetingIndex] = meetingWithSentiment;
    } else {
      meetings[meetingIndex] = updatedMeeting;
    }

    await saveMeetings();
    return meetings[meetingIndex];
  },

  deleteMeeting: async (meetingId: string): Promise<void> => {
    if (!isInitialized) {
      await loadMeetings();
    }
    meetings = meetings.filter(meeting => meeting.id !== meetingId);
    await saveMeetings();
  },

  addMeetings: async (newMeetings: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Meeting[]> => {
    if (!isInitialized) {
      await loadMeetings();
    }

    const meetingsWithMetadata = await Promise.all(
      newMeetings.map(async (meeting) => {
        const meetingWithMetadata = {
          ...meeting,
          id: generateUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return await sentimentAnalysisService.updateMeetingSentiment(meetingWithMetadata);
      })
    );

    meetings.push(...meetingsWithMetadata);
    await saveMeetings();
    
    console.log('Added multiple meetings:', meetingsWithMetadata.length);
    return meetingsWithMetadata;
  },

  // Get meetings that might be related to a specific task
  getRelatedMeetings: async (taskTitle: string, taskDescription?: string): Promise<Meeting[]> => {
    if (!isInitialized) {
      await loadMeetings();
    }

    // Simple keyword matching for now - could be enhanced with AI analysis
    const searchText = `${taskTitle} ${taskDescription || ''}`.toLowerCase();
    
    return meetings.filter(meeting => {
      const meetingText = `${meeting.title} ${meeting.description || ''}`.toLowerCase();
      
      // Check for common keywords
      const commonWords = searchText.split(' ').filter(word => word.length > 3);
      return commonWords.some(word => meetingText.includes(word));
    });
  },

  // Get meetings that might affect task scheduling in a given week
  getMeetingsAffectingWeek: async (startDate: string, endDate: string): Promise<Meeting[]> => {
    if (!isInitialized) {
      await loadMeetings();
    }

    const weekMeetings = await meetingService.getMeetingsByWeek(startDate, endDate);
    
    // Filter for meetings that might affect task scheduling (high priority, work-related, etc.)
    return weekMeetings.filter(meeting => 
      meeting.priority === 'high' || 
      meeting.type === 'work' || 
      meeting.status === 'scheduled'
    );
  },

  // Initialize the service
  initialize: async (): Promise<void> => {
    if (!isInitialized) {
      await loadMeetings();
    }
  }
}; 