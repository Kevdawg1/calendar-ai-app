import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { taskService } from '../services/taskService';
import { goalService } from '../services/goalService';
import { Task, Goal } from '../types';
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import { generateUUID } from '../utils/uuid';
import { theme } from '../theme';
import { commonStyles } from '../theme/styles';
import { TimeGrid } from '../components/TimeGrid';
import { AddTaskModal } from '../components/AddTaskModal';

type CalendarScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Calendar'>;
  route: RouteProp<RootStackParamList, 'Calendar'>;
};

const HOUR_HEIGHT = 60; // Height of each hour row in pixels

export default function CalendarScreen({ navigation, route }: CalendarScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const allTasks = await taskService.getAllTasks();
      const allGoals = goalService.getAllGoals();
      const filteredTasks = allTasks.filter(
        (t: any) => t && t.startDate && t.goalId && t.status && t.createdAt && t.updatedAt
      );
      setTasks(filteredTasks);
      setGoals(allGoals);
    };

    loadData();
  }, []);

  useEffect(() => {
    const handleNewTasks = async () => {
      if (route.params?.tasks) {
        try {
          console.log('Received tasks from route params:', route.params.tasks);
          const newTasks = await taskService.addTasks(route.params.tasks);
          console.log('Added tasks to service:', newTasks);
          setTasks(prevTasks => {
            const existingTaskIds = new Set(newTasks.map(task => task.id));
            const filteredPrevTasks = prevTasks.filter(task => !existingTaskIds.has(task.id));
            return [...filteredPrevTasks, ...newTasks];
          });
        } catch (error) {
          console.error('Error adding tasks:', error);
          Alert.alert('Error', 'Failed to add tasks to calendar');
        }
      }
    };

    handleNewTasks();
  }, [route.params?.tasks]);

  const getGoalText = (goalId: string) => {
    if (goalId === 'life-admin') {
      return 'Life Admin';
    }
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.text : 'Unknown Goal';
  };

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TaskEdit', { taskId });
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      const updatedTasks = await taskService.getAllTasks();
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, { status: newStatus });
      if (updatedTask) {
        const updatedTasks = await taskService.getAllTasks();
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const handleAddTask = async (taskData: {
    title: string;
    description: string;
    duration: string;
    startTime: string;
    endTime: string;
    goalId: string;
  }) => {
    if (!taskData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    const durationNum = parseInt(taskData.duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    if (!taskData.startTime || !taskData.endTime) {
      Alert.alert('Error', 'Please enter both start and end times');
      return;
    }

    const task: Task = {
      id: generateUUID(),
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      duration: durationNum,
      startDate: selectedDate,
      startTime: taskData.startTime,
      endTime: taskData.endTime,
      goalId: taskData.goalId || 'no-goal',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const addedTask = (await taskService.addTasks([task]))[0];
      setTasks([...tasks, addedTask]);
      setIsAddTaskModalVisible(false);
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter(task => {
      if (!task.startDate || !task.goalId || !task.status || !task.createdAt || !task.updatedAt) return false;
      if (task.startDate === date) {
        return true;
      }
      if (task.recurrence) {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.recurrence.endDate);
        const currentDate = new Date(date);
        if (currentDate < startDate || currentDate > endDate) {
          return false;
        }
        const daysDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const isRecurring = (() => {
          switch (task.recurrence.frequency) {
            case 'daily':
              return true;
            case 'weekly':
              return daysDiff % (7 * task.recurrence.interval) === 0;
            case 'monthly':
              return startDate.getDate() === currentDate.getDate() &&
                ((currentDate.getFullYear() - startDate.getFullYear()) * 12 +
                  currentDate.getMonth() - startDate.getMonth()) % task.recurrence.interval === 0;
            case 'seasonal':
              return startDate.getDate() === currentDate.getDate() &&
                Math.floor(startDate.getMonth() / 3) === Math.floor(currentDate.getMonth() / 3) &&
                ((currentDate.getFullYear() - startDate.getFullYear()) * 4 +
                  Math.floor(currentDate.getMonth() / 3) - Math.floor(startDate.getMonth() / 3)) % task.recurrence.interval === 0;
            default:
              return false;
          }
        })();
        return isRecurring;
      }
      return false;
    });
  };

  const getMarkedDates = (tasks: Task[]) => {
    const marked: { [key: string]: any } = {};
    tasks.forEach(task => {
      if (task.recurrence) {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.recurrence.endDate);
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          if (!marked[dateStr]) {
            marked[dateStr] = {
              dots: []
            };
          }
          const color = task.goalId === 'life-admin' ? '#007AFF' : '#FF9500';
          if (!marked[dateStr].dots.some((dot: any) => dot.color === color)) {
            marked[dateStr].dots.push({
              color,
              key: task.id
            });
          }
          switch (task.recurrence.frequency) {
            case 'daily':
              currentDate.setDate(currentDate.getDate() + task.recurrence.interval);
              break;
            case 'weekly':
              currentDate.setDate(currentDate.getDate() + 7 * task.recurrence.interval);
              break;
            case 'monthly':
              currentDate.setMonth(currentDate.getMonth() + task.recurrence.interval);
              break;
            case 'seasonal':
              currentDate.setMonth(currentDate.getMonth() + 3 * task.recurrence.interval);
              break;
            default:
              currentDate = new Date(endDate.getTime() + 1);
          }
        }
      } else {
        if (!marked[task.startDate]) {
          marked[task.startDate] = {
            dots: []
          };
        }
        const color = task.goalId === 'life-admin' ? '#007AFF' : '#FF9500';
        if (!marked[task.startDate].dots.some((dot: any) => dot.color === color)) {
          marked[task.startDate].dots.push({
            color,
            key: task.id
          });
        }
      }
    });

    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = '#007AFF';
    }

    return marked;
  };

  const validTasks: Task[] = tasks.filter(
    (t: any) => t && t.startDate && t.goalId && t.status && t.createdAt && t.updatedAt
  );

  return (
    <View style={commonStyles.container}>
      <Calendar
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        markedDates={getMarkedDates(validTasks)}
        markingType="multi-dot"
        theme={{
          todayTextColor: theme.colors.primary,
          selectedDayBackgroundColor: theme.colors.primary,
          dotColor: theme.colors.primary,
          arrowColor: theme.colors.primary,
        }}
      />
      <View style={commonStyles.content}>
        <Text style={commonStyles.title}>
          {format(parseISO(selectedDate), 'MMMM d, yyyy')}
        </Text>
        <ScrollView style={commonStyles.content}>
          <TimeGrid
            tasks={getTasksForDate(selectedDate)}
            onTaskPress={handleTaskPress}
            onTaskDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            getGoalText={getGoalText}
          />
          {getTasksForDate(selectedDate).length === 0 && (
            <Text style={commonStyles.textSecondary}>No tasks scheduled for this day</Text>
          )}
        </ScrollView>
      </View>
      <TouchableOpacity
        style={[commonStyles.card, { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', ...theme.shadows.md }]}
        onPress={() => setIsAddTaskModalVisible(true)}
      >
        <Text style={{ fontSize: 30, color: theme.colors.text.inverse, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>

      <AddTaskModal
        visible={isAddTaskModalVisible}
        onClose={() => setIsAddTaskModalVisible(false)}
        onSave={handleAddTask}
        goals={goals}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tasksContainer: {
    flex: 1,
    padding: 16,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taskList: {
    flex: 1,
  },
  taskItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#FF3B30',
  },
  taskDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskGoal: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  goalSelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  goalList: {
    maxHeight: 150,
  },
  goalOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedGoal: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  goalOptionText: {
    fontSize: 16,
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
  },
  statusButtonText: {
    fontSize: 12,
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  timeGrid: {
    flex: 1,
  },
  hourRow: {
    flexDirection: 'row',
    minHeight: HOUR_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  hourLabel: {
    width: 60,
    padding: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  hourContent: {
    flex: 1,
    padding: 4,
  },
  completedTask: {
    backgroundColor: '#f0f0f0',
    borderColor: '#d0d0d0',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}); 