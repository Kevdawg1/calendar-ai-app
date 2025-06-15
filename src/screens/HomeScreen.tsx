import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button } from '../components/Button';
import { Section } from '../components/Section';
import { RootStackParamList } from '../navigation/AppNavigator';
import { sharedStyles } from '../theme/styles';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={sharedStyles.container}>
      <Section title="Welcome to Calendar AI">
        <Text style={sharedStyles.emptyStateText}>
          Manage your tasks, goals, and life admin tasks all in one place.
        </Text>
        <Button
          title="View Calendar"
          onPress={() => navigation.navigate('Calendar', {})}
          style={sharedStyles.button}
        />
        <Button
          title="Manage Goals"
          onPress={() => navigation.navigate('Goals')}
          style={sharedStyles.button}
        />
        <Button
          title="Life Admin Tasks"
          onPress={() => navigation.navigate('LifeAdmin')}
          style={sharedStyles.button}
        />
      </Section>
    </View>
  );
};

export default HomeScreen; 