import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { sharedStyles } from '../theme/styles';

interface InfoModalProps {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
  buttonText?: string;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  title,
  content,
  onClose,
  buttonText = 'Got it'
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={sharedStyles.modalContainer}>
        <View style={[sharedStyles.modalContent, { maxWidth: 300 }]}>
          <Text style={sharedStyles.modalTitle}>{title}</Text>
          <Text style={[sharedStyles.cardText, { lineHeight: 24, marginBottom: 20 }]}>
            {content}
          </Text>
          <TouchableOpacity
            style={[sharedStyles.modalButton, sharedStyles.saveButton]}
            onPress={onClose}
          >
            <Text style={[sharedStyles.modalButtonText, { color: '#fff' }]}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}; 