import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { commonStyles } from '../theme/styles';
import { Button } from '../components/Button';
import { Section } from '../components/Section';
import { lifeAdminTasks, LifeAdminTask } from '../data/lifeAdminTasks';
import { Ionicons } from '@expo/vector-icons';
import { lifeAdminService } from '../services/lifeAdminService';
import { taskService } from '../services/taskService';
import { LifeAdminTaskItem } from '../components/LifeAdminTaskItem';
import { CategorySection } from '../components/CategorySection';
import { FrequencyModal } from '../components/FrequencyModal';
import { userPreferencesService, UserPreferences } from '../services/userPreferencesService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const LifeAdminScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<LifeAdminTask | null>(null);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [tasks, setTasks] = useState<LifeAdminTask[]>(lifeAdminTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

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
    loadUserPreferences();
  }, [navigation]);

  const loadUserPreferences = async () => {
    try {
      const preferences = await userPreferencesService.getPreferences();
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

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
      const scheduledTasks = await lifeAdminService.scheduleTasks(selectedTasksList, userPreferences || undefined);
      
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
            <CategorySection
              key={category}
              category={category}
              isExpanded={expandedCategories.has(category)}
              isAllSelected={tasks
                .filter(task => task.category === category)
                .every(task => selectedTasks.has(task.id))}
              onToggle={toggleCategory}
              onToggleAll={toggleCategoryAll}
            >
              {tasks
                .filter(task => task.category === category)
                .map((task) => (
                  <LifeAdminTaskItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTasks.has(task.id)}
                    onToggle={toggleTask}
                    onFrequencyPress={(task) => {
                      setEditingTask(task);
                      setShowFrequencyModal(true);
                    }}
                  />
                ))}
            </CategorySection>
          ))}
        </Section>
      </ScrollView>

      <FrequencyModal
        visible={showFrequencyModal}
        selectedFrequency={editingTask?.frequency || null}
        onClose={() => {
          setShowFrequencyModal(false);
          setEditingTask(null);
        }}
        onSelect={(frequency) => editingTask && handleFrequencySelect(editingTask, frequency)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  scheduleButton: {
    width: '100%',
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