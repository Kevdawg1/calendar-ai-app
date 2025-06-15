import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Goal } from '../types';
import { sharedStyles } from '../theme/styles';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: {
    title: string;
    description: string;
    duration: string;
    startTime: string;
    endTime: string;
    goalId: string;
  }) => void;
  goals: Goal[];
  selectedDate: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  onSave,
  goals,
  selectedDate,
}) => {
  const [newTask, setNewTask] = React.useState({
    title: '',
    description: '',
    duration: '',
    startTime: '',
    endTime: '',
    goalId: ''
  });

  const handleSave = () => {
    onSave(newTask);
    setNewTask({
      title: '',
      description: '',
      duration: '',
      startTime: '',
      endTime: '',
      goalId: ''
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={sharedStyles.modalContainer}>
        <View style={sharedStyles.modalContent}>
          <Text style={sharedStyles.modalTitle}>Add New Task</Text>
          
          <TextInput
            style={sharedStyles.input}
            placeholder="Task Title"
            value={newTask.title}
            onChangeText={(text) => setNewTask({ ...newTask, title: text })}
          />

          <TextInput
            style={[sharedStyles.input, sharedStyles.textArea]}
            placeholder="Description"
            multiline
            value={newTask.description}
            onChangeText={(text) => setNewTask({ ...newTask, description: text })}
          />

          <TextInput
            style={sharedStyles.input}
            placeholder="Duration (minutes)"
            keyboardType="numeric"
            value={newTask.duration}
            onChangeText={(text) => setNewTask({ ...newTask, duration: text })}
          />

          <TextInput
            style={sharedStyles.input}
            placeholder="Start Time (HH:MM)"
            value={newTask.startTime}
            onChangeText={(text) => setNewTask({ ...newTask, startTime: text })}
          />

          <TextInput
            style={sharedStyles.input}
            placeholder="End Time (HH:MM)"
            value={newTask.endTime}
            onChangeText={(text) => setNewTask({ ...newTask, endTime: text })}
          />

          <View style={sharedStyles.goalSelector}>
            <Text style={sharedStyles.label}>Associated Goal (Optional)</Text>
            <ScrollView style={sharedStyles.goalList}>
              <TouchableOpacity
                style={[
                  sharedStyles.goalOption,
                  !newTask.goalId && sharedStyles.selectedGoal
                ]}
                onPress={() => setNewTask({ ...newTask, goalId: '' })}
              >
                <Text style={sharedStyles.goalOptionText}>No Goal</Text>
              </TouchableOpacity>
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    sharedStyles.goalOption,
                    newTask.goalId === goal.id && sharedStyles.selectedGoal
                  ]}
                  onPress={() => setNewTask({ ...newTask, goalId: goal.id })}
                >
                  <Text style={sharedStyles.goalOptionText}>{goal.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={sharedStyles.modalButtons}>
            <TouchableOpacity
              style={[sharedStyles.modalButton, sharedStyles.cancelButton]}
              onPress={onClose}
            >
              <Text style={sharedStyles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[sharedStyles.modalButton, sharedStyles.saveButton]}
              onPress={handleSave}
            >
              <Text style={sharedStyles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}; 