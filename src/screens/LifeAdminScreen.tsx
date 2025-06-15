import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { sharedStyles } from '../theme/styles';
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
import { checkedTasksService } from '../services/checkedTasksService';

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
          style={sharedStyles.headerButton}
          onPress={() => navigation.navigate('Calendar', {})}
        >
          <Ionicons name="calendar" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
    loadUserPreferences();
    loadCheckedTasks();
  }, [navigation]);

  const loadUserPreferences = async () => {
    try {
      const preferences = await userPreferencesService.getPreferences();
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const loadCheckedTasks = async () => {
    try {
      const checkedTasks = await checkedTasksService.getCheckedTasks();
      setSelectedTasks(checkedTasks);
    } catch (error) {
      console.error('Error loading checked tasks:', error);
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

  const toggleTask = async (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
      await checkedTasksService.removeCheckedTask(taskId);
    } else {
      newSelected.add(taskId);
      await checkedTasksService.addCheckedTask(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const toggleCategoryAll = async (category: string) => {
    const categoryTasks = tasks.filter(task => task.category === category);
    const categoryTaskIds = new Set(categoryTasks.map(task => task.id));
    
    const allSelected = categoryTasks.every(task => selectedTasks.has(task.id));
    
    const newSelected = new Set(selectedTasks);
    if (allSelected) {
      categoryTaskIds.forEach(taskId => {
        newSelected.delete(taskId);
        checkedTasksService.removeCheckedTask(taskId);
      });
    } else {
      categoryTaskIds.forEach(taskId => {
        newSelected.add(taskId);
        checkedTasksService.addCheckedTask(taskId);
      });
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

      // Clear checked tasks after successful scheduling
      await checkedTasksService.clearCheckedTasks();
      setSelectedTasks(new Set());

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
    <View style={sharedStyles.container}>
      <View style={sharedStyles.header}>
        <Button
          title="Schedule Life Admin Tasks"
          onPress={handleScheduleTasks}
          style={sharedStyles.button}
          disabled={isLoading}
        />
      </View>

      {isLoading && (
        <View style={sharedStyles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={sharedStyles.loadingText}>{loadingStage}</Text>
        </View>
      )}

      <ScrollView style={sharedStyles.content}>
        <Section title="">
          <Text style={sharedStyles.emptyStateText}>
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