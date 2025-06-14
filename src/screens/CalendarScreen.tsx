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

type CalendarScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Calendar'>;
  route: RouteProp<RootStackParamList, 'Calendar'>;
};

export default function CalendarScreen({ navigation, route }: CalendarScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    duration: '',
    startTime: '',
    endTime: '',
    goalId: ''
  });

  useEffect(() => {
    const loadData = async () => {
      const allTasks = await taskService.getAllTasks();
      const allGoals = goalService.getAllGoals();
      setTasks(allTasks);
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
            // Filter out any existing tasks with the same IDs
            const existingTaskIds = new Set(newTasks.map(task => task.id));
            const filteredPrevTasks = prevTasks.filter(task => !existingTaskIds.has(task.id));
            const updatedTasks = [...filteredPrevTasks, ...newTasks];
            console.log('Updated tasks state:', updatedTasks);
            return updatedTasks;
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

  const getTasksForDate = (date: string) => {
    console.log('Getting tasks for date:', date);
    const tasksForDate = tasks.filter(task => {
      // Check if task starts on this date
      if (task.startDate === date) {
        console.log('Found task starting on date:', task);
        return true;
      }

      // Check if task is recurring and falls on this date
      if (task.recurrence) {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.recurrence.endDate);
        const currentDate = new Date(date);

        // Check if date is within recurrence range
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
              // Check if it's the same day of the month
              return startDate.getDate() === currentDate.getDate() && 
                     // Check if the number of months between dates is divisible by the interval
                     ((currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      currentDate.getMonth() - startDate.getMonth()) % task.recurrence.interval === 0;
            case 'seasonal':
              // Check if it's the same day of the month
              return startDate.getDate() === currentDate.getDate() && 
                     // Check if the months are in the same season (0-2, 3-5, 6-8, 9-11)
                     Math.floor(startDate.getMonth() / 3) === Math.floor(currentDate.getMonth() / 3) &&
                     // Check if the number of seasons between dates is divisible by the interval
                     ((currentDate.getFullYear() - startDate.getFullYear()) * 4 + 
                      Math.floor(currentDate.getMonth() / 3) - Math.floor(startDate.getMonth() / 3)) % task.recurrence.interval === 0;
            default:
              return false;
          }
        })();

        if (isRecurring) {
          console.log('Found recurring task for date:', task);
        }
        return isRecurring;
      }

      return false;
    });
    console.log('Tasks for date:', tasksForDate);
    return tasksForDate;
  };

  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};
    tasks.forEach(task => {
      if (task.recurrence) {
        // Mark all recurring dates
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.recurrence.endDate);
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          marked[dateStr] = {
            marked: true,
            dotColor: task.status === 'completed' ? '#34C759' : '#007AFF'
          };
          // Increment date based on recurrence
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
              currentDate = new Date(endDate.getTime() + 1); // break loop
          }
        }
      } else {
        // Mark single date
        marked[task.startDate] = {
          marked: true,
          dotColor: task.status === 'completed' ? '#34C759' : '#007AFF'
        };
      }
    });
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#007AFF'
    };
    return marked;
  };

  const formatTime = (time: string) => {
    return time; // Assuming time is already in HH:MM format
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    const durationNum = parseInt(newTask.duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    if (!newTask.startTime || !newTask.endTime) {
      Alert.alert('Error', 'Please enter both start and end times');
      return;
    }

    const task: Task = {
      id: generateUUID(),
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      duration: durationNum,
      startDate: selectedDate,
      startTime: newTask.startTime,
      endTime: newTask.endTime,
      goalId: newTask.goalId || 'no-goal',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const addedTask = (await taskService.addTasks([task]))[0];
      setTasks([...tasks, addedTask]);
      setIsAddTaskModalVisible(false);
      setNewTask({
        title: '',
        description: '',
        duration: '',
        startTime: '',
        endTime: '',
        goalId: ''
      });
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task');
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

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        markedDates={getMarkedDates()}
        theme={{
          todayTextColor: '#007AFF',
          selectedDayBackgroundColor: '#007AFF',
          dotColor: '#007AFF',
          arrowColor: '#007AFF',
        }}
      />
      
      <View style={styles.tasksContainer}>
        <Text style={styles.dateTitle}>
          {format(parseISO(selectedDate), 'MMMM d, yyyy')}
        </Text>
        <ScrollView style={styles.taskList}>
          {getTasksForDate(selectedDate).map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskItem}
              onPress={() => handleTaskPress(task.id)}
            >
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTask(task.id)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <Text style={styles.taskTime}>
                {formatTime(task.startTime)} - {formatTime(task.endTime)}
              </Text>
              <Text style={styles.taskGoal}>Goal: {getGoalText(task.goalId)}</Text>
              <View style={styles.statusContainer}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    task.status === 'pending' && styles.statusButtonActive
                  ]}
                  onPress={() => handleStatusChange(task.id, 'pending')}
                >
                  <Text style={[
                    styles.statusButtonText,
                    task.status === 'pending' && styles.statusButtonTextActive
                  ]}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    task.status === 'completed' && styles.statusButtonActive
                  ]}
                  onPress={() => handleStatusChange(task.id, 'completed')}
                >
                  <Text style={[
                    styles.statusButtonText,
                    task.status === 'completed' && styles.statusButtonTextActive
                  ]}>Completed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    task.status === 'cancelled' && styles.statusButtonActive
                  ]}
                  onPress={() => handleStatusChange(task.id, 'cancelled')}
                >
                  <Text style={[
                    styles.statusButtonText,
                    task.status === 'cancelled' && styles.statusButtonTextActive
                  ]}>Cancelled</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          {getTasksForDate(selectedDate).length === 0 && (
            <Text style={styles.emptyText}>No tasks scheduled for this day</Text>
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddTaskModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={isAddTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddTaskModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              multiline
              value={newTask.description}
              onChangeText={(text) => setNewTask({ ...newTask, description: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Duration (minutes)"
              keyboardType="numeric"
              value={newTask.duration}
              onChangeText={(text) => setNewTask({ ...newTask, duration: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Start Time (HH:MM)"
              value={newTask.startTime}
              onChangeText={(text) => setNewTask({ ...newTask, startTime: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="End Time (HH:MM)"
              value={newTask.endTime}
              onChangeText={(text) => setNewTask({ ...newTask, endTime: text })}
            />

            <View style={styles.goalSelector}>
              <Text style={styles.label}>Associated Goal (Optional)</Text>
              <ScrollView style={styles.goalList}>
                <TouchableOpacity
                  style={[
                    styles.goalOption,
                    !newTask.goalId && styles.selectedGoal
                  ]}
                  onPress={() => setNewTask({ ...newTask, goalId: '' })}
                >
                  <Text style={styles.goalOptionText}>No Goal</Text>
                </TouchableOpacity>
                {goals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalOption,
                      newTask.goalId === goal.id && styles.selectedGoal
                    ]}
                    onPress={() => setNewTask({ ...newTask, goalId: goal.id })}
                  >
                    <Text style={styles.goalOptionText}>{goal.text}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddTaskModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddTask}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  taskTime: {
    fontSize: 16,
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
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
    marginTop: 8,
  },
  statusButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
  },
  statusButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
}); 