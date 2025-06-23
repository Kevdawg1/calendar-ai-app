import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Task } from '../types';
import { TaskItem } from './TaskItem';

interface ScheduleItemProps {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  type: 'schedule';
}

interface TimeGridProps {
  tasks: Task[];
  scheduleItems?: ScheduleItemProps[];
  onTaskPress: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  getGoalText: (goalId: string) => string;
  getGoalColor: (goalId: string) => string;
}

const HOUR_HEIGHT = 60;

const ScheduleItem: React.FC<{ item: ScheduleItemProps }> = ({ item }) => (
  <View style={[styles.scheduleItem, { backgroundColor: item.color }]}>
    <Text style={styles.scheduleItemText}>{item.title}</Text>
  </View>
);

export const TimeGrid: React.FC<TimeGridProps> = ({
  tasks,
  scheduleItems = [],
  onTaskPress,
  onTaskDelete,
  onStatusChange,
  getGoalText,
  getGoalColor,
}) => {
  const getEarliestHour = (tasks: Task[], schedule: ScheduleItemProps[]) => {
    const taskHours = tasks.map(t => t.startTime ? parseInt(t.startTime.split(':')[0], 10) : 24);
    const scheduleHours = schedule.map(s => parseInt(s.startTime.split(':')[0], 10));
    const allHours = [...taskHours, ...scheduleHours];
    if (allHours.length === 0) return 8;
    return Math.min(...allHours);
  };

  const getLatestHour = (tasks: Task[], schedule: ScheduleItemProps[]) => {
    const taskHours = tasks.map(t => t.endTime ? parseInt(t.endTime.split(':')[0], 10) : 0);
    const scheduleHours = schedule.map(s => parseInt(s.endTime.split(':')[0], 10));
    const allHours = [...taskHours, ...scheduleHours];
    if (allHours.length === 0) return 20;
    return Math.max(...allHours);
  };

  const earliestHour = getEarliestHour(tasks, scheduleItems);
  const latestHour = getLatestHour(tasks, scheduleItems);
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
            {scheduleItems
              .filter(item => {
                const [itemHour] = item.startTime.split(':').map(Number);
                return itemHour === hour;
              })
              .map(item => (
                <ScheduleItem key={item.id} item={item} />
              ))}
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
  scheduleItem: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  scheduleItemText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 