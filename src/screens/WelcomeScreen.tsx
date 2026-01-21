import React from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { sharedStyles } from '../theme/styles';
import { welcomeScreenStyles } from '../styles/screens';
import { Button } from '../components/buttons/Button';
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
      <View style={welcomeScreenStyles.welcomeContainer}>
        <View style={welcomeScreenStyles.content}>
          <View style={welcomeScreenStyles.imageContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={welcomeScreenStyles.welcomeImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={welcomeScreenStyles.textContainer}>
            <Text style={welcomeScreenStyles.title}>Welcome to AI-Cal</Text>
            <Text style={welcomeScreenStyles.subtitle}>
              Your intelligent calendar assistant that helps you organize tasks, manage goals, and optimize your time.
            </Text>
            <Text style={welcomeScreenStyles.description}>
              Let's get started by setting up your preferences to create a personalized experience just for you.
            </Text>
          </View>
        </View>

        <View style={welcomeScreenStyles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            style={welcomeScreenStyles.getStartedButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}; 