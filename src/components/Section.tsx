import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
  flexContent?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  title,
  children,
  style,
  flexContent,
}) => {
  const containerStyle: ViewStyle = {
    ...styles.container,
    ...(style || {}),
  };
  if (flexContent) {
    containerStyle.flex = 1;
  }

  return (
    <View style={containerStyle}>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.content, flexContent && { flex: 1, padding: 0 }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  content: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
}); 