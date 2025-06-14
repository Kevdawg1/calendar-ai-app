import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import { IconButton } from './IconButton';
import { theme } from '../theme';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'personal' | 'professional' | 'health' | 'learning';
  priority: 'low' | 'medium' | 'high';
  weeklyHours: number;
}

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
  const getTypeVariant = (type: Goal['type']): 'primary' | 'secondary' | 'warning' | 'danger' => {
    switch (type) {
      case 'professional':
        return 'primary';
      case 'health':
        return 'secondary';
      case 'learning':
        return 'warning';
      default:
        return 'danger';
    }
  };

  const getPriorityVariant = (priority: Goal['priority']): 'primary' | 'warning' | 'danger' => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...(style || {}),
  };

  return (
    <Card style={containerStyle}>
      <View style={styles.header}>
        <Text style={styles.title}>{goal.title}</Text>
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

      {goal.description && (
        <Text style={styles.description}>{goal.description}</Text>
      )}

      <View style={styles.details}>
        <View style={styles.badges}>
          <Badge
            label={goal.type}
            variant={getTypeVariant(goal.type)}
          />
          <Badge
            label={goal.priority}
            variant={getPriorityVariant(goal.priority)}
          />
        </View>
        <Text style={styles.weeklyHours}>
          {goal.weeklyHours} hours/week
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
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
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