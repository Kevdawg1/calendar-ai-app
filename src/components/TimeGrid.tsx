import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TimeGridProps {
  tasks: Task[];
  onTaskPress: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  getGoalText: (goalId: string) => string;
  getGoalColor: (goalId: string) => string;
}

const HOUR_HEIGHT = 60;

export const TimeGrid: React.FC<TimeGridProps> = ({
  tasks,
  onTaskPress,
  onTaskDelete,
  onStatusChange,
  getGoalText,
  getGoalColor,
}) => {
  const getEarliestHour = (tasks: Task[]) => {
    if (tasks.length === 0) return 8;
    return Math.min(...tasks.map(task => {
      if (!task.startTime) return 8;
      const [hours] = task.startTime.split(':').map(Number);
      return hours;
    }));
  };

  const getLatestHour = (tasks: Task[]) => {
    if (tasks.length === 0) return 20;
    return Math.max(...tasks.map(task => {
      if (!task.endTime) return 20;
      const [hours] = task.endTime.split(':').map(Number);
      return hours;
    }));
  };

  const earliestHour = getEarliestHour(tasks);
  const latestHour = getLatestHour(tasks);
  const hours = Array.from(
    { length: latestHour - earliestHour + 1 },
    (_, i) => earliestHour + i
  );

  return (
    <View style={styles.timeGrid}>
      {hours.map(hour => (
        <View key={hour} style={styles.hourRow}>
          <Text style={styles.hourLabel}>
            {hour.toString().padStart(2, '0')}:00
          </Text>
          <View style={styles.hourContent}>
            {tasks
              .filter(task => {
                if (!task.startTime) return false;
                const [taskHour] = task.startTime.split(':').map(Number);
                return taskHour === hour;
              })
              .map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onPress={onTaskPress}
                  onDelete={onTaskDelete}
                  onStatusChange={onStatusChange}
                  getGoalText={getGoalText}
                  getGoalColor={getGoalColor}
                />
              ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  timeGrid: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 16,
  },
  hourRow: {
    flexDirection: 'row',
    minHeight: HOUR_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  hourLabel: {
    width: 60,
    padding: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    backgroundColor: '#f8f8f8',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  hourContent: {
    flex: 1,
    padding: 4,
    backgroundColor: '#fff',
  },
}); 