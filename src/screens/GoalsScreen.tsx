import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal, Button, FlatList } from 'react-native';
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
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    const loadGoals = () => {
      const allGoals = goalService.getAllGoals();
      setGoals(allGoals);
    };

    loadGoals();
  }, []);

  useEffect(() => {
    // Add Calendar button to navigation header
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

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoalText(goal.text);
    setSelectedType(goal.type);
    setSelectedPriority(goal.priority);
    setTimeCommitment(goal.timeCommitment.toString());
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingGoal) return;

    if (!newGoalText.trim()) {
      Alert.alert('Error', 'Please enter a goal');
      return;
    }

    const hours = parseInt(timeCommitment);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert('Error', 'Please enter a valid time commitment');
      return;
    }

    const updatedGoal = goalService.updateGoal(editingGoal.id, {
      text: newGoalText.trim(),
      type: selectedType,
      priority: selectedPriority,
      timeCommitment: hours
    });

    if (updatedGoal) {
      setGoals(goals.map(goal => goal.id === editingGoal.id ? updatedGoal : goal));
      setIsEditModalVisible(false);
      setEditingGoal(null);
      setNewGoalText('');
      setTimeCommitment('5');
    }
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
          title: task.title,
          frequency: 'weekly' as const,
          category: 'personal' as const
        }));
        navigation.navigate('Calendar', { tasks: calendarTasks });
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
      Alert.alert('Error', 'Failed to generate tasks. Please try again.');
    }
  };

  const renderGoalForm = (isEditing = false) => (
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
        onPress={isEditing ? handleSaveEdit : handleAddGoal}
      >
        <Text style={styles.addButtonText}>
          {isEditing ? 'Save Changes' : 'Add Goal'}
        </Text>
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
            onPress={() => handleEditGoal(item)}
          >
            <Ionicons name="pencil" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
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
        <CustomButton
          title="Add New Goal"
          onPress={() => setIsEditModalVisible(true)}
          variant="primary"
        />
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

      {!isEditModalVisible && renderGoalForm()}

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Goal</Text>
            {renderGoalForm(true)}
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setIsEditModalVisible(false);
                setEditingGoal(null);
                setNewGoalText('');
                setTimeCommitment('5');
              }}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    marginBottom: theme.spacing.md,
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  input: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.overlay,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '90%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  formField: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  selectText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.lg,
  },
  cancelButton: {
    marginRight: theme.spacing.md,
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
    backgroundColor: '#007AFF',
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
  modalButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
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
    borderColor: '#007AFF',
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    color: '#007AFF',
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
    borderColor: '#007AFF',
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  selectedPriority: {
    backgroundColor: '#007AFF',
  },
  priorityText: {
    color: '#007AFF',
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