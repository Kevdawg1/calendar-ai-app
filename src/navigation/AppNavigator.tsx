import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { LifeAdminScreen } from '../screens/LifeAdminScreen';
import { SurveyScreen } from '../screens/SurveyScreen';
import { TaskReviewScreen } from '../screens/TaskReviewScreen';
import { theme } from '../theme';
import { Task } from '../types';
import { LifeAdminTask } from '../data/lifeAdminTasks';
import { userPreferencesService } from '../services/userPreferencesService';

export type RootStackParamList = {
  Home: undefined;
  Calendar: {
    tasks?: (Task | LifeAdminTask)[];
  };
  Goals: undefined;
  LifeAdmin: undefined;
  Survey: undefined;
  TaskReview: { tasks: Task[] };
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const checkSurveyStatus = async () => {
      try {
        const surveyCompleted = await userPreferencesService.isSurveyCompleted();
        setInitialRoute(surveyCompleted ? 'Home' : 'Survey');
      } catch (error) {
        console.error('Error checking survey status:', error);
        setInitialRoute('Survey');
      }
    };

    checkSurveyStatus();
  }, []);

  if (!initialRoute) {
    return null; // Or a loading screen
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
          title: 'Calendar AI',
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
    </Stack.Navigator>
  );
}; 