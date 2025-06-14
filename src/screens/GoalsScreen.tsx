import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { goalService } from '../services/goalService';
import { openaiService } from '../services/openaiService';
import { Goal, Task } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';
import { Section } from '../components/Section';
import { EmptyState } from '../components/EmptyState';
import { Button as CustomButton } from '../components/Button';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const GoalsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [selectedType, setSelectedType] = useState<'short' | 'medium' | 'long'>('short');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [timeCommitment, setTimeCommitment] = useState('5');

  useEffect(() => {
    const loadGoals = () => {
      const allGoals = goalService.getAllGoals();
      setGoals(allGoals);
    };

    loadGoals();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('Calendar', {})}
        >
          <Ionicons name="calendar" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleAddGoal = () => {
    if (!newGoalText.trim()) {
      Alert.alert('Error', 'Please enter a goal');
      return;
    }

    const hours = parseInt(timeCommitment);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert('Error', 'Please enter a valid time commitment');
      return;
    }

    const newGoal = goalService.addGoal({
      text: newGoalText.trim(),
      type: selectedType,
      priority: selectedPriority,
      timeCommitment: hours
    });

    setGoals([...goals, newGoal]);
    setNewGoalText('');
    setTimeCommitment('5');
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This will also delete all associated tasks.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            goalService.deleteGoal(goalId);
            setGoals(goals.filter(goal => goal.id !== goalId));
          }
        }
      ]
    );
  };

  const handleGenerateTasks = async (goal: Goal) => {
    try {
      const tasks = await openaiService.generateTasks([goal]);
      if (tasks && tasks.length > 0) {
        const calendarTasks = tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          duration: task.duration,
          startDate: task.startDate,
          startTime: task.startTime,
          endTime: task.endTime,
          goalId: goal.id,
          status: 'pending' as const,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        }));
        navigation.navigate('Calendar', { tasks: calendarTasks });
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
      Alert.alert('Error', 'Failed to generate tasks. Please try again.');
    }
  };

  const renderGoalForm = () => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={newGoalText}
        onChangeText={setNewGoalText}
        placeholder="Enter your goal"
        multiline
      />

      <Text style={styles.sectionLabel}>Goal Type</Text>
      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'short' && styles.selectedType,
          ]}
          onPress={() => setSelectedType('short')}
        >
          <Text
            style={[
              styles.typeText,
              selectedType === 'short' && styles.selectedTypeText,
            ]}
          >
            Short Term
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'medium' && styles.selectedType,
          ]}
          onPress={() => setSelectedType('medium')}
        >
          <Text
            style={[
              styles.typeText,
              selectedType === 'medium' && styles.selectedTypeText,
            ]}
          >
            Medium Term
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'long' && styles.selectedType,
          ]}
          onPress={() => setSelectedType('long')}
        >
          <Text
            style={[
              styles.typeText,
              selectedType === 'long' && styles.selectedTypeText,
            ]}
          >
            Long Term
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Priority Level</Text>
      <View style={styles.priorityContainer}>
        <TouchableOpacity
          style={[
            styles.priorityButton,
            selectedPriority === 'low' && styles.selectedPriority,
          ]}
          onPress={() => setSelectedPriority('low')}
        >
          <Text
            style={[
              styles.priorityText,
              selectedPriority === 'low' && styles.selectedPriorityText,
            ]}
          >
            Low
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.priorityButton,
            selectedPriority === 'medium' && styles.selectedPriority,
          ]}
          onPress={() => setSelectedPriority('medium')}
        >
          <Text
            style={[
              styles.priorityText,
              selectedPriority === 'medium' && styles.selectedPriorityText,
            ]}
          >
            Medium
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.priorityButton,
            selectedPriority === 'high' && styles.selectedPriority,
          ]}
          onPress={() => setSelectedPriority('high')}
        >
          <Text
            style={[
              styles.priorityText,
              selectedPriority === 'high' && styles.selectedPriorityText,
            ]}
          >
            High
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>Weekly Time Commitment (hours)</Text>
        <TextInput
          style={styles.timeInput}
          value={timeCommitment}
          onChangeText={setTimeCommitment}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddGoal}
      >
        <Text style={styles.addButtonText}>Add Goal</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <View style={styles.goalItem}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle}>{item.text}</Text>
        <View style={styles.goalActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteGoal(item.id)}
          >
            <Ionicons name="trash" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.goalDetails}>
        <Text style={styles.goalType}>Type: {item.type}</Text>
        <Text style={styles.goalPriority}>Priority: {item.priority}</Text>
        <Text style={styles.goalTime}>Weekly Time: {item.timeCommitment} hours</Text>
      </View>
      <TouchableOpacity
        style={styles.generateButton}
        onPress={() => handleGenerateTasks(item)}
      >
        <Ionicons name="calendar-outline" size={20} color="#fff" />
        <Text style={styles.generateButtonText}>Generate Tasks</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Section title="">
        {goals.length === 0 ? (
          <EmptyState
            icon="flag"
            title="No Goals Yet"
            message="Add your first goal to get started"
          />
        ) : (
          <FlatList
            data={goals}
            renderItem={renderGoalItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.goalsList}
          />
        )}
      </Section>

      {renderGoalForm()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  navButton: {
    marginBottom: theme.spacing.md,
  },
  goalsList: {
    paddingBottom: theme.spacing.xl,
  },
  headerButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  inputContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  goalItem: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  goalTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    marginLeft: theme.spacing.md,
  },
  goalDetails: {
    marginBottom: theme.spacing.sm,
  },
  goalType: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  goalPriority: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  goalTime: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  generateButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    marginLeft: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.secondary,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  typeButton: {
    flex: 1,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: theme.colors.primary,
  },
  typeText: {
    color: theme.colors.primary,
  },
  selectedTypeText: {
    color: '#fff',
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  priorityButton: {
    flex: 1,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  selectedPriority: {
    backgroundColor: theme.colors.primary,
  },
  priorityText: {
    color: theme.colors.primary,
  },
  selectedPriorityText: {
    color: '#fff',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  timeLabel: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
  },
  timeInput: {
    width: 60,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    textAlign: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
}); 