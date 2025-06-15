import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { Section } from '../components/Section';
import { Button } from '../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { userPreferencesService, UserPreferences } from '../services/userPreferencesService';
import { format } from 'date-fns';
import { sharedStyles } from '../theme/styles';

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
    <Section title="Welcome to Calendar AI" style={sharedStyles.sectionWithMargin}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={sharedStyles.stepContainer}>
          <Text style={sharedStyles.description}>
            Let's set up your daily schedule preferences to help us better manage your time.
          </Text>
          <View style={sharedStyles.questionContainer}>
            <Text style={sharedStyles.question}>What time do you wish to wake up by?</Text>
            <View style={sharedStyles.pickerRow}>
              <DateTimePicker
                value={surveyData.wakeUpTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleWakeUpTimeChange}
                style={sharedStyles.timePicker}
              />
            </View>
          </View>
          <View style={sharedStyles.questionContainer}>
            <Text style={sharedStyles.question}>What time do you wish to go to sleep?</Text>
            <View style={sharedStyles.pickerRow}>
              <DateTimePicker
                value={surveyData.sleepTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleSleepTimeChange}
                style={sharedStyles.timePicker}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </Section>
  );

  const renderStep2 = () => (
    <Section title="Work Schedule" style={sharedStyles.sectionWithMargin}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={sharedStyles.stepContainer}>
          <Text style={sharedStyles.description}>
            Do you have a regular work or study schedule?
          </Text>
          <View style={sharedStyles.answerButtonGroup}>
            <Button
              title="Yes, I work/study"
              onPress={() => setSurveyData(prev => ({ ...prev, hasWorkSchedule: true }))}
              variant={surveyData.hasWorkSchedule ? 'primary' : 'secondary'}
              style={sharedStyles.answerButton}
            />
            <Button
              title="No, I don't work/study"
              onPress={() => setSurveyData(prev => ({ ...prev, hasWorkSchedule: false }))}
              variant={!surveyData.hasWorkSchedule ? 'primary' : 'secondary'}
              style={sharedStyles.answerButton}
            />
          </View>
        </View>
      </ScrollView>
    </Section>
  );

  // NEW: Work schedule day/time selection
  const renderStep3 = () => (
    <Section title="Work Schedule Details" style={sharedStyles.sectionWithMargin}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={sharedStyles.stepContainer}>
          <Text style={sharedStyles.description}>
            Select your work/study days and set the time for all selected days:
          </Text>
          <View style={sharedStyles.daysRow}>
            {DAY_LABELS.map((label, idx) => (
              <Button
                key={label}
                title={label}
                onPress={() => toggleDay(idx)}
                variant={selectedDays.includes(idx) ? 'primary' : 'secondary'}
                style={sharedStyles.dayButton}
              />
            ))}
          </View>
          <View style={sharedStyles.questionContainer}>
            <Text style={sharedStyles.question}>Start Time</Text>
            <View style={sharedStyles.pickerRow}>
              <DateTimePicker
                value={workStartTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={(event, date) => date && setWorkStartTime(date)}
                style={sharedStyles.timePicker}
              />
            </View>
          </View>
          <View style={sharedStyles.questionContainer}>
            <Text style={sharedStyles.question}>End Time</Text>
            <View style={sharedStyles.pickerRow}>
              <DateTimePicker
                value={workEndTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={(event, date) => date && setWorkEndTime(date)}
                style={sharedStyles.timePicker}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </Section>
  );

  const renderStep4 = () => (
    <Section title="Review Your Preferences" style={sharedStyles.sectionWithMargin}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={sharedStyles.stepContainer}>
          <Text style={sharedStyles.description}>
            Please review your preferences before completing the setup:
          </Text>
          <View style={sharedStyles.summaryContainer}>
            <View style={sharedStyles.summaryItem}>
              <Text style={sharedStyles.summaryLabel}>Wake Up Time:</Text>
              <Text style={sharedStyles.summaryValue}>
                {format(surveyData.wakeUpTime, 'h:mm a')}
              </Text>
            </View>
            <View style={sharedStyles.summaryItem}>
              <Text style={sharedStyles.summaryLabel}>Sleep Time:</Text>
              <Text style={sharedStyles.summaryValue}>
                {format(surveyData.sleepTime, 'h:mm a')}
              </Text>
            </View>
            <View style={sharedStyles.summaryItem}>
              <Text style={sharedStyles.summaryLabel}>Work Schedule:</Text>
              <Text style={sharedStyles.summaryValue}>
                {surveyData.hasWorkSchedule ? 'Yes' : 'No'}
              </Text>
            </View>
            {surveyData.hasWorkSchedule && (
              <View style={sharedStyles.workScheduleSummary}>
                <Text style={sharedStyles.summaryLabel}>Work Hours:</Text>
                {DAYS_OF_WEEK.map(day => {
                  const schedule = surveyData.workSchedule[day];
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

  return (
    <View style={sharedStyles.surveyContainer}>
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && surveyData.hasWorkSchedule && renderStep3()}
      {currentStep === 4 && renderStep4()}
      <View style={sharedStyles.buttonContainerFixed}>
        {currentStep > 1 && (
          <Button
            title="Back"
            onPress={handleBack}
            variant="secondary"
            style={sharedStyles.button}
          />
        )}
        <Button
          title={currentStep === 4 ? "Complete Setup" : "Next"}
          onPress={handleNext}
          style={sharedStyles.button}
        />
      </View>
    </View>
  );
}; 