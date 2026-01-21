import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../buttons/Button';
import { sharedStyles } from 'theme/styles';

const onboardingSteps = [
  {
    image: require('../../../assets/screenshots/home.png'),
    title: 'Welcome to AI-Cal!',
    description: 'This app helps you organize your tasks and manage your time effectively. Let\'s walk through the key features.',
  },
  {
    image: require('../../../assets/screenshots/calendar.png'),
    title: 'Calendar View',
    description: 'The Calendar screen provides a visual overview of your schedule. You can see your tasks, work hours, and sleep schedule at a glance.',
  },
  {
    image: require('../../../assets/screenshots/task-review.png'),
    title: 'Task Review',
    description: 'The Task Review screen allows you to process tasks suggested by the AI. You can approve, edit, or delete tasks to fit your schedule.',
  },
  {
    image: require('../../../assets/screenshots/goals.png'),
    title: 'Goals',
    description: 'Set your long-term goals and track your progress. The AI will help you break down your goals into manageable tasks.',
  },
  {
    image: require('../../../assets/screenshots/life-admin.png'),
    title: 'Life Admin',
    description: 'Manage your recurring life admin tasks, such as paying bills or scheduling appointments. The app will remind you when it\'s time to get them done.',
  },
];

interface OnboardingModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isVisible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { image, title, description } = onboardingSteps[currentStep];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Image source={image} style={styles.image} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </ScrollView>
          <View style={styles.pagination}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentStep === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
          <View style={[styles.buttonContainer, currentStep === 0 && { justifyContent: 'flex-end' }]}>
            {currentStep > 0 && (
              <Button onPress={handlePrev} title="Previous" style={sharedStyles.button} />
            )}
            <Button
              onPress={handleNext}
              title={currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
              style={sharedStyles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  scrollContainer: {
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
  },
  inactiveDot: {
    backgroundColor: theme.colors.border,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}); 