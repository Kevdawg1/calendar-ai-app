import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
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
    const loadData = () => {
      const allTasks = taskService.getAllTasks();
      const allGoals = goalService.getAllGoals();
      setTasks(allTasks);
      setGoals(allGoals);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (route.params?.tasks) {
      const newTasks = taskService.addTasks(route.params.tasks);
      setTasks(prevTasks => [...prevTasks, ...newTasks]);
    }
  }, [route.params?.tasks]);

  const getGoalText = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.text : 'Unknown Goal';
  };

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TaskEdit', { taskId });
  };

  const handleDeleteTask = (taskId: string) => {
    taskService.deleteTask(taskId);
    setTasks(taskService.getAllTasks());
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter(task => task.startDate === date);
  };

  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};
    tasks.forEach(task => {
      marked[task.startDate] = {
        marked: true,
        dotColor: task.status === 'completed' ? '#34C759' : '#007AFF'
      };
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

  const handleAddTask = () => {
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

    const addedTask = taskService.addTasks([task])[0];
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
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    const updatedTask = taskService.updateTask(taskId, { status: newStatus });
    if (updatedTask) {
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
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