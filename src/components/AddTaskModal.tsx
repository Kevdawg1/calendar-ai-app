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
import { theme } from '../theme';
import { Goal, Task } from '../types';
import { format } from 'date-fns';

type AddTaskModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (taskData: {
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
  }) => void;
  goals: Goal[];
  selectedDate: string;
  taskToEdit?: Task;
  isEditing?: boolean;
  onUpdateAll?: boolean;
};

export function AddTaskModal({ 
  visible, 
  onClose, 
  onSave, 
  goals, 
  selectedDate,
  taskToEdit,
  isEditing = false,
  onUpdateAll = false,
}: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [taskDate, setTaskDate] = useState(new Date(selectedDate));
  const [recurrence, setRecurrence] = useState<{
    frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal';
    interval: number;
    endDate: string;
  } | null>(null);

  // Modal states for pickers
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Initialize form with task data when editing
  useEffect(() => {
    if (isEditing && taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setSelectedGoal(taskToEdit.goalId);
      setStartTime(new Date(`${taskToEdit.startDate}T${taskToEdit.startTime}`));
      setEndTime(new Date(`${taskToEdit.startDate}T${taskToEdit.endTime}`));
      setTaskDate(new Date(taskToEdit.startDate));
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

    // Validate start and end times
    if (startTime >= endTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      startTime: format(startTime, 'HH:mm'),
      endTime: format(endTime, 'HH:mm'),
      goalId: selectedGoal || '', // Make goal optional
      startDate: format(taskDate, 'yyyy-MM-dd'),
      recurrence: recurrence || undefined,
    };

    onSave(taskData);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedGoal('');
    setStartTime(new Date());
    setEndTime(new Date());
    setTaskDate(new Date(selectedDate));
    setRecurrence(null);
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(false);
    if (selectedDate) {
      // If the selected start time is after the current end time, adjust end time
      if (selectedDate > endTime) {
        const newEndTime = new Date(selectedDate);
        newEndTime.setHours(newEndTime.getHours() + 1); // Default to 1 hour duration
        setEndTime(newEndTime);
      }
      setStartTime(selectedDate);
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(false);
    if (selectedDate) {
      // Validate that end time is after start time
      if (selectedDate <= startTime) {
        Alert.alert(
          'Invalid Time',
          'End time must be after start time',
          [{ text: 'OK' }]
        );
        return;
      }
      setEndTime(selectedDate);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTaskDate(selectedDate);
    }
  };

  return (
    <Modal
      visible={visible}
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
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={title}
              onChangeText={setTitle}
              maxLength={200}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>Date: {format(taskDate, 'MMM dd, yyyy')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text>Start Time: {format(startTime, 'hh:mm a')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text>End Time: {format(endTime, 'hh:mm a')}</Text>
            </TouchableOpacity>

            {goals.length > 0 && (
              <View style={styles.goalSelector}>
                <Text style={styles.label}>Select Goal (Optional)</Text>
                <ScrollView style={styles.goalList}>
                  <TouchableOpacity
                    style={[
                      styles.goalOption,
                      !selectedGoal && styles.selectedGoal,
                    ]}
                    onPress={() => setSelectedGoal('')}
                  >
                    <Text
                      style={[
                        styles.goalOptionText,
                        !selectedGoal && styles.selectedGoalText,
                      ]}
                    >
                      No Goal
                    </Text>
                  </TouchableOpacity>
                  {goals.map((goal) => (
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

            <View style={styles.recurrenceContainer}>
              <Text style={styles.label}>Recurrence (Optional)</Text>
              <View style={styles.recurrenceOptions}>
                {['daily', 'weekly', 'monthly', 'seasonal'].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.recurrenceButton,
                      recurrence?.frequency === freq && styles.selectedRecurrence,
                    ]}
                    onPress={() => {
                      // Toggle recurrence - if already selected, deselect it
                      if (recurrence?.frequency === freq) {
                        setRecurrence(null);
                      } else {
                        setRecurrence({
                          frequency: freq as 'daily' | 'weekly' | 'monthly' | 'seasonal',
                          interval: 1,
                          endDate: format(new Date(), 'yyyy-MM-dd'),
                        });
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.recurrenceButtonText,
                        recurrence?.frequency === freq && styles.selectedRecurrenceText,
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.modalButtonText}>
                {isEditing ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date/Time Picker Modals */}
        {Platform.OS === 'android' ? (
          <>
            {showDatePicker && (
              <DateTimePicker
                value={taskDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onChange={handleStartTimeChange}
              />
            )}
            {showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="default"
                onChange={handleEndTimeChange}
              />
            )}
          </>
        ) : (
          <>
            {showDatePicker && (
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.pickerModalContainer}>
                  <View style={styles.pickerModalContent}>
                    <DateTimePicker
                      value={taskDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                    />
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.pickerButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}

            {showStartTimePicker && (
              <Modal
                visible={showStartTimePicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.pickerModalContainer}>
                  <View style={styles.pickerModalContent}>
                    <DateTimePicker
                      value={startTime}
                      mode="time"
                      display="spinner"
                      onChange={handleStartTimeChange}
                    />
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => setShowStartTimePicker(false)}
                    >
                      <Text style={styles.pickerButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}

            {showEndTimePicker && (
              <Modal
                visible={showEndTimePicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.pickerModalContainer}>
                  <View style={styles.pickerModalContent}>
                    <DateTimePicker
                      value={endTime}
                      mode="time"
                      display="spinner"
                      onChange={handleEndTimeChange}
                    />
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => setShowEndTimePicker(false)}
                    >
                      <Text style={styles.pickerButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  timeButton: {
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  goalSelector: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  goalList: {
    maxHeight: 150,
  },
  goalOption: {
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  selectedGoal: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  goalOptionText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  selectedGoalText: {
    color: theme.colors.text.inverse,
  },
  recurrenceContainer: {
    marginBottom: theme.spacing.lg,
  },
  recurrenceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  recurrenceButton: {
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedRecurrence: {
    backgroundColor: theme.colors.primary,
  },
  recurrenceButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.sm,
  },
  selectedRecurrenceText: {
    color: theme.colors.text.inverse,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.sm,
  },
  cancelButton: {
    backgroundColor: theme.colors.danger,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
  },
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '90%',
    alignItems: 'center',
  },
  pickerButton: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    width: '100%',
  },
  pickerButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
  },
}); 