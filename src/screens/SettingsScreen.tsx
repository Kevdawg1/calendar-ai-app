import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
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

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const clearAllAsyncStorage = async () => {
    try {
      // Get all keys from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      
      // Filter keys that belong to our app (start with @calendar_ai_ or @user_ or @survey_ or @checked_)
      const appKeys = keys.filter(key => 
        key.startsWith('@calendar_ai_') || 
        key.startsWith('@user_') || 
        key.startsWith('@survey_') || 
        key.startsWith('@checked_') ||
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
                      // Navigate back to Survey screen
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Survey' }],
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
    <View style={sharedStyles.container}>
      <ScrollView style={sharedStyles.content}>
        <Section title="Settings">
          <Text style={[sharedStyles.description, { marginBottom: theme.spacing.lg }]}>
            Manage your app settings and data.
          </Text>
          
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