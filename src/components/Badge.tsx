import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

export interface BadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, color = theme.colors.primary, style }) => {
  return (
    <View style={[styles.container, { backgroundColor: color }, style]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.white,
    fontWeight: theme.typography.weights.medium,
  },
}); 