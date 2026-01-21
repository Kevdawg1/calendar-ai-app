import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { Goal } from '../../types';
import { sharedStyles } from '../../theme/styles';
import { Button as CustomButton } from '../buttons/Button';
import { ColorPicker } from '../selectors/ColorPicker';
import { GoalTypeSelector } from '../selectors/GoalTypeSelector';
import { PrioritySelector } from '../selectors/PrioritySelector';

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
  const [goalTextError, setGoalTextError] = useState('');
  const [timeCommitmentError, setTimeCommitmentError] = useState('');

  const handleGoalTextChange = (text: string) => {
    if (text.length > 200) {
      setGoalTextError('Length has exceeded the maximum (200 characters).');
    } else {
      setGoalTextError('');
    }
    onGoalTextChange(text);
  };

  const handleTimeCommitmentChange = (text: string) => {
    // Accept only up to one decimal place
    if (!/^\d*(\.\d{0,1})?$/.test(text)) {
      setTimeCommitmentError('Only one decimal place is allowed.');
    } else {
      setTimeCommitmentError('');
    }
    onTimeCommitmentChange(text);
  };

  return (
    <View style={sharedStyles.inputContainer}>
      <TextInput
        style={[sharedStyles.input, !isTitleEditable && { backgroundColor: '#f0f0f0' }]}
        value={goalText}
        onChangeText={handleGoalTextChange}
        placeholder="Enter your goal"
        multiline
        maxLength={200}
        editable={isTitleEditable}
      />
      {goalTextError ? (
        <Text style={{ color: 'red', fontSize: 12 }}>{goalTextError}</Text>
      ) : null}
      
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
        onChangeText={handleTimeCommitmentChange}
        keyboardType="decimal-pad"
        placeholder="Enter hours per week (e.g., 2.5)"
      />
      {timeCommitmentError ? (
        <Text style={{ color: 'red', fontSize: 12 }}>{timeCommitmentError}</Text>
      ) : null}
      
      <CustomButton
        title={submitButtonTitle}
        onPress={onSubmit}
        style={sharedStyles.button}
      />
    </View>
  );
}; 