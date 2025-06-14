import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

type BadgeVariant = 'primary' | 'secondary' | 'danger' | 'warning';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.danger,
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
        };
    }
  };

  return (
    <View style={[styles.badge, getVariantStyles(), style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    alignSelf: 'flex-start',
  },
  text: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.xs,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
  },
}); 