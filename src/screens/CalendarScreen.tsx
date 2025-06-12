import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import { taskService } from '../services/taskService';
import { goalService } from '../services/goalService';
import { Task, Goal } from '../types';
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';

type CalendarScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Calendar'>;
  route: RouteProp<RootStackParamList, 'Calendar'>;
};

export default function CalendarScreen({ navigation, route }: CalendarScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

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
              <Text style={styles.taskDuration}>Duration: {task.duration} minutes</Text>
              <Text style={styles.taskDuration}>Start Time: {task.startTime}</Text>
              <Text style={styles.taskDuration}>End Time: {task.endTime}</Text>
              <Text style={styles.taskGoal}>Goal: {getGoalText(task.goalId)}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: task.status === 'completed' ? '#34C759' : '#FF9500' }
              ]}>
                <Text style={styles.statusText}>{task.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {getTasksForDate(selectedDate).length === 0 && (
            <Text style={styles.emptyText}>No tasks scheduled for this day</Text>
          )}
        </ScrollView>
      </View>
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
}); 