import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { sharedStyles } from '../theme/styles';
import { theme } from '../theme';

interface WeeklyTimeBreakdown {
  availableHours: number;
  weeklyAvailableHours: number;
  workHours: number;
  taskHours: number;
  remaining: number;
}

interface WeeklyTimeBalanceProps {
  remainingHours: number;
  breakdown: WeeklyTimeBreakdown;
}

export const WeeklyTimeBalance: React.FC<WeeklyTimeBalanceProps> = ({
  remainingHours,
  breakdown
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={[sharedStyles.card, { marginBottom: 16, backgroundColor: theme.colors.background }]}
      >
        <Text style={[sharedStyles.cardTitle, { color: theme.colors.primary, marginBottom: 8 }]}>Weekly Time Balance</Text>
        <Text style={sharedStyles.cardText}>
          Remaining hours this week: <Text style={{ fontWeight: 'bold', color: remainingHours > 0 ? theme.colors.success : theme.colors.danger }}>
            {remainingHours.toFixed(1)} hours
          </Text>
        </Text>
        <Text style={[sharedStyles.cardText, { fontSize: 12, color: theme.colors.text.secondary, marginTop: 4 }]}>Based on your sleep schedule, work hours, and existing tasks</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={sharedStyles.modalContainer}>
          <View style={[sharedStyles.modalContent, { maxWidth: 320 }]}> 
            <Text style={sharedStyles.modalTitle}>Weekly Time Balance Breakdown</Text>
            <Text style={[sharedStyles.cardText, { lineHeight: 28, marginBottom: 20, fontFamily: 'Menlo', textAlign: 'right' }]}> 
              {`${breakdown.weeklyAvailableHours.toFixed(1)} hours (waking hours per day)
- ${breakdown.workHours.toFixed(1)} hours (work/study)
- ${breakdown.taskHours.toFixed(1)} hours (scheduled tasks)
= ${breakdown.remaining.toFixed(1)} hours`}
            </Text>
            <TouchableOpacity
              style={[sharedStyles.modalButton, sharedStyles.saveButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[sharedStyles.modalButtonText, { color: '#FFFFFF', fontWeight: '600' }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}; 