import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
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
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    const task = taskService.getTask(taskId);
    if (task) {
      setTask(task);
      setTitle(task.title);
      const [startHours, startMinutes] = task.startTime.split(':').map(Number);
      const [endHours, endMinutes] = task.endTime.split(':').map(Number);
      const newStartTime = new Date();
      newStartTime.setHours(startHours, startMinutes);
      const newEndTime = new Date();
      newEndTime.setHours(endHours, endMinutes);
      setStartTime(newStartTime);
      setEndTime(newEndTime);
    }
  }, [taskId]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Error', 'Start time must be before end time');
      return;
    }

    const updatedTask = taskService.updateTask(taskId, {
      title: title.trim(),
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
    });

    if (updatedTask) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleStatusChange = (status: Task['status']) => {
    const updatedTask = taskService.updateTask(taskId, { status });
    if (updatedTask) {
      setTask(updatedTask);
    }
  };

  const handleStartTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowStartPicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const handleEndTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowEndPicker(false);
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
      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
        />

        <Text style={styles.label}>Start Time</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={styles.timeButtonText}>{formatTime(startTime)}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={handleStartTimeChange}
          />
        )}

        <Text style={styles.label}>End Time</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={styles.timeButtonText}>{formatTime(endTime)}</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={handleEndTimeChange}
          />
        )}

        <View style={styles.statusContainer}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusButtons}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                task.status === 'pending' && styles.statusButtonActive,
              ]}
              onPress={() => handleStatusChange('pending')}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  task.status === 'pending' && styles.statusButtonTextActive,
                ]}
              >
                Pending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                task.status === 'completed' && styles.statusButtonActive,
              ]}
              onPress={() => handleStatusChange('completed')}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  task.status === 'completed' && styles.statusButtonTextActive,
                ]}
              >
                Completed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusButton,
                task.status === 'cancelled' && styles.statusButtonActive,
              ]}
              onPress={() => handleStatusChange('cancelled')}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  task.status === 'cancelled' && styles.statusButtonTextActive,
                ]}
              >
                Cancelled
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: '#fff',
    padding: 16,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
  },
  statusButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 