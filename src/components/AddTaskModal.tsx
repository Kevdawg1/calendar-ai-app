import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Goal } from '../types';

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
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  onSave,
  goals,
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
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
}); 