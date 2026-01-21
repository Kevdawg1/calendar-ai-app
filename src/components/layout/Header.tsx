import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconButton } from '../buttons/IconButton';
import { theme } from '../../theme';

interface HeaderProps {
  title: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  style,
}) => {
  const containerStyle: ViewStyle = {
    ...styles.container,
    ...(style || {}),
  };

  return (
    <View style={containerStyle}>
      <View style={styles.left}>
        {leftIcon && onLeftPress && (
          <IconButton
            name={leftIcon}
            onPress={onLeftPress}
            size={24}
            color={theme.colors.text.primary}
          />
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.right}>
        {rightIcon && onRightPress && (
          <IconButton
            name={rightIcon}
            onPress={onRightPress}
            size={24}
            color={theme.colors.text.primary}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginHorizontal: theme.spacing.md,
  },
}); 