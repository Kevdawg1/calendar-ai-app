import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { sharedStyles } from '../theme/styles';
import { homeScreenTabletStyles } from '../styles/screens';
import { OnboardingModal } from '../components/modals/OnboardingModal';
import { userPreferencesService } from '../services/userPreferencesService';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { 
  getResponsiveValue, 
  getResponsiveFontSize,
  getResponsiveIconSize,
  getOptimalTabletMargins,
  getTabletContentPadding,
  isTablet,
  debugDeviceInfo
} from '../utils/deviceUtils';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const IS_FIRST_TIME_USER_KEY = '@is_first_time_user';

const HomeScreenTablet = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Debug device info on component mount
  useEffect(() => {
    debugDeviceInfo();
  }, []);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const surveyCompleted = await userPreferencesService.isSurveyCompleted();
        const isFirstTimeUser = await AsyncStorage.getItem(IS_FIRST_TIME_USER_KEY);

        if (surveyCompleted && isFirstTimeUser !== 'false') {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, []);

  const handleOnboardingClose = async () => {
    try {
      await AsyncStorage.setItem(IS_FIRST_TIME_USER_KEY, 'false');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const menuItems = [
    {
      title: 'View Calendar',
      subtitle: 'Manage your daily schedule and tasks',
      icon: 'calendar-outline' as const,
      onPress: () => navigation.navigate('Calendar', {}),
      color: theme.colors.primary,
    },
    {
      title: 'Manage Goals',
      subtitle: 'Set and track your personal goals',
      icon: 'trophy-outline' as const,
      onPress: () => navigation.navigate('Goals'),
      color: '#FF9500',
    },
    {
      title: 'Life Admin',
      subtitle: 'Organize household and personal tasks',
      icon: 'list-circle-outline' as const,
      onPress: () => navigation.navigate('LifeAdmin'),
      color: '#34C759',
    },
    {
      title: 'Settings',
      subtitle: 'Customize your app preferences',
      icon: 'settings-outline' as const,
      onPress: () => navigation.navigate('Settings'),
      color: '#5856D6',
    },
  ];

  return (
    <SafeAreaView style={sharedStyles.tabletContainer}>
      <ScrollView style={homeScreenTabletStyles.scrollView} contentContainerStyle={homeScreenTabletStyles.scrollContent}>
        <View style={homeScreenTabletStyles.header}>
          <Text style={homeScreenTabletStyles.title}>AI-Cal Tablet</Text>
          <Text style={homeScreenTabletStyles.subtitle}>
            Intelligent calendar assistant for tablets
          </Text>

        </View>

        <View style={homeScreenTabletStyles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[homeScreenTabletStyles.menuItem, { backgroundColor: item.color }]}
              onPress={item.onPress}
            >
              <View style={homeScreenTabletStyles.menuItemContent}>
                <View style={homeScreenTabletStyles.iconContainer}>
                  <Ionicons name={item.icon} size={getResponsiveIconSize(24, 32)} color="#fff" />
                </View>
                <View style={homeScreenTabletStyles.textContainer}>
                  <Text style={homeScreenTabletStyles.menuItemTitle}>{item.title}</Text>
                  <Text style={homeScreenTabletStyles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={getResponsiveIconSize(20, 24)} color="#fff" style={homeScreenTabletStyles.arrow} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={homeScreenTabletStyles.infoSection}>
          <Text style={homeScreenTabletStyles.infoTitle}>Device Information</Text>
          <Text style={homeScreenTabletStyles.infoText}>
            This app automatically detects your device type and optimizes the layout accordingly.
            You're currently viewing the tablet-optimized interface with larger touch targets,
            enhanced spacing, and multi-panel layouts.
          </Text>
        </View>
      </ScrollView>

      <OnboardingModal
        isVisible={showOnboarding}
        onClose={handleOnboardingClose}
      />
    </SafeAreaView>
  );
};

export default HomeScreenTablet; 