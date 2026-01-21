import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Section } from '../components/layout/Section';
import { RootStackParamList } from '../navigation/AppNavigator';
import { sharedStyles } from '../theme/styles';
import { homeScreenStyles } from '../styles/screens';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useOrientation } from '../hooks/useOrientation';
import { OnboardingModal } from '../components/modals/OnboardingModal';
import { userPreferencesService } from '../services/userPreferencesService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const IS_FIRST_TIME_USER_KEY = '@is_first_time_user';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { shouldUseTablet } = useOrientation();

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
      icon: 'calendar-outline' as const,
      onPress: () => navigation.navigate('Calendar', {}),
      color: theme.colors.primary,
    },
    {
      title: 'Manage Goals',
      icon: 'trophy-outline' as const,
      onPress: () => navigation.navigate('Goals'),
      color: '#FF9500',
    },
    {
      title: 'Life Admin',
      icon: 'list-circle-outline' as const,
      onPress: () => navigation.navigate('LifeAdmin'),
      color: '#34C759',
    },
    {
      title: 'Settings',
      icon: 'settings-outline' as const,
      onPress: () => navigation.navigate('Settings'),
      color: '#5856D6',
    },
  ];

  return (
    <SafeAreaView style={sharedStyles.container}>
              <View style={shouldUseTablet ? sharedStyles.tabletSafeAreaContainer : sharedStyles.safeAreaContainer}>
        <Section title="Welcome to AI-Cal">
          <Text style={sharedStyles.description}>
            Manage your tasks, goals, and life admin tasks all in one place.
          </Text>
          <View style={homeScreenStyles.gridContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                style={[homeScreenStyles.gridItem, { backgroundColor: item.color }]}
                onPress={item.onPress}
              >
                <Ionicons name={item.icon} size={40} color="#fff" />
                <Text style={homeScreenStyles.gridItemText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>
        <OnboardingModal
          isVisible={showOnboarding}
          onClose={handleOnboardingClose}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen; 