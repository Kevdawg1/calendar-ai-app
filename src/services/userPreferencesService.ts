import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserPreferences {
  wakeUpTime: Date;
  sleepTime: Date;
  hasWorkSchedule: boolean;
  workSchedule: {
    [key: string]: {
      startTime: Date;
      endTime: Date;
    };
  };
}

const PREFERENCES_STORAGE_KEY = '@user_preferences';
const SURVEY_COMPLETED_KEY = '@survey_completed';

// Helper function to ensure AsyncStorage is ready
const ensureAsyncStorageReady = async (): Promise<void> => {
  try {
    // Test AsyncStorage with a simple operation
    await AsyncStorage.setItem('@test_key', 'test_value');
    await AsyncStorage.removeItem('@test_key');
  } catch (error) {
    console.warn('AsyncStorage not ready, waiting...');
    // Wait a bit and try again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

export const userPreferencesService = {
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await ensureAsyncStorageReady();
      const serializedPreferences = JSON.stringify(preferences, (key, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      });
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, serializedPreferences);
      await AsyncStorage.setItem(SURVEY_COMPLETED_KEY, 'true');
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  },

  async getPreferences(): Promise<UserPreferences | null> {
    try {
      await ensureAsyncStorageReady();
      const serializedPreferences = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (!serializedPreferences) {
        return null;
      }

      const preferences = JSON.parse(serializedPreferences, (key, value) => {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value);
        }
        return value;
      });

      return preferences as UserPreferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  },

  async isSurveyCompleted(): Promise<boolean> {
    try {
      await ensureAsyncStorageReady();
      const surveyCompleted = await AsyncStorage.getItem(SURVEY_COMPLETED_KEY);
      return surveyCompleted === 'true';
    } catch (error) {
      console.error('Error checking survey completion status:', error);
      return false;
    }
  },

  async clearPreferences(): Promise<void> {
    try {
      await ensureAsyncStorageReady();
      await AsyncStorage.removeItem(PREFERENCES_STORAGE_KEY);
      await AsyncStorage.removeItem(SURVEY_COMPLETED_KEY);
    } catch (error) {
      console.error('Error clearing user preferences:', error);
      throw error;
    }
  },
}; 