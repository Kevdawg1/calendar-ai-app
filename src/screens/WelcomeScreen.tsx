import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { sharedStyles } from '../theme/styles';
import { Button } from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const IS_FIRST_TIME_USER_KEY = '@is_first_time_user';

export const WelcomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleGetStarted = async () => {
    try {
      // Mark that the user has seen the welcome screen
      await AsyncStorage.setItem(IS_FIRST_TIME_USER_KEY, 'true');
      navigation.navigate('Survey');
    } catch (error) {
      console.error('Error saving welcome screen status:', error);
      // Still navigate even if saving fails
      navigation.navigate('Survey');
    }
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <View style={styles.welcomeContainer}>
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.welcomeImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>Welcome to AI-Cal</Text>
            <Text style={styles.subtitle}>
              Your intelligent calendar assistant that helps you organize tasks, manage goals, and optimize your time.
            </Text>
            <Text style={styles.description}>
              Let's get started by setting up your preferences to create a personalized experience just for you.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            style={styles.getStartedButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  welcomeImage: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.lg,
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    paddingBottom: theme.spacing.xl,
  },
  getStartedButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
}); 