import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { sharedStyles } from '../theme/styles';
import { Section } from '../components/Section';
import { Button } from '../components/Button';
import { taskService } from '../services/taskService';
import { goalService } from '../services/goalService';
import { userPreferencesService } from '../services/userPreferencesService';
import { checkedTasksService } from '../services/checkedTasksService';
import { theme } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingModal } from '../components/OnboardingModal';

const MENU_OPTIONS = [
  { key: 'userPreferences', label: 'User Preferences', onPress: (navigation: NavigationProp) => navigation.navigate('UserPreferences') },
  { key: 'syncAccounts', label: 'Sync Accounts', onPress: (_navigation: NavigationProp) => {} },
  { key: 'notifications', label: 'Notifications', onPress: (navigation: NavigationProp) => navigation.navigate('NotificationSettings') },
  { key: 'showTutorial', label: 'Show Tutorial', onPress: (_navigation: NavigationProp, setShowOnboarding: (show: boolean) => void) => setShowOnboarding(true) },
  { key: 'leaveReview', label: 'Leave a Review', onPress: (_navigation: NavigationProp) => {} },
];

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  const clearAllAsyncStorage = async () => {
    try {
      // Get all keys from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      
      // Filter keys that belong to our app (start with @calendar_ai_ or @user_ or @survey_ or @checked_ or @is_first_time_user)
      const appKeys = keys.filter(key => 
        key.startsWith('@calendar_ai_') || 
        key.startsWith('@user_') || 
        key.startsWith('@survey_') || 
        key.startsWith('@checked_') ||
        key === '@is_first_time_user' ||
        key === 'tasks' ||
        key === 'goals'
      );
      
      // Remove all app-related keys
      if (appKeys.length > 0) {
        await AsyncStorage.multiRemove(appKeys);
        console.log(`Cleared ${appKeys.length} AsyncStorage keys:`, appKeys);
      }
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      throw error;
    }
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will delete all your tasks, goals, and settings. This action cannot be undone. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all AsyncStorage data first
              await clearAllAsyncStorage();
              
              // Then clear service data in memory
              await Promise.all([
                taskService.clearAllTasks(),
                goalService.clearAllGoals(),
                userPreferencesService.clearPreferences(),
                checkedTasksService.clearCheckedTasks(),
              ]);
              
              Alert.alert(
                'Success',
                'App has been reset successfully. All data has been cleared.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to Welcome screen
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Welcome' }],
                      });
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Error resetting app:', error);
              Alert.alert('Error', 'Failed to reset app. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <View style={sharedStyles.safeAreaContainer}>
        <ScrollView style={sharedStyles.content}>
          <Section title="Settings">
            <Text style={[sharedStyles.description, { marginBottom: theme.spacing.lg }]}>
              Manage your app settings and data.
            </Text>
            
            <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, overflow: 'hidden', marginBottom: theme.spacing.xl }}>
              {MENU_OPTIONS.map((option, idx) => (
                <TouchableOpacity
                  key={option.key}
                  style={sharedStyles.listItem}
                  onPress={() => option.onPress(navigation, setShowOnboarding)}
                  activeOpacity={0.7}
                >
                  <Text style={sharedStyles.listItemText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.dangerZone}>
              <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
              <Text style={styles.dangerZoneDescription}>
                These actions cannot be undone. Please be certain.
              </Text>
              <Button
                title="Reset App"
                onPress={handleResetApp}
                style={styles.resetButton}
                variant="danger"
              />
            </View>
          </Section>
        </ScrollView>
      </View>
      {showOnboarding && (
        <OnboardingModal
          isVisible={showOnboarding}
          onClose={handleOnboardingClose}
        />
      )}
    </SafeAreaView>
  );
};

const styles = {
  dangerZone: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  dangerZoneTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.danger,
    marginBottom: theme.spacing.sm,
  },
  dangerZoneDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  resetButton: {
    backgroundColor: theme.colors.danger,
  },
}; 