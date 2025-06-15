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
import { commonStyles as sharedCommonStyles, colors, spacing } from '../styles/common';
import { Task } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const LifeAdminScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<LifeAdminTask | null>(null);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [tasks, setTasks] = useState<LifeAdminTask[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | undefined>();

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
      const prefs = await userPreferencesService.getPreferences();
      setUserPreferences(prefs || undefined);
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
    try {
      setLoading(true);
      const scheduled = await lifeAdminService.scheduleTasks(tasks, userPreferences);
      setScheduledTasks(scheduled);
      Alert.alert('Success', 'Tasks have been scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling tasks:', error);
      Alert.alert('Error', 'Failed to schedule tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={sharedCommonStyles.screenContainer}>
      <Text style={sharedCommonStyles.title}>Life Admin Tasks</Text>
      
      <ScrollView style={{ flex: 1 }}>
        {tasks.map((task, index) => (
          <View key={index} style={sharedCommonStyles.card}>
            <Text style={sharedCommonStyles.subtitle}>{task.title}</Text>
            <Text style={{ color: colors.gray[600] }}>Category: {task.category}</Text>
            <Text style={{ color: colors.gray[600] }}>Frequency: {task.frequency}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[sharedCommonStyles.button, { marginTop: spacing.md }]}
        onPress={handleScheduleTasks}
        disabled={loading || tasks.length === 0}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={sharedCommonStyles.buttonText}>
            Schedule Tasks
          </Text>
        )}
      </TouchableOpacity>
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