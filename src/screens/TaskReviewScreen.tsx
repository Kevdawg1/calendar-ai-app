import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { sharedStyles } from '../theme/styles';
import { Task } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { AddTaskModal } from '../components/AddTaskModal';
import { taskService } from '../services/taskService';
import { goalService } from '../services/goalService';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type TaskReviewRouteProp = RouteProp<RootStackParamList, 'TaskReview'>;

export const TaskReviewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TaskReviewRouteProp>();
  const [tasks, setTasks] = useState<Task[]>(route.params?.tasks || []);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);

  React.useEffect(() => {
    // Load goals for the task modal
    const loadGoals = async () => {
      const allGoals = await goalService.getAllGoals();
      setGoals(allGoals);
    };
    loadGoals();

    // Set up navigation header
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={sharedStyles.headerButton}
          onPress={handleConfirmTasks}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>Confirm</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, tasks]);

  const handleConfirmTasks = async () => {
    try {
      await taskService.addTasks(tasks);
      navigation.navigate('Calendar', { tasks });
    } catch (error) {
      console.error('Error adding tasks:', error);
      Alert.alert('Error', 'Failed to add tasks to calendar. Please try again.');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowAddTaskModal(true);
  };

  const handleRemoveTask = (taskId: string) => {
    Alert.alert(
      'Remove Task',
      'Are you sure you want to remove this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setTasks(tasks.filter(t => t.id !== taskId));
          },
        },
      ]
    );
  };

  const handleSaveTask = (taskData: any) => {
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(t => 
        t.id === editingTask.id 
          ? { ...t, ...taskData }
          : t
      ));
    }
    setShowAddTaskModal(false);
    setEditingTask(null);
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={[sharedStyles.card, { borderLeftWidth: 6, borderLeftColor: item.goalId === 'life-admin' ? theme.colors.primary : goals.find(g => g.id === item.goalId)?.color || theme.colors.primary }]}>
      <View style={sharedStyles.cardHeader}>
        <Text style={sharedStyles.cardTitle}>{item.title}</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => handleEditTask(item)}
            style={sharedStyles.deleteButton}
          >
            <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRemoveTask(item.id)}
            style={sharedStyles.deleteButton}
          >
            <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={sharedStyles.cardContent}>
        {item.description && (
          <Text style={sharedStyles.cardText}>{item.description}</Text>
        )}
        <Text style={sharedStyles.cardText}>
          Duration: {item.duration} minutes
        </Text>
        <Text style={sharedStyles.cardText}>
          Date: {new Date(item.startDate).toLocaleDateString()}
        </Text>
        <Text style={sharedStyles.cardText}>
          Time: {item.startTime} - {item.endTime}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={sharedStyles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        contentContainerStyle={sharedStyles.content}
      />

      <AddTaskModal
        visible={showAddTaskModal}
        onClose={() => {
          setShowAddTaskModal(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        goals={goals}
        selectedDate={editingTask?.startDate || new Date().toISOString().split('T')[0]}
        taskToEdit={editingTask || undefined}
        isEditing={!!editingTask}
      />
    </View>
  );
}; 