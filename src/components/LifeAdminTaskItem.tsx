import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { Badge } from './Badge';
import { theme } from '../theme';
import { sharedStyles } from '../theme/styles';
import { LifeAdminTask } from '../data/lifeAdminTasks';

interface LifeAdminTaskItemProps {
  task: LifeAdminTask;
  isSelected: boolean;
  isScheduled: boolean;
  onToggle: (taskId: string) => void;
  onFrequencyPress: (task: LifeAdminTask) => void;
}

export const LifeAdminTaskItem: React.FC<LifeAdminTaskItemProps> = ({
  task,
  isSelected,
  isScheduled,
  onToggle,
  onFrequencyPress,
}) => {
  return (
    <View style={[
      sharedStyles.card,
      { borderLeftWidth: 6, borderLeftColor: task.category === 'admin' ? theme.colors.primary : theme.colors.warning }
    ]}>
      <View style={sharedStyles.cardContentRow}>
        <Checkbox
          value={isSelected || isScheduled}
          onValueChange={() => onToggle(task.id)}
          color={isSelected || isScheduled ? theme.colors.primary : undefined}
          disabled={isScheduled}
        />
        <View style={styles.taskInfo}>
          <Text style={[
            sharedStyles.cardText,
            isScheduled && styles.scheduledText
          ]}>
            {task.title}
          </Text>
          <TouchableOpacity 
            onPress={() => onFrequencyPress(task)}
            disabled={isScheduled}
          >
            <Badge
              label={task.frequency}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  scheduledText: {
    color: theme.colors.text.secondary,
  },
}); 