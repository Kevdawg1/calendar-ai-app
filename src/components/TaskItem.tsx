import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../types';
import { theme } from '../theme';

interface TaskItemProps {
  task: Task;
  onPress: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  getGoalText: (goalId: string) => string;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onPress,
  onDelete,
  onStatusChange,
  getGoalText,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.taskItem,
        task.status === 'completed' && styles.completedTask,
        { borderLeftWidth: 6, borderLeftColor: task.goalId === 'life-admin' ? theme.colors.primary : theme.colors.warning }
      ]}
      onPress={() => onPress(task.id)}
    >
      <View style={styles.taskHeader}>
        <Text style={[
          styles.taskTitle,
          task.status === 'completed' && styles.completedTaskText
        ]}>
          {task.title}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(task.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      <Text style={[
        styles.taskDescription,
        task.status === 'completed' && styles.completedTaskText
      ]}>
        {task.description}
      </Text>
      <Text style={[
        styles.taskTime,
        task.status === 'completed' && styles.completedTaskText
      ]}>
        {task.startTime} - {task.endTime}
      </Text>
      <View style={styles.taskFooter}>
        <Text style={[
          styles.taskGoal,
          task.status === 'completed' && styles.completedTaskText
        ]}>
          {getGoalText(task.goalId)}
        </Text>
        <View style={styles.statusContainer}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              task.status === 'pending' && styles.statusButtonActive
            ]}
            onPress={() => onStatusChange(task.id, 'pending')}
          >
            <Text style={[
              styles.statusButtonText,
              task.status === 'pending' && styles.statusButtonTextActive
            ]}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusButton,
              task.status === 'completed' && styles.statusButtonActive
            ]}
            onPress={() => onStatusChange(task.id, 'completed')}
          >
            <Text style={[
              styles.statusButtonText,
              task.status === 'completed' && styles.statusButtonTextActive
            ]}>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#FF3B30',
  },
  taskGoal: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
  },
  statusButtonText: {
    fontSize: 12,
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  completedTask: {
    backgroundColor: '#f0f0f0',
    borderColor: '#d0d0d0',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}); 