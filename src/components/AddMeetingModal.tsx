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
import { Meeting, Goal } from '../types';
import { format } from 'date-fns';
import { Button } from './Button';
import { Select } from './Select';
import { FrequencyModal } from './FrequencyModal';

type AddMeetingModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (meetingData: any) => void;
  meetingToEdit?: Meeting;
  isEditing?: boolean;
  selectedDate: string;
  goals: Goal[];
};

type MeetingType = 'work' | 'personal' | 'social' | 'health' | 'education' | 'other';
type MeetingPriority = 'low' | 'medium' | 'high';

export function AddMeetingModal({
  isVisible,
  onClose,
  onSubmit,
  meetingToEdit,
  isEditing = false,
  selectedDate,
  goals,
}: AddMeetingModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedType, setSelectedType] = useState<MeetingType>('work');
  const [selectedPriority, setSelectedPriority] = useState<MeetingPriority>('medium');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [startTime, setStartTime] = useState(getNextHourTime());
  const [endTime, setEndTime] = useState(getNextHourTime(1));
  const [meetingDate, setMeetingDate] = useState(new Date(selectedDate));
  const [recurrence, setRecurrence] = useState<Meeting['recurrence'] | undefined>(undefined);

  // Modal states for pickers
  const [showStartTimePicker, setShowStartTimePicker] = useState(Platform.OS === 'ios');
  const [showEndTimePicker, setShowEndTimePicker] = useState(Platform.OS === 'ios');
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(Platform.OS === 'ios');

  const [titleError, setTitleError] = useState('');

  // Helper function to get next hour time
  function getNextHourTime(hoursOffset: number = 0): Date {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1 + hoursOffset, 0, 0, 0);
    return nextHour;
  }

  // Initialize form with meeting data when editing
  useEffect(() => {
    if (isEditing && meetingToEdit) {
      setTitle(meetingToEdit.title);
      setDescription(meetingToEdit.description || '');
      setLocation(meetingToEdit.location || '');
      setSelectedType(meetingToEdit.type);
      setSelectedPriority(meetingToEdit.priority);
      setSelectedGoal(meetingToEdit.goalId || '');
      const meetingStartDate = meetingToEdit.startDate
        ? new Date(meetingToEdit.startDate)
        : new Date();
      setStartTime(
        meetingToEdit.startTime
          ? new Date(`${format(meetingStartDate, 'yyyy-MM-dd')}T${meetingToEdit.startTime}`)
          : new Date()
      );
      setEndTime(
        meetingToEdit.endTime
          ? new Date(`${format(meetingStartDate, 'yyyy-MM-dd')}T${meetingToEdit.endTime}`)
          : new Date()
      );
      setMeetingDate(meetingStartDate);
      if (meetingToEdit.recurrence) {
        setRecurrence(meetingToEdit.recurrence);
      }
    } else {
      resetForm();
    }
  }, [isEditing, meetingToEdit, selectedDate]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a meeting title');
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    const meetingData = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      type: selectedType,
      priority: selectedPriority,
      goalId: selectedGoal || undefined,
      startDate: format(meetingDate, 'yyyy-MM-dd'),
      startTime: format(startTime, 'HH:mm'),
      endTime: format(endTime, 'HH:mm'),
      status: 'scheduled' as const,
      recurrence: recurrence,
    };

    onSubmit(meetingData);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setSelectedType('work');
    setSelectedPriority('medium');
    setSelectedGoal('');
    setStartTime(getNextHourTime());
    setEndTime(getNextHourTime(1));
    setMeetingDate(new Date(selectedDate));
    setRecurrence(undefined);
    setTitleError('');
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartTime(selectedDate);
      // Auto-set end time to 1 hour later if it's before start time
      const newEndTime = new Date(selectedDate);
      newEndTime.setHours(newEndTime.getHours() + 1);
      if (endTime <= selectedDate) {
        setEndTime(newEndTime);
      }
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setMeetingDate(selectedDate);
    }
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (titleError) {
      setTitleError('');
    }
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
  };

  const meetingTypes: { label: string; value: MeetingType }[] = [
    { label: 'Work', value: 'work' },
    { label: 'Personal', value: 'personal' },
    { label: 'Social', value: 'social' },
    { label: 'Health', value: 'health' },
    { label: 'Education', value: 'education' },
    { label: 'Other', value: 'other' },
  ];

  const priorities: { label: string; value: MeetingPriority }[] = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ];

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Meeting' : 'Add Meeting'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={[styles.input, titleError ? styles.inputError : null]}
                value={title}
                onChangeText={handleTitleChange}
                               placeholder="Enter meeting title"
               placeholderTextColor={theme.colors.text.secondary}
              />
              {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={handleDescriptionChange}
                               placeholder="Enter meeting description"
               placeholderTextColor={theme.colors.text.secondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                               placeholder="Enter meeting location"
               placeholderTextColor={theme.colors.text.secondary}
             />
           </View>

           <View style={styles.field}>
             <Text style={styles.label}>Type</Text>
             <Select
               value={selectedType}
               onChange={(value) => setSelectedType(value as MeetingType)}
               options={meetingTypes}
               placeholder="Select meeting type"
             />
           </View>

                       <View style={styles.field}>
              <Text style={styles.label}>Priority</Text>
              <Select
                value={selectedPriority}
                onChange={(value) => setSelectedPriority(value as MeetingPriority)}
                options={priorities}
                placeholder="Select priority"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Goal (Optional)</Text>
              <Select
                value={selectedGoal}
                onChange={(value) => setSelectedGoal(value)}
                options={[
                  { label: 'No Goal', value: '' },
                  ...goals.map(goal => ({ label: goal.text, value: goal.id }))
                ]}
                placeholder="Select a goal"
              />
            </View>

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

            <View style={styles.field}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {format(meetingDate, 'MMM dd, yyyy')}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={meetingDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.timeRow}>
              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Start Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text style={styles.timeButtonText}>
                    {format(startTime, 'HH:mm')}
                  </Text>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    display="default"
                    onChange={handleStartTimeChange}
                  />
                )}
              </View>

              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>End Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Text style={styles.timeButtonText}>
                    {format(endTime, 'HH:mm')}
                  </Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    display="default"
                    onChange={handleEndTimeChange}
                  />
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="secondary"
              style={styles.cancelButton}
            />
            <Button
              title={isEditing ? 'Update' : 'Add Meeting'}
              onPress={handleSave}
              style={styles.saveButton}
            />
          </View>
        </View>
      </View>

      {showFrequencyModal && (
        <FrequencyModal
          visible={showFrequencyModal}
          onClose={() => setShowFrequencyModal(false)}
          onSelect={(frequency) => {
            setRecurrence({
              frequency,
              interval: 1,
              endDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 90 days from now
            });
            setShowFrequencyModal(false);
          }}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.text,
    lineHeight: 20,
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 16,
  },
  halfField: {
    flex: 1,
    marginRight: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: theme.colors.surface,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  timeButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: theme.colors.surface,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  frequencyContainer: {
    marginBottom: 16,
  },
  frequencyButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: theme.colors.surface,
  },
  frequencyText: {
    fontSize: 16,
    color: '#000000',
  },
}); 