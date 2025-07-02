import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [scheduledTasks, setScheduledTasks] = useState<Set<string>>(new Set());
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
    loadScheduledTasks();
    
    // Clean up any existing duplicate life admin tasks
    const cleanupDuplicates = async () => {
      try {
        await taskService.removeDuplicateLifeAdminTasks();
      } catch (error) {
        console.error('Error cleaning up duplicate tasks:', error);
      }
    };
    cleanupDuplicates();
  }, [navigation]);

  const loadUserPreferences = async () => {
    try {
      const preferences = await userPreferencesService.getPreferences();
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const loadScheduledTasks = async () => {
    try {
      const allTasks = await taskService.getAllTasks();
      const lifeAdminTasks = allTasks.filter(task => task.goalId === 'life-admin');
      
      // Create a map of task titles to their UUIDs
      const taskTitleToId = new Map<string, string>();
      lifeAdminTasks.forEach(task => {
        const originalTitle = task.title.split(' [')[0]; // Extract original task title without frequency
        taskTitleToId.set(originalTitle, task.id);
      });
      
      // Get checked tasks from AsyncStorage
      const checkedTasks = await checkedTasksService.getCheckedTasks();
      
      // Check which life admin tasks are already in the calendar and mark them as selected
      const tasksInCalendar = new Set<string>();
      lifeAdminTasks.forEach(task => {
        const originalTitle = task.title.split(' [')[0];
        // Find the corresponding life admin task by title
        const matchingTask = tasks.find(task => task.title === originalTitle);
        if (matchingTask) {
          tasksInCalendar.add(matchingTask.id);
        }
      });
      
      // Combine checked tasks from AsyncStorage and tasks in calendar
      const allSelectedTasks = new Set([...checkedTasks, ...tasksInCalendar]);
      setSelectedTasks(allSelectedTasks);
    } catch (error) {
      console.error('Error loading scheduled tasks:', error);
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
    if (frequency === 'none') {
      // Remove the task from the list when "Does not repeat" is selected
      setTasks(tasks.filter(t => t.id !== task.id));
    } else {
      const updatedTasks = tasks.map(t => 
        t.id === task.id ? { ...t, frequency } : t
      );
      setTasks(updatedTasks);
    }
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

      setLoadingStage('Generating Schedule...');
      const scheduledTasks = await lifeAdminService.scheduleTasks(selectedTasksList, userPreferences || undefined);
      
      setLoadingStage('Adding to Calendar...');
      const tasksWithGoalId = scheduledTasks.map(task => ({
        ...task,
        goalId: 'life-admin'
      }));

      // Clear checked tasks after successful scheduling
      await checkedTasksService.clearCheckedTasks();
      setSelectedTasks(new Set());

      navigation.navigate('TaskReview', { tasks: tasksWithGoalId });
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

  const handleCollapseAll = () => {
    setExpandedCategories(new Set());
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <View style={sharedStyles.safeAreaContainer}>
        <View style={sharedStyles.header}>
          <Button
            title="Collapse All"
            onPress={handleCollapseAll}
            style={sharedStyles.button}
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

            {categories.map((category) => {
              const categoryTasks = tasks.filter(task => task.category === category);
              const selectedCategoryTasks = categoryTasks.filter(task => selectedTasks.has(task.id));
              const isAllSelected = categoryTasks.length > 0 && selectedCategoryTasks.length === categoryTasks.length;
              const isPartiallySelected = selectedCategoryTasks.length > 0 && selectedCategoryTasks.length < categoryTasks.length;

              return (
                <CategorySection
                  key={category}
                  category={category}
                  isExpanded={expandedCategories.has(category)}
                  isAllSelected={isAllSelected}
                  isPartiallySelected={isPartiallySelected}
                  onToggle={toggleCategory}
                  onToggleAll={toggleCategoryAll}
                >
                  {categoryTasks.map((task) => (
                    <LifeAdminTaskItem
                      key={task.id}
                      task={task}
                      isSelected={selectedTasks.has(task.id)}
                      isScheduled={scheduledTasks.has(task.title)}
                      onToggle={toggleTask}
                      onFrequencyPress={(task) => {
                        setEditingTask(task);
                        setShowFrequencyModal(true);
                      }}
                    />
                  ))}
                </CategorySection>
              );
            })}
          </Section>
        </ScrollView>

        <View style={sharedStyles.footer}>
          <Button
            title="Schedule Life Admin Tasks"
            onPress={handleScheduleTasks}
            style={sharedStyles.button}
            disabled={isLoading}
          />
        </View>

        {editingTask && (
          <FrequencyModal
            visible={showFrequencyModal}
            onClose={() => {
              setShowFrequencyModal(false);
              setEditingTask(null);
            }}
            onSelect={(frequency) => {
              if (editingTask) {
                handleFrequencySelect(editingTask, frequency);
              }
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}; 