import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../theme';
import { LifeAdminTask } from '../data/lifeAdminTasks';

const FREQUENCIES: LifeAdminTask['frequency'][] = ['daily', 'weekly', 'monthly', 'seasonal'];

interface FrequencyModalProps {
  visible: boolean;
  selectedFrequency: LifeAdminTask['frequency'] | null;
  onClose: () => void;
  onSelect: (frequency: LifeAdminTask['frequency']) => void;
}

export const FrequencyModal: React.FC<FrequencyModalProps> = ({
  visible,
  selectedFrequency,
  onClose,
  onSelect,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Frequency</Text>
          {FREQUENCIES.map((frequency) => (
            <TouchableOpacity
              key={frequency}
              style={[
                styles.frequencyOption,
                selectedFrequency === frequency && styles.frequencyOptionSelected,
              ]}
              onPress={() => onSelect(frequency)}
            >
              <Text style={[
                styles.frequencyText,
                selectedFrequency === frequency && styles.frequencyTextSelected,
              ]}>
                {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  frequencyOption: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  frequencyOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  frequencyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  frequencyTextSelected: {
    color: theme.colors.text.inverse,
  },
}); 