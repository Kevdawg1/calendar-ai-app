import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Goal } from '../../types';
import { sharedStyles } from '../../theme/styles';
import { InfoButton } from '../buttons/InfoButton';

interface PrioritySelectorProps {
  selectedPriority: Goal['priority'];
  onPrioritySelect: (priority: Goal['priority']) => void;
  onInfoPress: () => void;
  label?: string;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  selectedPriority,
  onPrioritySelect,
  onInfoPress,
  label = 'Priority Level'
}) => {
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={sharedStyles.sectionLabel}>{label}</Text>
        <InfoButton onPress={onInfoPress} />
      </View>
      <View style={sharedStyles.formSectionWide}>
        <View style={sharedStyles.typeContainerRow}>
          <TouchableOpacity
            style={[
              sharedStyles.priorityButton,
              selectedPriority === 'low' && sharedStyles.selectedPriority,
            ]}
            onPress={() => onPrioritySelect('low')}
          >
            <Text style={selectedPriority === 'low' ? sharedStyles.selectedPriorityText : sharedStyles.priorityText}>
              Low
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              sharedStyles.priorityButton,
              selectedPriority === 'medium' && sharedStyles.selectedPriority,
            ]}
            onPress={() => onPrioritySelect('medium')}
          >
            <Text style={selectedPriority === 'medium' ? sharedStyles.selectedPriorityText : sharedStyles.priorityText}>
              Medium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              sharedStyles.priorityButton,
              selectedPriority === 'high' && sharedStyles.selectedPriority,
            ]}
            onPress={() => onPrioritySelect('high')}
          >
            <Text style={selectedPriority === 'high' ? sharedStyles.selectedPriorityText : sharedStyles.priorityText}>
              High
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}; 