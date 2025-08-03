import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  FlatList
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
import { ThreeColumnLayout } from '../components/ResponsiveLayout';
import { getResponsiveValue, getResponsiveFontSize } from '../utils/deviceUtils';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const LifeAdminScreenTablet = () => {
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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');

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
      
      const taskTitleToId = new Map<string, string>();
      lifeAdminTasks.forEach(task => {
        const originalTitle = task.title.split(' [')[0];
        taskTitleToId.set(originalTitle, task.id);
      });
      
      const checkedTasks = await checkedTasksService.getCheckedTasks();
      
      const tasksInCalendar = new Set<string>();
      lifeAdminTasks.forEach(task => {
        const originalTitle = task.title.split(' [')[0];
        const matchingTask = tasks.find(task => task.title === originalTitle);
        if (matchingTask) {
          tasksInCalendar.add(matchingTask.id);
        }
      });
      
      setScheduledTasks(tasksInCalendar);
    } catch (error) {
      console.error('Error loading scheduled tasks:', error);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
    setSelectedCategory(category);
  };

  const toggleTask = async (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const toggleCategoryAll = async (category: string) => {
    const categoryTasks = tasks.filter(task => task.category === category);
    const categoryTaskIds = new Set(categoryTasks.map(task => task.id));
    
    const newSelected = new Set(selectedTasks);
    const allSelected = categoryTasks.every(task => newSelected.has(task.id));
    
    if (allSelected) {
      categoryTaskIds.forEach(id => newSelected.delete(id));
    } else {
      categoryTaskIds.forEach(id => newSelected.add(id));
    }
    
    setSelectedTasks(newSelected);
  };

  const handleFrequencySelect = (task: LifeAdminTask, frequency: LifeAdminTask['frequency']) => {
    setEditingTask(task);
    setSelectedFrequency(frequency);
    setShowFrequencyModal(true);
  };

  const handleScheduleTasks = async () => {
    if (selectedTasks.size === 0) {
      Alert.alert('No Tasks Selected', 'Please select at least one task to schedule.');
      return;
    }

    try {
      setIsLoading(true);
      setLoadingStage('Preparing tasks...');

      const selectedTaskObjects = tasks.filter(task => selectedTasks.has(task.id));
      
      setLoadingStage('Scheduling tasks...');
      const scheduledTasks = await lifeAdminService.scheduleTasksFlexibly(
        selectedTaskObjects,
        userPreferences || undefined,
        {
          startWeek: new Date().toISOString().split('T')[0],
          endWeek: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          considerExistingTasks: true,
          optimizeForUserPreferences: true,
          allowTaskSplitting: false
        }
      );

      setLoadingStage('Saving to calendar...');
      await taskService.addTasks(scheduledTasks);

      setIsLoading(false);
      setLoadingStage('');
      setSelectedTasks(new Set());

      Alert.alert(
        'Success',
        `Scheduled ${scheduledTasks.length} tasks to your calendar.`,
        [
          { text: 'OK' },
          { 
            text: 'View Calendar', 
            onPress: () => navigation.navigate('Calendar', {}) 
          }
        ]
      );

      loadScheduledTasks();
    } catch (error) {
      setIsLoading(false);
      setLoadingStage('');
      console.error('Error scheduling tasks:', error);
      Alert.alert('Error', 'Failed to schedule tasks. Please try again.');
    }
  };

  const handleCollapseAll = () => {
    setExpandedCategories(new Set());
    setSelectedCategory('');
  };

  const getCategoryTasks = (category: string) => {
    return tasks.filter(task => task.category === category);
  };

  const getSelectedTasksForCategory = (category: string) => {
    const categoryTasks = getCategoryTasks(category);
    return categoryTasks.filter(task => selectedTasks.has(task.id));
  };

  const renderCategoryColumn = () => (
    <View style={styles.column}>
      <View style={styles.columnHeader}>
        <Text style={styles.columnTitle}>Categories</Text>
        <TouchableOpacity onPress={handleCollapseAll} style={styles.collapseButton}>
          <Ionicons name="contract-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.columnContent}>
        {Array.from(new Set(tasks.map(task => task.category))).map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryItem,
              selectedCategory === category && styles.selectedCategoryItem
            ]}
            onPress={() => toggleCategory(category)}
          >
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category}</Text>
              <Ionicons 
                name={expandedCategories.has(category) ? 'chevron-down' : 'chevron-forward'} 
                size={16} 
                color={theme.colors.text.secondary} 
              />
            </View>
            <Text style={styles.categoryCount}>
              {getCategoryTasks(category).length} tasks
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTasksColumn = () => (
    <View style={styles.column}>
      <View style={styles.columnHeader}>
        <Text style={styles.columnTitle}>
          {selectedCategory ? `${selectedCategory} Tasks` : 'Select a Category'}
        </Text>
        {selectedCategory && (
          <TouchableOpacity 
            onPress={() => toggleCategoryAll(selectedCategory)}
            style={styles.selectAllButton}
          >
            <Text style={styles.selectAllText}>Select All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.columnContent}>
        {selectedCategory ? (
          getCategoryTasks(selectedCategory).map(task => (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.taskItem,
                selectedTasks.has(task.id) && styles.selectedTaskItem,
                scheduledTasks.has(task.id) && styles.scheduledTaskItem
              ]}
              onPress={() => toggleTask(task.id)}
            >
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle} numberOfLines={2}>
                  {task.title}
                </Text>
                {scheduledTasks.has(task.id) && (
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                )}
              </View>
              <View style={styles.taskMeta}>
                <Text style={styles.taskFrequency}>{task.frequency}</Text>
                <TouchableOpacity
                  onPress={() => handleFrequencySelect(task, task.frequency)}
                  style={styles.frequencyButton}
                >
                  <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Select a category to view tasks</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderSelectedColumn = () => (
    <View style={styles.column}>
      <View style={styles.columnHeader}>
        <Text style={styles.columnTitle}>Selected Tasks</Text>
        <Text style={styles.selectedCount}>{selectedTasks.size} selected</Text>
      </View>
      
      <ScrollView style={styles.columnContent}>
        {Array.from(selectedTasks).map(taskId => {
          const task = tasks.find(t => t.id === taskId);
          if (!task) return null;
          
          return (
            <View key={taskId} style={styles.selectedTaskItem}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle} numberOfLines={2}>
                  {task.title}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleTask(taskId)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={16} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
              <Text style={styles.taskCategory}>{task.category}</Text>
              <Text style={styles.taskFrequency}>{task.frequency}</Text>
            </View>
          );
        })}
        
        {selectedTasks.size === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No tasks selected</Text>
          </View>
        )}
      </ScrollView>
      
      {selectedTasks.size > 0 && (
        <View style={styles.actionPanel}>
          <Button
            title={`Schedule ${selectedTasks.size} Tasks`}
            onPress={handleScheduleTasks}
            disabled={isLoading}
            style={styles.scheduleButton}
          />
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>{loadingStage}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={sharedStyles.container}>
      <ThreeColumnLayout
        leftPanel={renderCategoryColumn()}
        centerPanel={renderTasksColumn()}
        rightPanel={renderSelectedColumn()}
        backgroundColor={theme.colors.background}
      />
      
      <FrequencyModal
        visible={showFrequencyModal}
        onClose={() => {
          setShowFrequencyModal(false);
          setEditingTask(null);
        }}
        onSelect={(frequency) => {
          if (editingTask) {
            const updatedTasks = tasks.map(task =>
              task.id === editingTask.id ? { ...task, frequency } : task
            );
            setTasks(updatedTasks);
          }
          setShowFrequencyModal(false);
          setEditingTask(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  column: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: getResponsiveValue(8, 12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getResponsiveValue(12, 16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  columnTitle: {
    fontSize: getResponsiveFontSize(16, 18),
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  selectedCount: {
    fontSize: getResponsiveFontSize(12, 14),
    color: theme.colors.text.secondary,
  },
  collapseButton: {
    padding: 4,
  },
  selectAllButton: {
    padding: 4,
  },
  selectAllText: {
    fontSize: getResponsiveFontSize(12, 14),
    color: theme.colors.primary,
    fontWeight: '500',
  },
  columnContent: {
    flex: 1,
    padding: getResponsiveValue(8, 12),
  },
  categoryItem: {
    padding: getResponsiveValue(12, 16),
    borderRadius: 8,
    marginBottom: getResponsiveValue(4, 6),
    backgroundColor: '#f8f9fa',
  },
  selectedCategoryItem: {
    backgroundColor: theme.colors.primary + '20',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveValue(4, 6),
  },
  categoryName: {
    fontSize: getResponsiveFontSize(14, 16),
    fontWeight: '600',
    color: theme.colors.text.primary,
    textTransform: 'capitalize',
  },
  categoryCount: {
    fontSize: getResponsiveFontSize(12, 14),
    color: theme.colors.text.secondary,
  },
  taskItem: {
    padding: getResponsiveValue(12, 16),
    borderRadius: 8,
    marginBottom: getResponsiveValue(4, 6),
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedTaskItem: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  scheduledTaskItem: {
    backgroundColor: theme.colors.success + '20',
    borderColor: theme.colors.success,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: getResponsiveValue(4, 6),
  },
  taskTitle: {
    fontSize: getResponsiveFontSize(14, 16),
    fontWeight: '500',
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: getResponsiveValue(8, 12),
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskFrequency: {
    fontSize: getResponsiveFontSize(12, 14),
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  taskCategory: {
    fontSize: getResponsiveFontSize(12, 14),
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
    marginBottom: getResponsiveValue(2, 4),
  },
  frequencyButton: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveValue(40, 60),
  },
  emptyText: {
    fontSize: getResponsiveFontSize(14, 16),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: getResponsiveValue(8, 12),
  },
  actionPanel: {
    padding: getResponsiveValue(12, 16),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  scheduleButton: {
    marginBottom: getResponsiveValue(8, 12),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: getResponsiveFontSize(12, 14),
    color: theme.colors.text.secondary,
    marginLeft: getResponsiveValue(8, 12),
  },
}); 