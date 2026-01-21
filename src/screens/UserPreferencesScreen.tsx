import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { sharedStyles } from '../theme/styles';
import { Section } from '../components/layout/Section';
import { Button } from '../components/buttons/Button';
import { UserPreferences } from '../components/display/UserPreferences';
import { userPreferencesService, UserPreferences as UserPreferencesType } from '../services/userPreferencesService';
import { theme } from '../theme';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const UserPreferencesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [preferences, setPreferences] = useState<UserPreferencesType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const userPrefs = await userPreferencesService.getPreferences();
      setPreferences(userPrefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh preferences when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadPreferences();
    }, [])
  );

  const handleEditPress = () => {
    navigation.navigate('Survey');
  };

  if (loading) {
    return (
      <SafeAreaView style={sharedStyles.container}>
        <View style={sharedStyles.safeAreaContainer}>
          <View style={[sharedStyles.content, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={sharedStyles.description}>Loading preferences...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!preferences) {
    return (
      <SafeAreaView style={sharedStyles.container}>
        <View style={sharedStyles.safeAreaContainer}>
          <View style={[sharedStyles.content, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={sharedStyles.description}>No preferences found. Please complete the survey.</Text>
            <Button
              title="Complete Survey"
              onPress={handleEditPress}
              style={{ marginTop: theme.spacing.lg }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={sharedStyles.container}>
      <View style={sharedStyles.safeAreaContainer}>
        <UserPreferences preferences={preferences} />
        <View style={[sharedStyles.buttonContainerFixed, { justifyContent: 'center' }]}>
          <Button
            title="Edit Preferences"
            onPress={handleEditPress}
            style={sharedStyles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}; 