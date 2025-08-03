import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { shouldUseTabletLayout } from '../utils/deviceUtils';

// Phone screens
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { LifeAdminScreen } from '../screens/LifeAdminScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { UserPreferencesScreen } from '../screens/UserPreferencesScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { TaskReviewScreen } from '../screens/TaskReviewScreen';
import { SurveyScreen } from '../screens/SurveyScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';

// Tablet screens
import HomeScreenTablet from '../screens/HomeScreenTablet';
import CalendarScreenTablet from '../screens/CalendarScreenTablet';
import { GoalsScreenTablet } from '../screens/GoalsScreenTablet';
import { LifeAdminScreenTablet } from '../screens/LifeAdminScreenTablet';

import { RootStackParamList } from './AppNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export const ResponsiveNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
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
        name="Welcome" 
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="Survey" 
        component={SurveyScreen}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="Home" 
        component={shouldUseTabletLayout() ? HomeScreenTablet : HomeScreen}
        options={{ title: 'AI-Cal' }}
      />
      
      <Stack.Screen 
        name="Calendar" 
        component={shouldUseTabletLayout() ? CalendarScreenTablet : CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      
      <Stack.Screen 
        name="Goals" 
        component={shouldUseTabletLayout() ? GoalsScreenTablet : GoalsScreen}
        options={{ title: 'Goals' }}
      />
      
      <Stack.Screen 
        name="LifeAdmin" 
        component={shouldUseTabletLayout() ? LifeAdminScreenTablet : LifeAdminScreen}
        options={{ title: 'Life Admin' }}
      />
      
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      
      <Stack.Screen 
        name="UserPreferences" 
        component={UserPreferencesScreen}
        options={{ title: 'User Preferences' }}
      />
      
      <Stack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
        options={{ title: 'Notifications' }}
      />
      
      <Stack.Screen 
        name="TaskReview" 
        component={TaskReviewScreen}
        options={{ title: 'Task Review' }}
      />
    </Stack.Navigator>
  );
}; 