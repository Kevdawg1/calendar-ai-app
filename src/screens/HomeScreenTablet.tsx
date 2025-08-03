import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { sharedStyles } from '../theme/styles';
import { OnboardingModal } from '../components/OnboardingModal';
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>AI-Cal Tablet</Text>
          <Text style={styles.subtitle}>
            Intelligent calendar assistant for tablets
          </Text>
          <View style={styles.tabletIndicator}>
            <Text style={styles.tabletIndicatorText}>📱 Tablet Optimized Layout</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: item.color }]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon} size={getResponsiveIconSize(24, 32)} color="#fff" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={getResponsiveIconSize(20, 24)} color="#fff" style={styles.arrow} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Device Information</Text>
          <Text style={styles.infoText}>
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

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: getOptimalTabletMargins(),
    paddingVertical: getTabletContentPadding(),
  },
  header: {
    alignItems: 'center',
    marginBottom: getResponsiveValue(32, 48),
    paddingTop: getResponsiveValue(20, 32),
  },
  title: {
    fontSize: getResponsiveFontSize(28, 36),
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: getResponsiveValue(8, 12),
  },
  subtitle: {
    fontSize: getResponsiveFontSize(16, 20),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: getResponsiveFontSize(22, 28),
    maxWidth: 600,
  },
  menuContainer: {
    marginBottom: getResponsiveValue(32, 48),
  },
  menuItem: {
    borderRadius: 16,
    marginBottom: getResponsiveValue(16, 20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveValue(20, 28),
  },
  iconContainer: {
    width: getResponsiveValue(60, 80),
    height: getResponsiveValue(60, 80),
    borderRadius: getResponsiveValue(30, 40),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveValue(16, 20),
  },
  textContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: getResponsiveFontSize(20, 24),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: getResponsiveValue(4, 6),
  },
  menuItemSubtitle: {
    fontSize: getResponsiveFontSize(14, 16),
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: getResponsiveFontSize(18, 20),
  },
  arrow: {
    opacity: 0.8,
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: getResponsiveValue(20, 24),
    marginTop: getResponsiveValue(16, 20),
  },
  infoTitle: {
    fontSize: getResponsiveFontSize(18, 20),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: getResponsiveValue(8, 12),
  },
  infoText: {
    fontSize: getResponsiveFontSize(14, 16),
    color: theme.colors.text.secondary,
    lineHeight: getResponsiveFontSize(20, 22),
  },
  tabletIndicator: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: getResponsiveValue(12, 16),
    paddingVertical: getResponsiveValue(6, 8),
    borderRadius: 20,
    marginTop: getResponsiveValue(8, 12),
  },
  tabletIndicatorText: {
    color: '#fff',
    fontSize: getResponsiveFontSize(12, 14),
    fontWeight: '600',
  },
});

export default HomeScreenTablet; 