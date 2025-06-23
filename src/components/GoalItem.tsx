import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import { IconButton } from './IconButton';
import { theme } from '../theme';
import { Goal } from '../types';

interface GoalItemProps {
  goal: Goal;
  onEdit?: () => void;
  onDelete?: () => void;
  onCalendarPress?: () => void;
  style?: ViewStyle;
}

export const GoalItem: React.FC<GoalItemProps> = ({
  goal,
  onEdit,
  onDelete,
  onCalendarPress,
  style,
}) => {
  const getTypeColor = (type: Goal['type']): string => {
    switch (type) {
      case 'short':
        return '#007AFF'; // Blue
      case 'medium':
        return '#34C759'; // Green
      case 'long':
        return '#FF9500'; // Orange
      default:
        return theme.colors.primary;
    }
  };

  const getPriorityColor = (priority: Goal['priority']): string => {
    switch (priority) {
      case 'high':
        return '#FF3B30'; // Red
      case 'medium':
        return '#FF9500'; // Orange
      default:
        return '#007AFF'; // Blue
    }
  };

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...(style || {}),
  };

  return (
    <Card style={containerStyle}>
      <View style={styles.header}>
        <Text style={styles.title}>{goal.text}</Text>
        <View style={styles.actions}>
          {onCalendarPress && (
            <IconButton
              name="calendar"
              onPress={onCalendarPress}
              size={20}
              color={theme.colors.primary}
            />
          )}
          {onEdit && (
            <IconButton
              name="pencil"
              onPress={onEdit}
              size={20}
              color={theme.colors.text.secondary}
            />
          )}
          {onDelete && (
            <IconButton
              name="trash"
              onPress={onDelete}
              size={20}
              color={theme.colors.danger}
            />
          )}
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.badges}>
          <Badge
            label={goal.type}
            color={getTypeColor(goal.type)}
          />
          <Badge
            label={goal.priority}
            color={getPriorityColor(goal.priority)}
          />
        </View>
        <Text style={styles.weeklyHours}>
          {goal.timeCommitment} hours/week
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  weeklyHours: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontWeight: '500' as const,
  },
}); 