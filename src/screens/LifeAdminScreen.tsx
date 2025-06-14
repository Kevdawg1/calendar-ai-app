import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { commonStyles } from '../theme/styles';
import { Button } from '../components/Button';
import { Section } from '../components/Section';
import { Badge } from '../components/Badge';
import { lifeAdminTasks, LifeAdminTask } from '../data/lifeAdminTasks';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { lifeAdminService } from '../services/lifeAdminService';
import { taskService } from '../services/taskService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const FREQUENCIES: LifeAdminTask['frequency'][] = ['daily', 'weekly', 'monthly', 'seasonal'];

export const LifeAdminScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<LifeAdminTask | null>(null);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [tasks, setTasks] = useState<LifeAdminTask[]>(lifeAdminTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');

  // Get unique categories from the managed tasks
  const categories = Array.from(new Set(tasks.map(task => task.category)));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const toggleCategoryAll = (category: string) => {
    const categoryTasks = tasks.filter(task => task.category === category);
    const categoryTaskIds = new Set(categoryTasks.map(task => task.id));
    
    const allSelected = categoryTasks.every(task => selectedTasks.has(task.id));
    
    const newSelected = new Set(selectedTasks);
    if (allSelected) {
      categoryTaskIds.forEach(taskId => newSelected.delete(taskId));
    } else {
      categoryTaskIds.forEach(taskId => newSelected.add(taskId));
    }
    setSelectedTasks(newSelected);
  };

  const handleFrequencySelect = (task: LifeAdminTask, frequency: LifeAdminTask['frequency']) => {
    const updatedTasks = tasks.map(t => 
      t.id === task.id ? { ...t, frequency } : t
    );
    setTasks(updatedTasks);
    setShowFrequencyModal(false);
    setEditingTask(null);
  };

  const handleScheduleTasks = async () => {
    const selectedTaskIds = Array.from(selectedTasks);
    if (selectedTaskIds.length === 0) {
      Alert.alert('No Tasks Selected', 'Please select at least one task to schedule.');
      return;
    }
    
    const selectedTasksList = tasks.filter(task => selectedTaskIds.includes(task.id));
    
    try {
      setIsLoading(true);
      setLoadingStage('Analyzing Tasks...');
      Alert.alert(
        'Schedule Tasks',
        `Scheduling ${selectedTasksList.length} tasks...`,
        [{ text: 'OK' }]
      );

      setLoadingStage('Generating Schedule...');
      const scheduledTasks = await lifeAdminService.scheduleTasks(selectedTasksList);
      
      setLoadingStage('Adding to Calendar...');
      const tasksWithGoalId = scheduledTasks.map(task => ({
        ...task,
        goalId: 'life-admin'
      }));
      await taskService.addTasks(tasksWithGoalId);

      Alert.alert(
        'Success',
        `Successfully scheduled ${scheduledTasks.length} tasks!`,
        [
          {
            text: 'View Calendar',
            onPress: () => {
              navigation.navigate('Calendar', { tasks: tasksWithGoalId });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error scheduling tasks:', error);
      Alert.alert(
        'Error',
        'Failed to schedule tasks. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Button
          title="Schedule Life Admin Tasks"
          onPress={handleScheduleTasks}
          style={styles.scheduleButton}
          disabled={isLoading}
        />
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{loadingStage}</Text>
        </View>
      )}

      <ScrollView style={commonStyles.content}>
        <Section title="">
          <Text style={commonStyles.description}>
            Manage your recurring life admin tasks. Select the tasks you want to schedule in your calendar.
          </Text>

          {categories.map((category) => (
            <View key={category} style={styles.categoryContainer}>
              <TouchableOpacity
                style={commonStyles.card}
                onPress={() => toggleCategory(category)}
              >
                <View style={commonStyles.cardHeader}>
                  <View style={commonStyles.cardContent}>
                    <Checkbox
                      value={tasks
                        .filter(task => task.category === category)
                        .every(task => selectedTasks.has(task.id))}
                      onValueChange={() => toggleCategoryAll(category)}
                      color={theme.colors.primary}
                    />
                    <Text style={commonStyles.title}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </View>
                  <Ionicons
                    name={expandedCategories.has(category) ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.colors.text.primary}
                  />
                </View>
              </TouchableOpacity>

              {expandedCategories.has(category) && (
                <View style={styles.tasksContainer}>
                  {tasks
                    .filter(task => task.category === category)
                    .map((task) => (
                      <View key={task.id} style={commonStyles.card}>
                        <View style={commonStyles.cardContent}>
                          <Checkbox
                            value={selectedTasks.has(task.id)}
                            onValueChange={() => toggleTask(task.id)}
                            color={selectedTasks.has(task.id) ? theme.colors.primary : undefined}
                          />
                          <View style={styles.taskInfo}>
                            <Text style={commonStyles.text}>{task.title}</Text>
                            <TouchableOpacity
                              onPress={() => {
                                setEditingTask(task);
                                setShowFrequencyModal(true);
                              }}
                            >
                              <Badge
                                label={task.frequency}
                                color={task.frequency === 'daily' ? theme.colors.primary : theme.colors.secondary}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                </View>
              )}
            </View>
          ))}
        </Section>
      </ScrollView>

      <Modal
        visible={showFrequencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowFrequencyModal(false);
          setEditingTask(null);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowFrequencyModal(false);
            setEditingTask(null);
          }}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Frequency</Text>
            {FREQUENCIES.map((frequency) => (
              <TouchableOpacity
                key={frequency}
                style={[
                  styles.frequencyOption,
                  editingTask?.frequency === frequency && styles.frequencyOptionSelected,
                ]}
                onPress={() => editingTask && handleFrequencySelect(editingTask, frequency)}
              >
                <Text style={[
                  styles.frequencyText,
                  editingTask?.frequency === frequency && styles.frequencyTextSelected,
                ]}>
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scheduleButton: {
    width: '100%',
  },
  categoryContainer: {
    marginBottom: theme.spacing.md,
  },
  tasksContainer: {
    marginTop: theme.spacing.sm,
  },
  taskInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  frequencyOption: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  frequencyOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  frequencyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  frequencyTextSelected: {
    color: theme.colors.text.inverse,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
}); 