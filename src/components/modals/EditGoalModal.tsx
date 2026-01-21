import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Goal } from '../../types';
import { sharedStyles } from '../../theme/styles';
import { GoalForm } from '../forms/GoalForm';

interface EditGoalModalProps {
  visible: boolean;
  goal: Goal | null;
  editType: Goal['type'];
  onTypeSelect: (type: Goal['type']) => void;
  editPriority: Goal['priority'];
  onPrioritySelect: (priority: Goal['priority']) => void;
  editColor: string;
  onColorSelect: (color: string) => void;
  editTimeCommitment: string;
  onTimeCommitmentChange: (text: string) => void;
  onTypeInfoPress: () => void;
  onPriorityInfoPress: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const EditGoalModal: React.FC<EditGoalModalProps> = ({
  visible,
  goal,
  editType,
  onTypeSelect,
  editPriority,
  onPrioritySelect,
  editColor,
  onColorSelect,
  editTimeCommitment,
  onTimeCommitmentChange,
  onTypeInfoPress,
  onPriorityInfoPress,
  onSave,
  onCancel,
}) => {
  if (!goal) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={sharedStyles.modalContainer}>
        <View style={sharedStyles.modalContent}>
          <Text style={sharedStyles.modalTitle}>Edit Goal</Text>
          
          <GoalForm
            goalText={goal.text}
            onGoalTextChange={() => {}} // Read-only in edit mode
            selectedType={editType}
            onTypeSelect={onTypeSelect}
            selectedPriority={editPriority}
            onPrioritySelect={onPrioritySelect}
            selectedColor={editColor}
            onColorSelect={onColorSelect}
            timeCommitment={editTimeCommitment}
            onTimeCommitmentChange={onTimeCommitmentChange}
            onTypeInfoPress={onTypeInfoPress}
            onPriorityInfoPress={onPriorityInfoPress}
            onSubmit={onSave}
            submitButtonTitle="Save"
            isEditMode={true}
            isTitleEditable={false}
          />
          
          <View style={sharedStyles.modalButtons}>
            <TouchableOpacity
              style={[sharedStyles.modalButton, sharedStyles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={sharedStyles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}; 