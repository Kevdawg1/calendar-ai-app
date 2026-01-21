import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Meeting } from '../../types';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from './Badge';

type MeetingItemProps = {
  meeting: Meeting;
  onPress: (meetingId: string) => void;
  onDelete: (meetingId: string) => void;
  onStatusChange: (meetingId: string, status: Meeting['status']) => void;
  getGoalColor?: (goalId: string) => string;
};

export function MeetingItem({ meeting, onPress, onDelete, onStatusChange, getGoalColor }: MeetingItemProps) {
  const getMeetingColor = (type: Meeting['type']) => {
    // If meeting has a goal, use the goal's color
    if (meeting.goalId && getGoalColor) {
      return getGoalColor(meeting.goalId);
    }
    
    // Otherwise use the default meeting type colors
    switch (type) {
      case 'work':
        return theme.colors.primary;
      case 'personal':
        return theme.colors.secondary;
      case 'social':
        return theme.colors.info;
      case 'health':
        return theme.colors.success;
      case 'education':
        return theme.colors.warning;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getPriorityColor = (priority: Meeting['priority']) => {
    switch (priority) {
      case 'high':
        return theme.colors.danger;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.text.secondary;
    }
  };

  const formatTime = (time: string) => {
    return time;
  };

  const handleStatusChange = () => {
    const newStatus: Meeting['status'] = meeting.status === 'scheduled' ? 'completed' : 'scheduled';
    onStatusChange(meeting.id, newStatus);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: getMeetingColor(meeting.type) },
        meeting.status === 'completed' && styles.completed,
      ]}
      onPress={() => onPress(meeting.id)}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, meeting.status === 'completed' && styles.completedText]}>
            {meeting.title}
          </Text>
          {meeting.priority === 'high' && (
            <Badge label="High" />
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStatusChange}
          >
            <Ionicons
              name={meeting.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={meeting.status === 'completed' ? theme.colors.success : theme.colors.text.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(meeting.id)}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.timeText}>
            {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
          </Text>
        </View>

        {meeting.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.locationText}>{meeting.location}</Text>
          </View>
        )}

        {meeting.attendees && meeting.attendees.length > 0 && (
          <View style={styles.attendeesContainer}>
            <Ionicons name="people-outline" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.attendeesText}>
              {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {meeting.description && (
        <Text style={styles.description} numberOfLines={2}>
          {meeting.description}
        </Text>
      )}

      <View style={styles.footer}>
        <Badge label={meeting.type} />
        {meeting.sentiment && (
          <View style={styles.sentimentContainer}>
            <Ionicons
              name={
                meeting.sentiment.positive > meeting.sentiment.negative
                  ? 'happy-outline'
                  : meeting.sentiment.negative > meeting.sentiment.positive
                  ? 'sad-outline'
                  : 'ellipse-outline'
              }
              size={16}
              color={
                meeting.sentiment.positive > meeting.sentiment.negative
                  ? theme.colors.success
                  : meeting.sentiment.negative > meeting.sentiment.positive
                  ? theme.colors.danger
                  : theme.colors.text.secondary
              }
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completed: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  details: {
    marginBottom: theme.spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  timeText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  locationText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentimentContainer: {
    padding: theme.spacing.xs,
  },
}); 