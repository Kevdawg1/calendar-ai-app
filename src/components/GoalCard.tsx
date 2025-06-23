import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Goal } from '../types';
import { sharedStyles } from '../theme/styles';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { Button as CustomButton } from './Button';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onGenerateTasks: (goal: Goal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onGenerateTasks,
}) => {
  return (
    <View style={[sharedStyles.card, { borderLeftWidth: 6, borderLeftColor: goal.color }]}>
      <View style={sharedStyles.cardHeader}>
        <Text style={sharedStyles.cardTitle}>{goal.text}</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => onEdit(goal)}
            style={sharedStyles.deleteButton}
          >
            <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(goal.id)}
            style={sharedStyles.deleteButton}
          >
            <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={sharedStyles.cardContent}>
        <Text style={sharedStyles.cardText}>
          Type: {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
        </Text>
        <Text style={sharedStyles.cardText}>
          Priority: {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
        </Text>
        <Text style={sharedStyles.cardText}>
          Time Commitment: {goal.timeCommitment} hours/week
        </Text>
      </View>
      <CustomButton
        title="Generate Tasks"
        onPress={() => onGenerateTasks(goal)}
        style={sharedStyles.button}
      />
    </View>
  );
}; 