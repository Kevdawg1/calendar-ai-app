import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { taskService } from '../services/taskService';
import { Task } from '../types';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type TaskEditScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TaskEdit'>;
  route: RouteProp<RootStackParamList, 'TaskEdit'>;
};

export default function TaskEditScreen({ navigation, route }: TaskEditScreenProps) {
  const { taskId } = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      const task = await taskService.getTask(taskId);
      if (task) {
        setTask(task);
        setTitle(task.title);
        setDescription(task.description);
        setDuration(task.duration.toString());
        
        // Parse start date
        const [year, month, day] = (task.startDate || '1970-01-01').split('-').map(Number);
        const startDate = new Date(year, month - 1, day);
        setStartDate(startDate);

        // Parse start and end times
        if ((task.startTime || '') && (task.endTime || '')) {
          const [startHours, startMinutes] = (task.startTime || '00:00').split(':').map(Number);
          const [endHours, endMinutes] = (task.endTime || '00:00').split(':').map(Number);
          
          const newStartTime = new Date(startDate);
          newStartTime.setHours(startHours, startMinutes);
          setStartTime(newStartTime);

          const newEndTime = new Date(startDate);
          newEndTime.setHours(endHours, endMinutes);
          setEndTime(newEndTime);
        }
      }
    };

    loadTask();
  }, [taskId]);

  const formatDate = (date: Date) => {
    // Returns YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date) => {
    // Returns HH:mm
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('Error', 'Please enter a valid duration in minutes');
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Error', 'Start time must be before end time');
      return;
    }

    try {
      const updates = {
        title: title.trim(),
        description: description.trim(),
        duration: durationNum,
        startDate: formatDate(startDate),
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
      };

      const updatedTask = await taskService.updateTask(taskId, updates);

      if (updatedTask) {
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleStatusChange = async (status: Task['status']) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, { status });
      if (updatedTask) {
        setTask(updatedTask);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const handleStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // Update start and end times to use the new date
      const newStartTime = new Date(selectedDate);
      newStartTime.setHours(startTime.getHours(), startTime.getMinutes());
      setStartTime(newStartTime);

      const newEndTime = new Date(selectedDate);
      newEndTime.setHours(endTime.getHours(), endTime.getMinutes());
      setEndTime(newEndTime);
    }
  };

  const handleStartTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const handleEndTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setEndTime(selectedTime);
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Task title"
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Task description"
        multiline
        numberOfLines={4}
      />

      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        placeholder="Duration (minutes)"
        keyboardType="numeric"
      />

      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowStartDatePicker(true)}
      >
        <Text>Date: {formatDate(startDate)}</Text>
      </TouchableOpacity>

      <View style={styles.timeContainer}>
        <TouchableOpacity 
          style={styles.timeButton}
          onPress={() => setShowStartTimePicker(true)}
        >
          <Text>Start: {formatTime(startTime)}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.timeButton}
          onPress={() => setShowEndTimePicker(true)}
        >
          <Text>End: {formatTime(endTime)}</Text>
        </TouchableOpacity>
      </View>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={handleStartDateChange}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour={true}
          onChange={handleStartTimeChange}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          is24Hour={true}
          onChange={handleEndTimeChange}
        />
      )}

      <View style={styles.statusContainer}>
        <TouchableOpacity
          style={[styles.statusButton, task.status === 'pending' && styles.activeStatus]}
          onPress={() => handleStatusChange('pending')}
        >
          <Text>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusButton, task.status === 'completed' && styles.activeStatus]}
          onPress={() => handleStatusChange('completed')}
        >
          <Text>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusButton, task.status === 'cancelled' && styles.activeStatus]}
          onPress={() => handleStatusChange('cancelled')}
        >
          <Text>Cancelled</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeStatus: {
    backgroundColor: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 