import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import TaskEditScreen from '../screens/TaskEditScreen';
import { LifeAdminScreen } from '../screens/LifeAdminScreen';
import { theme } from '../theme';
import { Task } from '../types';
import { LifeAdminTask } from '../data/lifeAdminTasks';

export type RootStackParamList = {
  Home: undefined;
  Calendar: {
    tasks?: (Task | LifeAdminTask)[];
  };
  Goals: undefined;
  TaskEdit: {
    taskId?: string;
  };
  LifeAdmin: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
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
        name="TaskEdit"
        component={TaskEditScreen}
        options={{
          title: 'Edit Task',
        }}
      />
      <Stack.Screen
        name="LifeAdmin"
        component={LifeAdminScreen}
        options={{
          title: 'Life Admin',
        }}
      />
    </Stack.Navigator>
  );
}; 