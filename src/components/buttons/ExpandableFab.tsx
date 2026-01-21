import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface ExpandableFabProps {
  onAddTask: () => void;
  onAddMeeting: () => void;
}

export function ExpandableFab({ onAddTask, onAddMeeting }: ExpandableFabProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      tension: 120,
      friction: 10,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const handleAddTask = () => {
    // Add a small delay to allow the animation to complete
    setTimeout(() => {
      onAddTask();
    }, 150);
    toggleExpanded();
  };

  const handleAddMeeting = () => {
    // Add a small delay to allow the animation to complete
    setTimeout(() => {
      onAddMeeting();
    }, 150);
    toggleExpanded();
  };

  const mainButtonRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const meetingButtonTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  const taskButtonTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const meetingButtonOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const taskButtonOpacity = animation.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.7, 1],
  });

  return (
    <View style={styles.container}>
      {/* Backdrop Overlay */}
      {isExpanded && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={toggleExpanded}
        />
      )}

      {/* Meeting Button */}
      <Animated.View
        style={[
          styles.expandableButton,
          styles.meetingButton,
          {
            transform: [{ translateY: meetingButtonTranslateY }],
            opacity: meetingButtonOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.expandableButtonContent}
          onPress={handleAddMeeting}
          activeOpacity={0.8}
          accessibilityLabel="Add Meeting"
          accessibilityRole="button"
        >
          <Ionicons name="people" size={20} color="#fff" />
          <Text style={styles.buttonLabel}>Meeting</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Task Button */}
      <Animated.View
        style={[
          styles.expandableButton,
          styles.taskButton,
          {
            transform: [{ translateY: taskButtonTranslateY }],
            opacity: taskButtonOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.expandableButtonContent}
          onPress={handleAddTask}
          activeOpacity={0.8}
          accessibilityLabel="Add Task"
          accessibilityRole="button"
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.buttonLabel}>Task</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Button */}
      <Animated.View
        style={[
          styles.mainButton,
          {
            transform: [{ rotate: mainButtonRotation }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.mainButtonContent}
          onPress={toggleExpanded}
          activeOpacity={0.8}
          accessibilityLabel={isExpanded ? "Close menu" : "Open menu"}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  mainButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mainButtonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandableButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 120,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  meetingButton: {
    backgroundColor: theme.colors.info,
  },
  taskButton: {
    backgroundColor: theme.colors.secondary,
  },
  expandableButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 