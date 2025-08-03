import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Section } from '../components/Section';
import { RootStackParamList } from '../navigation/AppNavigator';
import { sharedStyles } from '../theme/styles';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { shouldUseTabletLayout } from '../utils/deviceUtils';
import { OnboardingModal } from '../components/OnboardingModal';
import { userPreferencesService } from '../services/userPreferencesService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const IS_FIRST_TIME_USER_KEY = '@is_first_time_user';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showOnboarding, setShowOnboarding] = useState(false);

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
              <View style={shouldUseTabletLayout() ? sharedStyles.tabletSafeAreaContainer : sharedStyles.safeAreaContainer}>
        <Section title="Welcome to AI-Cal">
          <Text style={sharedStyles.description}>
            Manage your tasks, goals, and life admin tasks all in one place.
          </Text>
          <View style={styles.gridContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                style={[styles.gridItem, { backgroundColor: item.color }]}
                onPress={item.onPress}
              >
                <Ionicons name={item.icon} size={40} color="#fff" />
                <Text style={styles.gridItemText}>{item.title}</Text>
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

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gridItemText: {
    color: '#fff',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});

export default HomeScreen; 