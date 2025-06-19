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
  onToggle: (taskId: string) => void;
  onFrequencyPress: (task: LifeAdminTask) => void;
}

export const LifeAdminTaskItem: React.FC<LifeAdminTaskItemProps> = ({
  task,
  isSelected,
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
          value={isSelected}
          onValueChange={() => onToggle(task.id)}
          color={isSelected ? theme.colors.primary : undefined}
        />
        <View style={styles.taskInfo}>
          <Text style={sharedStyles.cardText}>{task.title}</Text>
          <TouchableOpacity onPress={() => onFrequencyPress(task)}>
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
}); 