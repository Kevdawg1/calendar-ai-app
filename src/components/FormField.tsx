import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  children,
  style,
}) => {
  const containerStyle: ViewStyle = {
    ...styles.container,
    ...(style || {}),
  };

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: '500' as const,
  },
  error: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.danger,
    marginTop: theme.spacing.xs,
  },
}); 