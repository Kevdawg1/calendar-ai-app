import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
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
import { sharedStyles } from '../theme/styles';
import { TimeGrid } from '../components/TimeGrid';
import { AddTaskModal } from '../components/AddTaskModal';
import { Ionicons } from '@expo/vector-icons';

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
          const newTasks = await taskService.addTasks(route.params.tasks as Task[]);
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

  return (
    <View style={sharedStyles.container}>
      <Calendar
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        markedDates={getMarkedDates(tasks)}
        theme={{
          todayTextColor: theme.colors.primary,
          selectedDayBackgroundColor: theme.colors.primary,
          dotColor: theme.colors.primary,
          arrowColor: theme.colors.primary,
        }}
      />

      <ScrollView style={sharedStyles.content} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={sharedStyles.header}>
          <Text style={sharedStyles.header}>
            {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
          </Text>
          <TouchableOpacity
            style={sharedStyles.button}
            onPress={() => setIsAddTaskModalVisible(true)}
          >
            <Text style={sharedStyles.buttonText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        <TimeGrid
          tasks={getTasksForDate(selectedDate)}
          onTaskPress={handleTaskPress}
          onTaskDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          getGoalText={getGoalText}
        />
      </ScrollView>

      <TouchableOpacity
        style={sharedStyles.fab}
        onPress={() => setIsAddTaskModalVisible(true)}
        accessibilityLabel="Add Task"
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <AddTaskModal
        visible={isAddTaskModalVisible}
        onClose={() => setIsAddTaskModalVisible(false)}
        onSave={handleAddTask}
        goals={goals}
        selectedDate={selectedDate}
      />
    </View>
  );
} 