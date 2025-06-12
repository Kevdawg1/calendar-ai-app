import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { goalService } from '../services/goalService';
import { openaiService } from '../services/openaiService';
import { Goal, Task } from '../types';

type GoalsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Goals'>;
};

export default function GoalsScreen({ navigation }: GoalsScreenProps) {
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
      navigation.navigate('Calendar', { tasks });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate tasks. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newGoalText}
          onChangeText={setNewGoalText}
          placeholder="Enter your life goal"
          multiline
        />
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'short' && styles.selectedType]}
            onPress={() => setSelectedType('short')}
          >
            <Text style={[styles.typeText, selectedType === 'short' && styles.selectedTypeText]}>Short Term</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'medium' && styles.selectedType]}
            onPress={() => setSelectedType('medium')}
          >
            <Text style={[styles.typeText, selectedType === 'medium' && styles.selectedTypeText]}>Medium Term</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'long' && styles.selectedType]}
            onPress={() => setSelectedType('long')}
          >
            <Text style={[styles.typeText, selectedType === 'long' && styles.selectedTypeText]}>Long Term</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.priorityContainer}>
          <TouchableOpacity
            style={[styles.priorityButton, selectedPriority === 'low' && styles.selectedPriority]}
            onPress={() => setSelectedPriority('low')}
          >
            <Text style={[styles.priorityText, selectedPriority === 'low' && styles.selectedPriorityText]}>Low</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.priorityButton, selectedPriority === 'medium' && styles.selectedPriority]}
            onPress={() => setSelectedPriority('medium')}
          >
            <Text style={[styles.priorityText, selectedPriority === 'medium' && styles.selectedPriorityText]}>Medium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.priorityButton, selectedPriority === 'high' && styles.selectedPriority]}
            onPress={() => setSelectedPriority('high')}
          >
            <Text style={[styles.priorityText, selectedPriority === 'high' && styles.selectedPriorityText]}>High</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Weekly Time Commitment (hours):</Text>
          <TextInput
            style={styles.timeInput}
            value={timeCommitment}
            onChangeText={setTimeCommitment}
            keyboardType="numeric"
            placeholder="5"
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
          <Text style={styles.addButtonText}>Add Goal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.goalsList}>
        {goals.map((goal) => (
          <View key={goal.id} style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalText}>{goal.text}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteGoal(goal.id)}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.goalDetails}>
              <Text style={styles.goalType}>Type: {goal.type}</Text>
              <Text style={styles.goalPriority}>Priority: {goal.priority}</Text>
              <Text style={styles.goalTime}>Weekly Time: {goal.timeCommitment} hours</Text>
            </View>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => handleGenerateTasks(goal)}
            >
              <Text style={styles.generateButtonText}>Generate Tasks</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    minHeight: 80,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginHorizontal: 4,
    borderRadius: 8,
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
    marginBottom: 12,
  },
  priorityButton: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginHorizontal: 4,
    borderRadius: 8,
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
    marginBottom: 12,
  },
  timeLabel: {
    flex: 1,
    fontSize: 16,
  },
  timeInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalsList: {
    flex: 1,
    padding: 16,
  },
  goalItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#FF3B30',
  },
  goalDetails: {
    marginBottom: 12,
  },
  goalType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  goalPriority: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  goalTime: {
    fontSize: 14,
    color: '#666',
  },
  generateButton: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 