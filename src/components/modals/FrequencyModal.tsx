import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../../theme';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'none';

const FREQUENCIES: Frequency[] = [
  'daily',
  'weekly',
  'monthly',
  'seasonal',
  'none',
];

interface FrequencyModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (frequency: Frequency) => void;
}

export const FrequencyModal: React.FC<FrequencyModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const getFrequencyLabel = (frequency: Frequency): string => {
    if (frequency === 'none') {
      return 'Does not repeat';
    }
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

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
              style={styles.frequencyOption}
              onPress={() => onSelect(frequency)}
            >
              <Text style={styles.frequencyText}>
                {getFrequencyLabel(frequency)}
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
  frequencyText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
}); 