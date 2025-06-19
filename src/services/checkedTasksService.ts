import AsyncStorage from '@react-native-async-storage/async-storage';

const CHECKED_TASKS_KEY = '@checked_tasks';

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

export const checkedTasksService = {
  getCheckedTasks: async (): Promise<Set<string>> => {
    try {
      await ensureAsyncStorageReady();
      const checkedTasksJson = await AsyncStorage.getItem(CHECKED_TASKS_KEY);
      if (checkedTasksJson) {
        const checkedTasksArray = JSON.parse(checkedTasksJson);
        return new Set(checkedTasksArray);
      }
      return new Set();
    } catch (error) {
      console.error('Error getting checked tasks:', error);
      return new Set();
    }
  },

  saveCheckedTasks: async (checkedTasks: Set<string>): Promise<void> => {
    try {
      await ensureAsyncStorageReady();
      const checkedTasksArray = Array.from(checkedTasks);
      await AsyncStorage.setItem(CHECKED_TASKS_KEY, JSON.stringify(checkedTasksArray));
    } catch (error) {
      console.error('Error saving checked tasks:', error);
    }
  },

  addCheckedTask: async (taskId: string): Promise<void> => {
    try {
      const checkedTasks = await checkedTasksService.getCheckedTasks();
      checkedTasks.add(taskId);
      await checkedTasksService.saveCheckedTasks(checkedTasks);
    } catch (error) {
      console.error('Error adding checked task:', error);
    }
  },

  removeCheckedTask: async (taskId: string): Promise<void> => {
    try {
      const checkedTasks = await checkedTasksService.getCheckedTasks();
      checkedTasks.delete(taskId);
      await checkedTasksService.saveCheckedTasks(checkedTasks);
    } catch (error) {
      console.error('Error removing checked task:', error);
    }
  },

  clearCheckedTasks: async (): Promise<void> => {
    try {
      await ensureAsyncStorageReady();
      await AsyncStorage.removeItem(CHECKED_TASKS_KEY);
    } catch (error) {
      console.error('Error clearing checked tasks:', error);
    }
  }
}; 