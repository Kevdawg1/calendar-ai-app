import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../buttons/Button';
import { theme } from '../../theme';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  style,
}) => {
  const containerStyle: ViewStyle = {
    ...styles.container,
    ...(style || {}),
  };

  return (
    <View style={containerStyle}>
      <Ionicons
        name="alert-circle"
        size={64}
        color={theme.colors.danger}
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  icon: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.sizes.lg,
  },
  button: {
    minWidth: 120,
  },
}); 