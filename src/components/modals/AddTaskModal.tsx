import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../theme';
import { Goal, Task } from '../../types';
import { format } from 'date-fns';
import { FrequencyModal } from './FrequencyModal';
import { Button } from '../buttons/Button';

type AddTaskModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
  goals: Goal[];
  taskToEdit?: Task;
  isEditing?: boolean;
  updateAll?: boolean;
  selectedDate: string;
};

type Frequency = 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'none';

export function AddTaskModal({
  isVisible,
  onClose,
  onSubmit,
  goals,
  taskToEdit,
  isEditing = false,
  updateAll = false,
  selectedDate,
}: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [taskDate, setTaskDate] = useState(new Date(selectedDate));
  const [recurrence, setRecurrence] = useState<Task['recurrence'] | undefined>(
    undefined
  );

  // Modal states for pickers
  const [showStartTimePicker, setShowStartTimePicker] = useState(
    Platform.OS === 'ios'
  );
  const [showEndTimePicker, setShowEndTimePicker] = useState(
    Platform.OS === 'ios'
  );
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(
    Platform.OS === 'ios'
  );

  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  // Initialize form with task data when editing
  useEffect(() => {
    if (isEditing && taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setSelectedGoal(taskToEdit.goalId);
      const taskStartDate = taskToEdit.startDate
        ? new Date(taskToEdit.startDate)
        : new Date();
      setStartTime(
        taskToEdit.startTime
          ? new Date(`${format(taskStartDate, 'yyyy-MM-dd')}T${taskToEdit.startTime}`)
          : new Date()
      );
      setEndTime(
        taskToEdit.endTime
          ? new Date(`${format(taskStartDate, 'yyyy-MM-dd')}T${taskToEdit.endTime}`)
          : new Date()
      );
      setTaskDate(taskStartDate);
      if (taskToEdit.recurrence) {
        setRecurrence(taskToEdit.recurrence);
      }
    } else {
      resetForm();
    }
  }, [isEditing, taskToEdit, selectedDate]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    // Validate recurrence end date
    if (recurrence && new Date(recurrence.endDate) < taskDate) {
      Alert.alert('Error', 'Recurrence end date cannot be before the start date.');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      startTime: format(startTime, 'HH:mm'),
      endTime: format(endTime, 'HH:mm'),
      goalId: selectedGoal || 'no-goal',
      startDate: format(taskDate, 'yyyy-MM-dd'),
      recurrence: recurrence,
    };

    onSubmit(taskData);
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedGoal('');
    const now = new Date();
    const initialDate = selectedDate ? new Date(selectedDate) : now;
    setStartTime(now);
    setEndTime(new Date(now.getTime() + 60 * 60 * 1000)); // 1 hour later
    setTaskDate(initialDate);
    setRecurrence(undefined);
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }
    if (selectedDate) {
      if (selectedDate >= endTime) {
        const newEndTime = new Date(selectedDate);
        newEndTime.setHours(newEndTime.getHours() + 1);
        setEndTime(newEndTime);
      }
      setStartTime(selectedDate);
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    }
    if (selectedDate) {
      if (selectedDate <= startTime) {
        Alert.alert('Invalid Time', 'End time must be after start time', [
          { text: 'OK' },
        ]);
        return;
      }
      setEndTime(selectedDate);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setTaskDate(selectedDate);
    }
  };

  const handleFrequencySelect = (frequency: Frequency) => {
    setShowFrequencyModal(false);
    if (frequency === 'none') {
      setRecurrence(undefined);
      return;
    }
    // Set default end date based on frequency
    const now = new Date(taskDate);
    let endDate = new Date(now);
    switch (frequency) {
      case 'daily':
        endDate.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        endDate.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(now.getMonth() + 1);
        break;
      case 'seasonal':
        endDate.setMonth(now.getMonth() + 3);
        break;
    }
    setRecurrence({
      frequency,
      interval: 1,
      endDate: format(endDate, 'yyyy-MM-dd'),
    });
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate && recurrence) {
      // Validate end date is not before start date
      if (selectedDate < taskDate) {
        Alert.alert('Error', 'End date cannot be before the start date.');
        return;
      }
      setRecurrence({ ...recurrence, endDate: format(selectedDate, 'yyyy-MM-dd') });
    }
  };

  const handleTitleChange = (text: string) => {
    if (text.length > 200) {
      setTitleError('Length has exceeded the maximum (200 characters).');
    } else {
      setTitleError('');
    }
    setTitle(text);
  };

  const handleDescriptionChange = (text: string) => {
    if (text.length > 500) {
      setDescriptionError('Length has exceeded the maximum (500 characters).');
    } else {
      setDescriptionError('');
    }
    setDescription(text);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </Text>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={title}
              onChangeText={handleTitleChange}
              maxLength={200}
            />
            {titleError ? (
              <Text style={{ color: 'red', fontSize: 12 }}>{titleError}</Text>
            ) : null}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={description}
              onChangeText={handleDescriptionChange}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            {descriptionError ? (
              <Text style={{ color: 'red', fontSize: 12 }}>{descriptionError}</Text>
            ) : null}

            <Text style={styles.label}>Date</Text>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={taskDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            ) : (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>Date: {format(taskDate, 'MMM dd, yyyy')}</Text>
              </TouchableOpacity>
            )}
            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker
                value={taskDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <Text style={styles.label}>Start Time</Text>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onChange={handleStartTimeChange}
              />
            ) : (
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text>Start Time: {format(startTime, 'hh:mm a')}</Text>
              </TouchableOpacity>
            )}
            {Platform.OS === 'android' && showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onChange={handleStartTimeChange}
              />
            )}

            <Text style={styles.label}>End Time</Text>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="default"
                onChange={handleEndTimeChange}
              />
            ) : (
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text>End Time: {format(endTime, 'hh:mm a')}</Text>
              </TouchableOpacity>
            )}
            {Platform.OS === 'android' && showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="default"
                onChange={handleEndTimeChange}
              />
            )}

            {goals.length > 0 && (
              <View style={styles.goalSelector}>
                <Text style={styles.label}>Select Goal (Optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.goalOption,
                      (selectedGoal === '' || selectedGoal === 'no-goal') &&
                        styles.selectedGoal,
                    ]}
                    onPress={() => setSelectedGoal('no-goal')}
                  >
                    <Text
                      style={[
                        styles.goalOptionText,
                        (selectedGoal === '' || selectedGoal === 'no-goal') &&
                          styles.selectedGoalText,
                      ]}
                    >
                      No Goal
                    </Text>
                  </TouchableOpacity>
                  {goals.map(goal => (
                    <TouchableOpacity
                      key={goal.id}
                      style={[
                        styles.goalOption,
                        selectedGoal === goal.id && styles.selectedGoal,
                      ]}
                      onPress={() => setSelectedGoal(goal.id)}
                    >
                      <Text
                        style={[
                          styles.goalOptionText,
                          selectedGoal === goal.id && styles.selectedGoalText,
                        ]}
                      >
                        {goal.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.frequencyContainer}>
              <Text style={styles.label}>Frequency</Text>
              <TouchableOpacity
                style={styles.frequencyButton}
                onPress={() => setShowFrequencyModal(true)}
              >
                <Text style={styles.frequencyText}>
                  {recurrence ? (recurrence.frequency === 'none' ? 'Does not repeat' : recurrence.frequency) : 'Does not repeat'}
                </Text>
              </TouchableOpacity>
            </View>

            {recurrence && (
              <View>
                <Text style={styles.label}>Ends On</Text>
                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={new Date(recurrence.endDate)}
                    mode="date"
                    display="default"
                    onChange={handleEndDateChange}
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text>{format(new Date(recurrence.endDate), 'MMM dd, yyyy')}</Text>
                  </TouchableOpacity>
                )}
                {Platform.OS === 'android' && showEndDatePicker && (
                  <DateTimePicker
                    value={new Date(recurrence.endDate)}
                    mode="date"
                    display="default"
                    onChange={handleEndDateChange}
                  />
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onClose} variant="secondary" />
            <Button title="Save" onPress={handleSave} />
          </View>
        </View>
        <FrequencyModal
          visible={showFrequencyModal}
          onClose={() => setShowFrequencyModal(false)}
          onSelect={handleFrequencySelect}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    height: '90%',
  },
  modalTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  label: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  timeButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  goalSelector: {
    marginTop: theme.spacing.md,
  },
  goalList: {
    flexDirection: 'row',
  },
  goalOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  selectedGoal: {
    backgroundColor: theme.colors.primary,
  },
  goalOptionText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  selectedGoalText: {
    color: theme.colors.text.inverse,
  },
  frequencyContainer: {
    marginTop: theme.spacing.md,
  },
  frequencyButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.lg,
  },
}); 