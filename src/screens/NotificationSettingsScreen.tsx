import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { sharedStyles } from '../theme/styles';
import { Section } from '../components/Section';
import { Button } from '../components/Button';
import { notificationService, NotificationSettings } from '../services/notificationService';
import { theme } from '../theme';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const NotificationSettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [settings, setSettings] = useState<NotificationSettings>({ enabled: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const notificationSettings = await notificationService.getNotificationSettings();
      setSettings(notificationSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    try {
      const newSettings = { enabled: value };
      await notificationService.setNotificationSettings(newSettings);
      setSettings(newSettings);

      if (value) {
        // Request permissions when enabling
        const hasPermission = await notificationService.requestPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive task reminders.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Notifications Enabled',
            'You will now receive notifications for upcoming tasks.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Cancel all notifications when disabling
        await notificationService.cancelAllNotifications();
        Alert.alert(
          'Notifications Disabled',
          'You will no longer receive task notifications.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      Alert.alert('Test Notification', 'A test notification has been sent.');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={sharedStyles.container}>
        <View style={sharedStyles.safeAreaContainer}>
          <View style={[sharedStyles.content, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={sharedStyles.description}>Loading settings...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={sharedStyles.container}>
      <View style={sharedStyles.safeAreaContainer}>
        <Section title="Push Notifications" style={{ marginTop: 0 }}>
          <View style={sharedStyles.stepContainer}>
            <Text style={sharedStyles.description}>
              Enable push notifications to receive reminders for upcoming tasks.
            </Text>
            
            <View style={[sharedStyles.summaryContainer, { marginTop: theme.spacing.lg }]}>
              <View style={[sharedStyles.summaryItem, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <Text style={sharedStyles.summaryLabel}>Enable Notifications</Text>
                <Switch
                  value={settings.enabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={settings.enabled ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>

            {settings.enabled && (
              <View style={{ marginTop: theme.spacing.lg }}>
                <Button
                  title="Send Test Notification"
                  onPress={handleTestNotification}
                  style={sharedStyles.button}
                />
              </View>
            )}
          </View>
        </Section>
      </View>
    </SafeAreaView>
  );
}; 