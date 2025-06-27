import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calendarKey, setCalendarKey] = useState(0);
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [updateAll, setUpdateAll] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(true);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const calendarRef = React.useRef<any>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setIsCalendarVisible(!isCalendarVisible)} style={{ marginRight: 10 }}>
          <Ionicons name={isCalendarVisible ? 'eye-off-outline' : 'eye-outline'} size={24} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isCalendarVisible]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading tasks and goals...');
        const allTasks = await taskService.getAllTasks();
        const allGoals = await goalService.getAllGoals();
        
        console.log('Loaded tasks:', allTasks);
        console.log('Loaded goals:', allGoals);
        
        const filteredTasks = allTasks.filter(
          (t: any) => {
            const isValid = t && t.startDate && t.goalId && t.status && t.createdAt && t.updatedAt;
            if (!isValid) {
              console.log('Invalid task found:', t);
            }
            return isValid;
          }
        );
        
        console.log('Filtered tasks:', filteredTasks);
        setTasks(filteredTasks);
        setGoals(allGoals);
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load tasks and goals');
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (route.params?.tasks) {
      const newTasks = route.params.tasks as Task[];
      setTasks(prevTasks => [...prevTasks, ...newTasks]);
    }
  }, [route.params?.tasks]);

  const getGoalText = (goalId: string) => {
    if (goalId === 'life-admin') {
      return 'Life Admin';
    }
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.text : 'Unknown Goal';
  };

  const handleTaskPress = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.recurrence) {
      Alert.alert(
        'Update Recurring Task',
        'Would you like to update this occurrence only or all future occurrences?',
        [
          {
            text: 'This Occurrence Only',
            onPress: () => {
              setTaskToEdit(task);
              setIsEditing(true);
              setUpdateAll(false);
              setIsAddTaskModalVisible(true);
            },
          },
          {
            text: 'All Future Occurrences',
            onPress: () => {
              setTaskToEdit(task);
              setIsEditing(true);
              setUpdateAll(true);
              setIsAddTaskModalVisible(true);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      setTaskToEdit(task);
      setIsEditing(true);
      setUpdateAll(false);
      setIsAddTaskModalVisible(true);
    }
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
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.recurrence) {
      Alert.alert(
        'Update Recurring Task',
        'Would you like to update this occurrence only or all future occurrences?',
        [
          {
            text: 'This Occurrence Only',
            onPress: async () => {
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
            },
          },
          {
            text: 'All Future Occurrences',
            onPress: async () => {
              try {
                const updatedTasks = await taskService.updateRecurringTask(taskId, { status: newStatus });
                setTasks(updatedTasks);
              } catch (error) {
                console.error('Error updating recurring task status:', error);
                Alert.alert('Error', 'Failed to update recurring task status');
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
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
    }
  };

  const handleAddTask = async (taskData: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    goalId: string;
    startDate: string;
    recurrence?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal';
      interval: number;
      endDate: string;
    };
  }) => {
    if (!taskData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!taskData.startTime || !taskData.endTime) {
      Alert.alert('Error', 'Please enter both start and end times');
      return;
    }

    if (isEditing && taskToEdit) {
      try {
        if (updateAll && taskToEdit.recurrence) {
          const updatedTasks = await taskService.updateRecurringTask(taskToEdit.id, {
            ...taskData,
          });
          setTasks(updatedTasks);
        } else {
          const updatedTask = await taskService.updateTask(taskToEdit.id, {
            ...taskData,
          });
          if (updatedTask) {
            const updatedTasks = await taskService.getAllTasks();
            setTasks(updatedTasks);
          }
        }
        setIsAddTaskModalVisible(false);
        setTaskToEdit(undefined);
        setIsEditing(false);
        setUpdateAll(false);
      } catch (error) {
        console.error('Error updating task:', error);
        Alert.alert('Error', 'Failed to update task');
      }
    } else {
      const task: Task = {
        id: generateUUID(),
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        startDate: taskData.startDate,
        startTime: taskData.startTime,
        endTime: taskData.endTime,
        goalId: taskData.goalId || 'no-goal',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        recurrence: taskData.recurrence,
      };

      try {
        const addedTask = (await taskService.addTasks([task]))[0];
        setTasks(prev => [...prev, addedTask]);
        setIsAddTaskModalVisible(false);
      } catch (error) {
        console.error('Error adding task:', error);
        Alert.alert('Error', 'Failed to add task');
      }
    }
  };

  const getTasksForDate = (date: string) => {
    const tasksForDay = tasks.filter(task => {
      if (!task.startDate || !task.goalId || !task.status || !task.createdAt || !task.updatedAt) {
        console.log('Task filtered out due to missing required fields:', task);
        return false;
      }
      
      if (task.startDate === date) {
        console.log('Task matches date:', task);
        return true;
      }
      
      if (task.recurrence) {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.recurrence.endDate);
        const currentDate = new Date(date);
        
        if (currentDate < startDate || currentDate > endDate) {
          console.log('Task outside recurrence range:', task);
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
        
        if (isRecurring) {
          console.log('Task is recurring for this date:', task);
        }
        return isRecurring;
      }
      
      return false;
    });

    return tasksForDay.sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0];
      }
      return timeA[1] - timeB[1];
    });
  };

  const getGoalColor = (goalId: string) => {
    if (goalId === 'life-admin') return '#007AFF';
    const goal = goals.find(g => g.id === goalId);
    return goal?.color || '#FF9500';
  };

  const getMarkedDates = (tasks: Task[]) => {
    console.log('Getting marked dates for tasks:', tasks);
    const marked: { [key: string]: any } = {};
    
    // Always mark the selected date
    marked[selectedDate] = {
      selected: true,
      selectedColor: theme.colors.primary,
      dots: []
    };
    
    tasks.forEach(task => {
      const color = getGoalColor(task.goalId);
      console.log('Processing task:', task.id, 'with color:', color);
      
      if (task.recurrence) {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.recurrence.endDate);
        let currentDate = new Date(startDate);
        console.log('Processing recurring task from', startDate, 'to', endDate);
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          if (!marked[dateStr]) {
            marked[dateStr] = { dots: [] };
          }
          if (!marked[dateStr].dots.some((dot: any) => dot.color === color)) {
            marked[dateStr].dots.push({ color, key: task.id });
            console.log('Added dot for date:', dateStr, 'with color:', color);
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
          marked[task.startDate] = { dots: [] };
        }
        if (!marked[task.startDate].dots.some((dot: any) => dot.color === color)) {
          marked[task.startDate].dots.push({ color, key: task.id });
          console.log('Added dot for non-recurring task on date:', task.startDate, 'with color:', color);
        }
      }
    });
    
    console.log('Final marked dates:', marked);
    return marked;
  };

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const handleMonthChange = (month: any) => {
    setCurrentMonth(format(new Date(month.timestamp), 'yyyy-MM-dd'));
  };

  const handleTodayPress = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setSelectedDate(today);
    setCurrentMonth(today);
    setCalendarKey(prev => prev + 1); // Force calendar re-render
    // Scroll to today's tasks
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <View style={sharedStyles.safeAreaContainer}>
        {isCalendarVisible && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={[sharedStyles.header, { marginBottom: 0 }]}>Calendar</Text>
              <TouchableOpacity style={styles.headerButton} onPress={handleTodayPress}>
                <Text style={styles.headerButtonText}>Today</Text>
              </TouchableOpacity>
            </View>
            <Calendar
              key={calendarKey}
              current={currentMonth}
              onMonthChange={handleMonthChange}
              onDayPress={handleDayPress}
              markedDates={getMarkedDates(tasks)}
              markingType="multi-dot"
              theme={{
                todayTextColor: theme.colors.primary,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: '#fff',
                dotColor: theme.colors.primary,
                selectedDotColor: '#fff',
                arrowColor: theme.colors.primary,
                dotStyle: {
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginTop: 2,
                },
                // @ts-ignore
                'stylesheet.calendar.main': {
                  container: {
                    paddingLeft: 5,
                    paddingRight: 5,
                  },
                  dayContainer: {
                    width: 32,
                    height: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  selected: {
                    backgroundColor: theme.colors.primary,
                    borderRadius: 16,
                    width: 32,
                    height: 32,
                  },
                  today: {
                    backgroundColor: 'transparent',
                  },
                  todayText: {
                    color: theme.colors.primary,
                  },
                },
                // @ts-ignore
                'stylesheet.calendar.header': {
                  dayTextAtIndex0: {
                    color: theme.colors.primary,
                  },
                },
              }}
            />
          </>
        )}

        <ScrollView
          ref={scrollViewRef}
          style={[sharedStyles.content, !isCalendarVisible && { flex: 1 }]}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={sharedStyles.header}>
            <Text style={sharedStyles.header}>
              {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>

          <TimeGrid
            tasks={getTasksForDate(selectedDate)}
            onTaskPress={handleTaskPress}
            onTaskDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            getGoalText={getGoalText}
            getGoalColor={getGoalColor}
          />
        </ScrollView>

        <TouchableOpacity
          style={sharedStyles.fab}
          onPress={() => setIsAddTaskModalVisible(true)}
          accessibilityLabel="Add Task"
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>

        {isAddTaskModalVisible && (
          <AddTaskModal
            isVisible={isAddTaskModalVisible}
            onClose={() => {
              setIsAddTaskModalVisible(false);
              setTaskToEdit(undefined);
              setIsEditing(false);
            }}
            onSubmit={handleAddTask}
            goals={goals}
            selectedDate={selectedDate}
            taskToEdit={taskToEdit}
            isEditing={isEditing}
            updateAll={updateAll}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  headerButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
}); 