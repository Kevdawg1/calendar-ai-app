import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GoalsScreen from '../screens/GoalsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TaskEditScreen from '../screens/TaskEditScreen';
import { Task } from '../types';

export type RootStackParamList = {
  Goals: undefined;
  Calendar: { tasks?: Task[] };
  TaskEdit: { taskId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Goals"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Goals"
          component={GoalsScreen}
          options={{
            title: 'Life Goals',
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
          name="TaskEdit"
          component={TaskEditScreen}
          options={{
            title: 'Edit Task',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 