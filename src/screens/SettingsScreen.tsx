import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { sharedStyles } from '../theme/styles';
import { Section } from '../components/Section';

export const SettingsScreen = () => {
  return (
    <View style={sharedStyles.container}>
      <ScrollView style={sharedStyles.content}>
        <Section title="Settings">
          <Text style={sharedStyles.description}>
            Settings screen content will go here.
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}; 