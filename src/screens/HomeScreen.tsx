import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';
import { Button } from '../components/Button';
import { Section } from '../components/Section';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Section title="Welcome to Calendar AI">
        <Text style={styles.description}>
          Manage your tasks, goals, and life admin tasks all in one place.
        </Text>
        <Button
          title="View Calendar"
          onPress={() => navigation.navigate('Calendar', {})}
          style={styles.button}
        />
        <Button
          title="Manage Goals"
          onPress={() => navigation.navigate('Goals')}
          style={styles.button}
        />
        <Button
          title="Life Admin Tasks"
          onPress={() => navigation.navigate('LifeAdmin')}
          style={styles.button}
        />
      </Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  button: {
    marginBottom: theme.spacing.md,
  },
});

export default HomeScreen; 