import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types';
import { format } from 'date-fns';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

export interface NotificationSettings {
  enabled: boolean;
}

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (settings) {
        return JSON.parse(settings);
      }
      return { enabled: false };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return { enabled: false };
    }
  },

  async setNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw error;
    }
  },

  async sendTestNotification(): Promise<void> {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings.enabled) {
        return;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification from AI-Cal',
        },
        trigger: null, // Immediate notification
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  },

  async scheduleTaskNotification(task: Task): Promise<string | null> {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings.enabled) {
        return null;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Ensure task has start time
      if (!task.startTime) {
        console.warn('Task has no start time, cannot schedule notification');
        return null;
      }

      // Convert string time to Date object
      const startDate = new Date(task.startDate);
      const [startHour, startMinute] = task.startTime.split(':').map(Number);
      const notificationDate = new Date(startDate);
      notificationDate.setHours(startHour, startMinute, 0, 0);

      // For now, send an immediate notification as a placeholder
      // TODO: Implement proper scheduled notifications when expo-notifications types are resolved
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Scheduled',
          body: `${task.title} scheduled for ${format(notificationDate, 'h:mm a')}`,
          data: { taskId: task.id },
        },
        trigger: null, // Immediate notification for now
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling task notification:', error);
      return null;
    }
  },

  async cancelTaskNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling task notification:', error);
    }
  },

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  },

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  },
}; 