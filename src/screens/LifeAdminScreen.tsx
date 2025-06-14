import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { Button } from '../components/Button';
import { Section } from '../components/Section';
import { Badge } from '../components/Badge';
import { lifeAdminTasks, LifeAdminTask } from '../data/lifeAdminTasks';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { lifeAdminService } from '../services/lifeAdminService';
import { taskService } from '../services/taskService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const LifeAdminScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // Get unique categories
  const categories = Array.from(new Set(lifeAdminTasks.map(task => task.category)));

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
    const categoryTasks = lifeAdminTasks.filter(task => task.category === category);
    const categoryTaskIds = new Set(categoryTasks.map(task => task.id));
    
    // Check if all tasks in the category are currently selected
    const allSelected = categoryTasks.every(task => selectedTasks.has(task.id));
    
    const newSelected = new Set(selectedTasks);
    if (allSelected) {
      // If all are selected, deselect all tasks in this category
      categoryTaskIds.forEach(taskId => newSelected.delete(taskId));
    } else {
      // If not all are selected, select all tasks in this category
      categoryTaskIds.forEach(taskId => newSelected.add(taskId));
    }
    setSelectedTasks(newSelected);
  };

  const handleScheduleTasks = async () => {
    const selectedTaskIds = Array.from(selectedTasks);
    if (selectedTaskIds.length === 0) {
      Alert.alert('No Tasks Selected', 'Please select at least one task to schedule.');
      return;
    }
    
    const selectedTasksList = lifeAdminTasks.filter(task => selectedTaskIds.includes(task.id));
    
    try {
      Alert.alert(
        'Schedule Tasks',
        `Scheduling ${selectedTasksList.length} tasks...`,
        [{ text: 'OK' }]
      );

      const scheduledTasks = await lifeAdminService.scheduleTasks(selectedTasksList);
      // Add goalId to each task
      const tasksWithGoalId = scheduledTasks.map(task => ({
        ...task,
        goalId: 'life-admin' // Use a special goalId for life admin tasks
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
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Schedule Life Admin Tasks"
          onPress={handleScheduleTasks}
          style={styles.scheduleButton}
        />
      </View>

      <ScrollView style={styles.content}>
        <Section title="">
          <Text style={styles.description}>
            Manage your recurring life admin tasks. Select the tasks you want to schedule in your calendar.
          </Text>

          {categories.map((category) => (
            <View key={category} style={styles.categoryContainer}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category)}
              >
                <View style={styles.categoryHeaderContent}>
                  <Checkbox
                    value={lifeAdminTasks
                      .filter(task => task.category === category)
                      .every(task => selectedTasks.has(task.id))}
                    onValueChange={() => toggleCategoryAll(category)}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.categoryTitle}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </View>
                <Ionicons
                  name={expandedCategories.has(category) ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>

              {expandedCategories.has(category) && (
                <View style={styles.tasksContainer}>
                  {lifeAdminTasks
                    .filter(task => task.category === category)
                    .map((task) => (
                      <View key={task.id} style={styles.taskItem}>
                        <View style={styles.taskContent}>
                          <Checkbox
                            value={selectedTasks.has(task.id)}
                            onValueChange={() => toggleTask(task.id)}
                            color={selectedTasks.has(task.id) ? theme.colors.primary : undefined}
                          />
                          <View style={styles.taskInfo}>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            <Badge
                              label={task.frequency}
                              color={task.frequency === 'daily' ? theme.colors.primary : theme.colors.secondary}
                            />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  scheduleButton: {
    width: '100%',
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  categoryContainer: {
    marginBottom: theme.spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  tasksContainer: {
    marginTop: theme.spacing.sm,
  },
  taskItem: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  taskTitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
}); 