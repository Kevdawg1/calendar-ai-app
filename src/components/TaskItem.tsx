import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

type TaskItemProps = {
  task: Task;
  onPress: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  getGoalText: (goalId: string) => string;
  getGoalColor: (goalId: string) => string;
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onPress,
  onDelete,
  onStatusChange,
  getGoalText,
  getGoalColor,
}) => {
  const goalColor = getGoalColor(task.goalId);
  const isCompleted = task.status === 'completed';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: goalColor, borderLeftWidth: 4 }
      ]}
      onPress={() => onPress(task.id)}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{task.title}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(task.id)}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>

        {task.description && (
          <Text style={styles.description}>{task.description}</Text>
        )}

        <View style={styles.timeContainer}>
          <Text style={styles.time}>
            {task.startTime} - {task.endTime}
          </Text>
        </View>

        <View style={styles.taskFooter}>
          <View style={styles.taskInfo}>
            <Text style={[styles.goalText, { color: goalColor }]}>
              {getGoalText(task.goalId)}
            </Text>
            <View style={styles.statusContainer}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  task.status === 'pending' && styles.activeStatus,
                  { borderColor: goalColor }
                ]}
                onPress={() => onStatusChange(task.id, 'pending')}
              >
                <Text
                  style={[
                    styles.statusText,
                    task.status === 'pending' && styles.activeStatusText,
                    { color: task.status === 'pending' ? '#fff' : goalColor }
                  ]}
                >
                  Pending
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  task.status === 'completed' && styles.activeStatus,
                  { borderColor: goalColor }
                ]}
                onPress={() => onStatusChange(task.id, 'completed')}
              >
                <Text
                  style={[
                    styles.statusText,
                    task.status === 'completed' && styles.activeStatusText,
                    { color: task.status === 'completed' ? '#fff' : goalColor }
                  ]}
                >
                  Completed
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  timeContainer: {
    marginBottom: theme.spacing.sm,
  },
  time: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  taskFooter: {
    marginTop: 8,
  },
  taskInfo: {
    flexDirection: 'column',
    gap: 8,
  },
  goalText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  activeStatus: {
    backgroundColor: theme.colors.primary,
  },
  statusText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  activeStatusText: {
    color: '#fff',
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
}); 