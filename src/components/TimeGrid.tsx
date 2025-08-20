import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Task, Meeting } from '../types';
import { TaskItem } from './TaskItem';
import { MeetingItem } from './MeetingItem';

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
  meetings?: Meeting[];
  scheduleItems?: ScheduleItemProps[];
  onTaskPress: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onMeetingPress: (meetingId: string) => void;
  onMeetingDelete: (meetingId: string) => void;
  onMeetingStatusChange: (meetingId: string, status: Meeting['status']) => void;
  getGoalText: (goalId: string) => string;
  getGoalColor: (goalId: string) => string;
  getMeetingColor: (type: Meeting['type']) => string;
}

const HOUR_HEIGHT = 60;

const ScheduleItem: React.FC<{ item: ScheduleItemProps }> = ({ item }) => (
  <View style={[styles.scheduleItem, { backgroundColor: item.color }]}>
    <Text style={styles.scheduleItemText}>{item.title}</Text>
  </View>
);

export const TimeGrid: React.FC<TimeGridProps> = ({
  tasks,
  meetings = [],
  scheduleItems = [],
  onTaskPress,
  onTaskDelete,
  onStatusChange,
  onMeetingPress,
  onMeetingDelete,
  onMeetingStatusChange,
  getGoalText,
  getGoalColor,
  getMeetingColor,
}) => {
  const getEarliestHour = (tasks: Task[], meetings: Meeting[], schedule: ScheduleItemProps[]) => {
    const taskHours = tasks.map(t => t.startTime ? parseInt(t.startTime.split(':')[0], 10) : 24);
    const meetingHours = meetings.map(m => m.startTime ? parseInt(m.startTime.split(':')[0], 10) : 24);
    const scheduleHours = schedule.map(s => parseInt(s.startTime.split(':')[0], 10));
    const allHours = [...taskHours, ...meetingHours, ...scheduleHours];
    if (allHours.length === 0) return 8;
    return Math.min(...allHours);
  };

  const getLatestHour = (tasks: Task[], meetings: Meeting[], schedule: ScheduleItemProps[]) => {
    const taskHours = tasks.map(t => t.endTime ? parseInt(t.endTime.split(':')[0], 10) : 0);
    const meetingHours = meetings.map(m => m.endTime ? parseInt(m.endTime.split(':')[0], 10) : 0);
    const scheduleHours = schedule.map(s => parseInt(s.endTime.split(':')[0], 10));
    const allHours = [...taskHours, ...meetingHours, ...scheduleHours];
    if (allHours.length === 0) return 20;
    return Math.max(...allHours);
  };

  const earliestHour = getEarliestHour(tasks, meetings, scheduleItems);
  const latestHour = getLatestHour(tasks, meetings, scheduleItems);
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
            {meetings
              .filter(meeting => {
                if (!meeting.startTime) return false;
                const [meetingHour] = meeting.startTime.split(':').map(Number);
                return meetingHour === hour;
              })
              .map(meeting => (
                <MeetingItem
                  key={meeting.id}
                  meeting={meeting}
                  onPress={onMeetingPress}
                  onDelete={onMeetingDelete}
                  onStatusChange={onMeetingStatusChange}
                  getGoalColor={getGoalColor}
                />
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