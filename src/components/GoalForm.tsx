import React from 'react';
import { View, TextInput, Text } from 'react-native';
import { Goal } from '../types';
import { sharedStyles } from '../theme/styles';
import { Button as CustomButton } from './Button';
import { ColorPicker } from './ColorPicker';
import { GoalTypeSelector } from './GoalTypeSelector';
import { PrioritySelector } from './PrioritySelector';

interface GoalFormProps {
  goalText: string;
  onGoalTextChange: (text: string) => void;
  selectedType: Goal['type'];
  onTypeSelect: (type: Goal['type']) => void;
  selectedPriority: Goal['priority'];
  onPrioritySelect: (priority: Goal['priority']) => void;
  selectedColor: string;
  onColorSelect: (color: string) => void;
  timeCommitment: string;
  onTimeCommitmentChange: (text: string) => void;
  onTypeInfoPress: () => void;
  onPriorityInfoPress: () => void;
  onSubmit: () => void;
  submitButtonTitle?: string;
  isEditMode?: boolean;
  isTitleEditable?: boolean;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  goalText,
  onGoalTextChange,
  selectedType,
  onTypeSelect,
  selectedPriority,
  onPrioritySelect,
  selectedColor,
  onColorSelect,
  timeCommitment,
  onTimeCommitmentChange,
  onTypeInfoPress,
  onPriorityInfoPress,
  onSubmit,
  submitButtonTitle = 'Add Goal',
  isEditMode = false,
  isTitleEditable = true,
}) => {
  return (
    <View style={sharedStyles.inputContainer}>
      <TextInput
        style={[sharedStyles.input, !isTitleEditable && { backgroundColor: '#f0f0f0' }]}
        value={goalText}
        onChangeText={onGoalTextChange}
        placeholder="Enter your goal"
        multiline
        maxLength={200}
        editable={isTitleEditable}
      />
      
      <GoalTypeSelector
        selectedType={selectedType}
        onTypeSelect={onTypeSelect}
        onInfoPress={onTypeInfoPress}
      />
      
      <PrioritySelector
        selectedPriority={selectedPriority}
        onPrioritySelect={onPrioritySelect}
        onInfoPress={onPriorityInfoPress}
      />
      
      <Text style={sharedStyles.sectionLabel}>Color</Text>
      <ColorPicker
        selectedColor={selectedColor}
        onColorSelect={onColorSelect}
      />
      
      <Text style={sharedStyles.sectionLabel}>Time Commitment (hours per week)</Text>
      <TextInput
        style={sharedStyles.input}
        value={timeCommitment}
        onChangeText={onTimeCommitmentChange}
        keyboardType="numeric"
        placeholder="Enter hours per week"
      />
      
      <CustomButton
        title={submitButtonTitle}
        onPress={onSubmit}
        style={sharedStyles.button}
      />
    </View>
  );
}; 