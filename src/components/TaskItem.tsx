import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import { IconButton } from './IconButton';
import { theme } from '../theme';

export interface Task {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

interface TaskItemProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: Task['status']) => void;
  style?: ViewStyle;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  style,
}) => {
  const getStatusVariant = (status: Task['status']): 'primary' | 'warning' | 'danger' => {
    switch (status) {
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'primary';
      default:
        return 'primary';
    }
  };

  const getPriorityVariant = (priority: Task['priority']): 'primary' | 'warning' | 'danger' => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...(style || {}),
  };

  return (
    <Card style={containerStyle}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.actions}>
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

      {task.description && (
        <Text style={styles.description}>{task.description}</Text>
      )}

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatTime(task.startTime)} - {formatTime(task.endTime)}
        </Text>
      </View>

      <View style={styles.badges}>
        <Badge
          label={task.status.replace('_', ' ')}
          variant={getStatusVariant(task.status)}
        />
        <Badge
          label={task.priority}
          variant={getPriorityVariant(task.priority)}
        />
      </View>

      {onStatusChange && (
        <View style={styles.statusButtons}>
          <IconButton
            name="time"
            onPress={() => onStatusChange('pending')}
            variant={task.status === 'pending' ? 'primary' : 'default'}
            size={20}
          />
          <IconButton
            name="play"
            onPress={() => onStatusChange('in_progress')}
            variant={task.status === 'in_progress' ? 'secondary' : 'default'}
            size={20}
          />
          <IconButton
            name="checkmark"
            onPress={() => onStatusChange('completed')}
            variant={task.status === 'completed' ? 'primary' : 'default'}
            size={20}
          />
        </View>
      )}
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
  timeContainer: {
    marginBottom: theme.spacing.sm,
  },
  timeText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  badges: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
}); 