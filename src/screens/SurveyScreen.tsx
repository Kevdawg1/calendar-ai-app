import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { Section } from '../components/Section';
import { Button } from '../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { userPreferencesService, UserPreferences } from '../services/userPreferencesService';
import { format } from 'date-fns';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SurveyScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [currentStep, setCurrentStep] = useState(1);
  const [surveyData, setSurveyData] = useState<UserPreferences>({
    wakeUpTime: new Date(2024, 0, 1, 7, 0), // Default 7:00 AM
    sleepTime: new Date(2024, 0, 1, 22, 0), // Default 10:00 PM
    hasWorkSchedule: false,
    workSchedule: {},
  });
  // For new work schedule UI
  const [selectedDays, setSelectedDays] = useState([0,1,2,3,4]); // Mon-Fri selected by default
  const [workStartTime, setWorkStartTime] = useState(new Date(2024, 0, 1, 9, 0));
  const [workEndTime, setWorkEndTime] = useState(new Date(2024, 0, 1, 17, 0));

  const handleWakeUpTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setSurveyData(prev => ({
        ...prev,
        wakeUpTime: selectedDate,
      }));
    }
  };

  const handleSleepTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setSurveyData(prev => ({
        ...prev,
        sleepTime: selectedDate,
      }));
    }
  };

  const handleWorkScheduleChange = (day: string, type: 'startTime' | 'endTime', date?: Date) => {
    if (date) {
      setSurveyData(prev => ({
        ...prev,
        workSchedule: {
          ...prev.workSchedule,
          [day]: {
            ...prev.workSchedule[day],
            [type]: date,
          },
        },
      }));
    }
  };

  // Helper for day selection
  const toggleDay = (idx: number) => {
    setSelectedDays(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx].sort((a, b) => a - b)
    );
  };

  const handleNext = () => {
    if (currentStep === 3 && surveyData.hasWorkSchedule) {
      // Apply the same start/end time to all selected days
      const newSchedule: any = {};
      selectedDays.forEach(idx => {
        newSchedule[DAYS_OF_WEEK[idx]] = {
          startTime: workStartTime,
          endTime: workEndTime,
        };
      });
      setSurveyData(prev => ({ ...prev, workSchedule: newSchedule }));
      setCurrentStep(4);
      return;
    }
    if (currentStep === 1) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(3);
    else if (currentStep === 4) handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await userPreferencesService.savePreferences(surveyData);
      navigation.replace('Home');
    } catch (error) {
      console.error('Error saving survey data:', error);
      Alert.alert('Error', 'Failed to save survey data. Please try again.');
    }
  };

  const renderStep1 = () => (
    <Section title="Welcome to Calendar AI" style={styles.sectionWithMargin}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.stepContainerNoFlex}>
          <Text style={styles.description}>
            Let's set up your daily schedule preferences to help us better manage your time.
          </Text>
          <View style={styles.questionContainer}>
            <Text style={styles.question}>What time do you wish to wake up by?</Text>
            <View style={styles.pickerRow}><DateTimePicker
              value={surveyData.wakeUpTime}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={handleWakeUpTimeChange}
              style={styles.timePicker}
            /></View>
          </View>
          <View style={styles.questionContainer}>
            <Text style={styles.question}>What time do you wish to go to sleep?</Text>
            <View style={styles.pickerRow}><DateTimePicker
              value={surveyData.sleepTime}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={handleSleepTimeChange}
              style={styles.timePicker}
            /></View>
          </View>
        </View>
      </ScrollView>
    </Section>
  );

  const renderStep2 = () => (
    <Section title="Work Schedule" style={styles.sectionWithMargin}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.stepContainerNoFlex}>
          <Text style={styles.description}>
            Do you have a regular work or study schedule?
          </Text>
          <View style={styles.answerButtonGroup}>
            <Button
              title="Yes, I work/study"
              onPress={() => setSurveyData(prev => ({ ...prev, hasWorkSchedule: true }))}
              variant={surveyData.hasWorkSchedule ? 'primary' : 'secondary'}
              style={styles.answerButton}
            />
            <Button
              title="No, I don't work/study"
              onPress={() => setSurveyData(prev => ({ ...prev, hasWorkSchedule: false }))}
              variant={!surveyData.hasWorkSchedule ? 'primary' : 'secondary'}
              style={styles.answerButton}
            />
          </View>
        </View>
      </ScrollView>
    </Section>
  );

  // NEW: Work schedule day/time selection
  const renderStep3 = () => (
    <Section title="Work Schedule Details" style={styles.sectionWithMargin}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.stepContainerNoFlex}>
          <Text style={styles.description}>
            Select your work/study days and set the time for all selected days:
          </Text>
          <View style={styles.daysRow}>
            {DAY_LABELS.map((label, idx) => (
              <Button
                key={label}
                title={label}
                onPress={() => toggleDay(idx)}
                variant={selectedDays.includes(idx) ? 'primary' : 'secondary'}
                style={styles.dayButton}
              />
            ))}
          </View>
          <View style={styles.questionContainer}>
            <Text style={styles.question}>Start Time</Text>
            <View style={styles.pickerRow}><DateTimePicker
              value={workStartTime}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={(event, date) => date && setWorkStartTime(date)}
              style={styles.timePicker}
            /></View>
          </View>
          <View style={styles.questionContainer}>
            <Text style={styles.question}>End Time</Text>
            <View style={styles.pickerRow}><DateTimePicker
              value={workEndTime}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={(event, date) => date && setWorkEndTime(date)}
              style={styles.timePicker}
            /></View>
          </View>
        </View>
      </ScrollView>
    </Section>
  );

  const renderStep4 = () => (
    <Section title="Confirm Your Preferences" style={styles.sectionWithMargin}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.stepContainerNoFlex}>
          <Text style={styles.description}>
            Please review your preferences before continuing:
          </Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Wake-up Time:</Text>
              <Text style={styles.summaryValue}>{format(surveyData.wakeUpTime, 'h:mm a')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Sleep Time:</Text>
              <Text style={styles.summaryValue}>{format(surveyData.sleepTime, 'h:mm a')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Work/Study Schedule:</Text>
              <Text style={styles.summaryValue}>
                {surveyData.hasWorkSchedule ? 'Yes' : 'No'}
              </Text>
            </View>
            {surveyData.hasWorkSchedule && (
              <View style={styles.workScheduleSummary}>
                <Text style={styles.summaryLabel}>Work Hours:</Text>
                {DAYS_OF_WEEK.map(day => {
                  const schedule = surveyData.workSchedule[day];
                  if (!schedule) return null;
                  return (
                    <View key={day} style={styles.workDaySummary}>
                      <Text style={styles.workDayLabel}>{day}:</Text>
                      <Text style={styles.workDayTime}>
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

  return (
    <View style={styles.container}>
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && surveyData.hasWorkSchedule && renderStep3()}
      {currentStep === 4 && renderStep4()}
      <View style={styles.buttonContainerFixed}>
        {currentStep > 1 && (
          <Button
            title="Back"
            onPress={handleBack}
            variant="secondary"
            style={styles.button}
          />
        )}
        <Button
          title={currentStep === 4 ? "Complete Setup" : "Next"}
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  sectionWithMargin: {
    marginTop: theme.spacing.xl,
  },
  stepContainerNoFlex: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    width: '100%',
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  question: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  pickerRow: {
    alignItems: 'center',
    width: '100%',
    minWidth: 220,
    marginVertical: theme.spacing.sm,
  },
  timePicker: {
    minWidth: 220,
    alignSelf: 'center',
  },
  buttonContainerFixed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  } as ViewStyle,
  answerButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  answerButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  } as ViewStyle,
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    width: '100%',
    flexWrap: 'wrap',
  },
  dayButton: {
    minWidth: 40,
    marginHorizontal: 2,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  } as ViewStyle,
  scheduleContainer: {
    maxHeight: 400,
  },
  dayContainer: {
    marginBottom: theme.spacing.lg,
  },
  dayTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  summaryContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  workScheduleSummary: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  workDaySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  workDayLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  workDayTime: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
}); 