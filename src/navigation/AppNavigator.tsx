import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { LifeAdminScreen } from '../screens/LifeAdminScreen';
import { SurveyScreen } from '../screens/SurveyScreen';
import { TaskReviewScreen } from '../screens/TaskReviewScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { theme } from '../theme';
import { Task } from '../types';
import { LifeAdminTask } from '../data/lifeAdminTasks';
import { userPreferencesService } from '../services/userPreferencesService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RootStackParamList = {
  Welcome: undefined;
  Survey: undefined;
  Home: undefined;
  Calendar: {
    tasks?: (Task | LifeAdminTask)[];
  };
  Goals: undefined;
  LifeAdmin: undefined;
  TaskReview: { tasks: Task[] };
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const IS_FIRST_TIME_USER_KEY = '@is_first_time_user';

export const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('AppNavigator component initializing...');

  useEffect(() => {
    console.log('AppNavigator useEffect running...');
    const checkUserStatus = async () => {
      try {
        console.log('Starting user status check...');
        setIsLoading(true);
        // Add a small delay to ensure AsyncStorage is properly initialized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('Checking if user has seen welcome screen...');
        const hasSeenWelcome = await AsyncStorage.getItem(IS_FIRST_TIME_USER_KEY);
        console.log('Has seen welcome:', hasSeenWelcome);
        
        if (hasSeenWelcome !== 'true') {
          // First-time user - show welcome screen
          setInitialRoute('Welcome');
        } else {
          console.log('Checking if survey is completed...');
          const surveyCompleted = await userPreferencesService.isSurveyCompleted();
          console.log('Survey completed:', surveyCompleted);
          setInitialRoute(surveyCompleted ? 'Home' : 'Survey');
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        // Default to Welcome screen on error
        setInitialRoute('Welcome');
      } finally {
        console.log('User status check completed');
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  console.log('AppNavigator render - isLoading:', isLoading, 'initialRoute:', initialRoute);

  if (isLoading || !initialRoute) {
    console.log('Showing loading screen...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontWeight: theme.typography.weights.bold,
        },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          title: 'Welcome to AI-Cal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Survey"
        component={SurveyScreen}
        options={{
          title: 'Welcome',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'AI-Cal',
          headerLeft: () => null, // Disable back button on Home screen
        }}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'Calendar',
        }}
      />
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          title: 'Goals',
        }}
      />
      <Stack.Screen
        name="LifeAdmin"
        component={LifeAdminScreen}
        options={{
          title: 'Life Admin',
        }}
      />
      <Stack.Screen
        name="TaskReview"
        component={TaskReviewScreen}
        options={{
          title: 'Review Tasks',
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
}; 