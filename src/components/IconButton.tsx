import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface IconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
}

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  onPress,
  size = 24,
  color,
  style,
  variant = 'default',
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.danger,
        };
      default:
        return {};
    }
  };

  const getIconColor = (): string => {
    if (color) return color;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return theme.colors.text.inverse;
      default:
        return theme.colors.text.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        style,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={name}
        size={size}
        color={getIconColor()}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 