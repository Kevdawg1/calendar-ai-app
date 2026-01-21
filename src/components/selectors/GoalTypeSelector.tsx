import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Goal } from '../../types';
import { sharedStyles } from '../../theme/styles';
import { InfoButton } from '../buttons/InfoButton';

interface GoalTypeSelectorProps {
  selectedType: Goal['type'];
  onTypeSelect: (type: Goal['type']) => void;
  onInfoPress: () => void;
  label?: string;
}

export const GoalTypeSelector: React.FC<GoalTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  onInfoPress,
  label = 'Goal Type'
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
              sharedStyles.typeButton,
              selectedType === 'short' && sharedStyles.selectedType,
            ]}
            onPress={() => onTypeSelect('short')}
          >
            <Text style={selectedType === 'short' ? sharedStyles.selectedTypeText : sharedStyles.typeText}>
              Short Term
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              sharedStyles.typeButton,
              selectedType === 'medium' && sharedStyles.selectedType,
            ]}
            onPress={() => onTypeSelect('medium')}
          >
            <Text style={selectedType === 'medium' ? sharedStyles.selectedTypeText : sharedStyles.typeText}>
              Medium Term
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              sharedStyles.typeButton,
              selectedType === 'long' && sharedStyles.selectedType,
            ]}
            onPress={() => onTypeSelect('long')}
          >
            <Text style={selectedType === 'long' ? sharedStyles.selectedTypeText : sharedStyles.typeText}>
              Long Term
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}; 