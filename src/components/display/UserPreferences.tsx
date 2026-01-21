import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { format } from 'date-fns';
import { UserPreferences as UserPreferencesType } from '../../services/userPreferencesService';
import { sharedStyles } from '../../theme/styles';
import { Section } from '../layout/Section';
import { theme } from '../../theme';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface UserPreferencesProps {
  preferences: UserPreferencesType;
  showEditButton?: boolean;
  onEditPress?: () => void;
}

export const UserPreferences: React.FC<UserPreferencesProps> = ({
  preferences,
  showEditButton = false,
  onEditPress,
}) => {
  return (
    <Section
      title="User Preferences"
      style={{ marginTop: 0, marginBottom: theme.spacing.lg }}
      flexContent
    >
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[sharedStyles.stepContainer, { marginTop: 0 }]}>
          <Text style={sharedStyles.description}>
            Your current preferences:
          </Text>
          <View style={sharedStyles.summaryContainer}>
            <View style={sharedStyles.summaryItem}>
              <Text style={sharedStyles.summaryLabel}>Wake Up Time:</Text>
              <Text style={sharedStyles.summaryValue}>
                {format(preferences.wakeUpTime, 'h:mm a')}
              </Text>
            </View>
            <View style={sharedStyles.summaryItem}>
              <Text style={sharedStyles.summaryLabel}>Sleep Time:</Text>
              <Text style={sharedStyles.summaryValue}>
                {format(preferences.sleepTime, 'h:mm a')}
              </Text>
            </View>
            <View style={sharedStyles.summaryItem}>
              <Text style={sharedStyles.summaryLabel}>Work Schedule:</Text>
              <Text style={sharedStyles.summaryValue}>
                {preferences.hasWorkSchedule ? 'Yes' : 'No'}
              </Text>
            </View>
            {preferences.hasWorkSchedule && Object.keys(preferences.workSchedule).length > 0 && (
              <View style={sharedStyles.workScheduleSummary}>
                <Text style={sharedStyles.summaryLabel}>Work Hours:</Text>
                {DAYS_OF_WEEK.map(day => {
                  const schedule = preferences.workSchedule[day];
                  if (!schedule) return null;
                  return (
                    <View key={day} style={sharedStyles.workDaySummary}>
                      <Text style={sharedStyles.workDayLabel}>{day}:</Text>
                      <Text style={sharedStyles.workDayTime}>
                        {format(schedule.startTime, 'h:mm a')} - {format(schedule.endTime, 'h:mm a')}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </Section>
  );
}; 