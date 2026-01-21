import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { ResponsiveNavigator } from './src/navigation/ResponsiveNavigator';
import { ErrorBoundary } from './src/components/display/ErrorBoundary';
import { StyleSheet, View } from 'react-native';

// Enable screens for better performance
enableScreens();

export default function App() {
  console.log('App component initializing...');
  
  return (
    <ErrorBoundary>
      <View style={styles.rootContainer}>
        <SafeAreaProvider style={styles.safeAreaProvider}>
          <NavigationContainer>
            <ResponsiveNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    minWidth: '100%',
    backgroundColor: '#2a2a2a',
    // Force full width
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeAreaProvider: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
  },
  navigationContainer: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
  },
});
