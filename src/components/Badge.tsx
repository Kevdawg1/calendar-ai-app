import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface BadgeProps {
  label: string;
  color?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label }) => {
  const getFrequencyColor = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case 'daily':
        return '#007AFF'; // Blue
      case 'weekly':
        return '#34C759'; // Green
      case 'monthly':
        return '#FF9500'; // Orange
      case 'seasonal':
        return '#AF52DE'; // Purple
      default:
        return theme.colors.primary;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getFrequencyColor(label) }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
}); 