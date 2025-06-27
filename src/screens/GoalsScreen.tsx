import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, FlatList, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { goalService } from '../services/goalService';
import { openaiService } from '../services/openaiService';
import { Goal, Task } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { theme } from '../theme';
import { sharedStyles } from '../theme/styles';
import { Section } from '../components/Section';
import { EmptyState } from '../components/EmptyState';
import { Button as CustomButton } from '../components/Button';
import { userPreferencesService, UserPreferences } from '../services/userPreferencesService';
import { taskService } from '../services/taskService';
import { GoalForm } from '../components/GoalForm';
import { EditGoalModal } from '../components/EditGoalModal';
import { InfoModal } from '../components/InfoModal';
import { WeeklyTimeBalance } from '../components/WeeklyTimeBalance';
import { GoalCard } from '../components/GoalCard';

const GOAL_COLORS = ['#007AFF', '#FF9500', '#34C759', '#AF52DE', '#FF2D55', '#5AC8FA', '#FFD60A'];

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const GoalsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [selectedType, setSelectedType] = useState<'short' | 'medium' | 'long'>('short');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [timeCommitment, setTimeCommitment] = useState('20');
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState<'short' | 'medium' | 'long'>('short');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editTimeCommitment, setEditTimeCommitment] = useState('20');
  const [editColor, setEditColor] = useState(GOAL_COLORS[0]);
  const [remainingHours, setRemainingHours] = useState<number>(0);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoContent, setInfoContent] = useState<{ title: string; content: string }>({ title: '', content: '' });
  const [breakdown, setBreakdown] = useState({
    availableHours: 0,
    weeklyAvailableHours: 0,
    workHours: 0,
    taskHours: 0,
    remaining: 0,
  });

  useEffect(() => {
    loadGoals();
    loadUserPreferences();
  }, []);

  useEffect(() => {
    if (userPreferences) {
      calculateRemainingHours();
    }
  }, [userPreferences, goals]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={sharedStyles.headerButton}
          onPress={() => navigation.navigate('Calendar', {})}
        >
          <Ionicons name="calendar" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const loadGoals = async () => {
    const allGoals = await goalService.getAllGoals();
    setGoals(allGoals);
  };

  const loadUserPreferences = async () => {
    try {
      const preferences = await userPreferencesService.getPreferences();
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const calculateRemainingHours = async () => {
    if (!userPreferences) return;

    try {
      // Calculate total available hours per week
      const wakeUpTime = new Date(userPreferences.wakeUpTime);
      const sleepTime = new Date(userPreferences.sleepTime);
      
      // Calculate hours between wake up and sleep
      let availableHours = (sleepTime.getTime() - wakeUpTime.getTime()) / (1000 * 60 * 60);
      if (availableHours < 0) {
        availableHours += 24; // Handle overnight sleep
      }
      const weeklyAvailableHours = availableHours * 7;

      // Subtract work/study hours
      let workHours = 0;
      if (userPreferences.hasWorkSchedule) {
        Object.values(userPreferences.workSchedule).forEach(day => {
          const startTime = new Date(day.startTime);
          const endTime = new Date(day.endTime);
          const dayWorkHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          workHours += dayWorkHours;
        });
      }

      // Get all tasks and calculate their total duration
      const allTasks = await taskService.getAllTasks();
      const taskHours = allTasks.reduce((total, task) => {
        if (task.startTime && task.endTime) {
          const startTime = new Date(`2000-01-01T${task.startTime}`);
          const endTime = new Date(`2000-01-01T${task.endTime}`);
          const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          return total + duration;
        }
        return total;
      }, 0);

      const remaining = weeklyAvailableHours - workHours - taskHours;
      setRemainingHours(Math.max(0, remaining));
      setBreakdown({
        availableHours,
        weeklyAvailableHours,
        workHours,
        taskHours,
        remaining: Math.max(0, remaining),
      });
    } catch (error) {
      console.error('Error calculating remaining hours:', error);
    }
  };

  const showInfoModal = (title: string, content: string) => {
    setInfoContent({ title, content });
    setInfoModalVisible(true);
  };

  const handleAddGoal = async () => {
    if (!newGoalText.trim()) {
      Alert.alert('Error', 'Please enter a goal');
      return;
    }
    const hours = parseInt(timeCommitment);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert('Error', 'Please enter a valid time commitment');
      return;
    }
    const newGoal = await goalService.addGoal({
      text: newGoalText.trim(),
      type: selectedType,
      priority: selectedPriority,
      timeCommitment: hours,
      color: selectedColor,
    });
    setGoals([...goals, newGoal]);
    setNewGoalText('');
    setTimeCommitment('20');
    setSelectedColor(GOAL_COLORS[0]);
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This will also delete all associated tasks.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await goalService.deleteGoal(goalId);
            setGoals(goals.filter(goal => goal.id !== goalId));
          },
        },
      ]
    );
  };

  const handleEditGoal = (goal: Goal) => {
    setEditGoal(goal);
    setEditType(goal.type);
    setEditPriority(goal.priority);
    setEditTimeCommitment(goal.timeCommitment.toString());
    setEditColor(goal.color || GOAL_COLORS[0]);
    setEditModalVisible(true);
  };

  const handleSaveEditGoal = async () => {
    if (!editGoal) return;
    const hours = parseInt(editTimeCommitment);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert('Error', 'Please enter a valid time commitment');
      return;
    }
    const updatedGoal = await goalService.updateGoal(editGoal.id, {
      type: editType,
      priority: editPriority,
      timeCommitment: hours,
      color: editColor,
    });
    
    // Update task colors if the goal color changed
    if (editGoal.color !== editColor) {
      await taskService.updateTaskColors(editGoal.id, editColor);
    }
    
    setGoals(goals.map(g => (g.id === editGoal.id ? updatedGoal! : g)));
    setEditModalVisible(false);
    setEditGoal(null);
  };

  const handleGenerateTasks = async (goal: Goal) => {
    try {
      setIsLoading(true);
      setLoadingStage('Brainstorming Key Components...');
      const tasks = await openaiService.generateTasks([goal], undefined, userPreferences || undefined);
      if (tasks && tasks.length > 0) {
        setLoadingStage('Adding to Calendar...');
        const calendarTasks = tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          startDate: task.startDate,
          startTime: task.startTime,
          endTime: task.endTime,
          goalId: goal.id,
          status: 'pending' as const,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          color: goal.color,
        }));
        navigation.navigate('TaskReview', { tasks: calendarTasks });
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
      Alert.alert('Error', 'Failed to generate tasks. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <GoalCard
      goal={item}
      onEdit={handleEditGoal}
      onDelete={handleDeleteGoal}
      onGenerateTasks={handleGenerateTasks}
    />
  );

  return (
    <SafeAreaView style={sharedStyles.container}>
      <View style={sharedStyles.safeAreaContainer}>
        {isLoading && (
          <View style={sharedStyles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={sharedStyles.loadingText}>{loadingStage}</Text>
          </View>
        )}
        <ScrollView style={sharedStyles.content}>
          <Section title="Add New Goal">
            <GoalForm
              goalText={newGoalText}
              onGoalTextChange={setNewGoalText}
              selectedType={selectedType}
              onTypeSelect={setSelectedType}
              selectedPriority={selectedPriority}
              onPrioritySelect={setSelectedPriority}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
              timeCommitment={timeCommitment}
              onTimeCommitmentChange={setTimeCommitment}
              onTypeInfoPress={() => showInfoModal(
                'Goal Type',
                '• Short Term: 1-3 months\n• Medium Term: 3-12 months\n• Long Term: 1-5 years'
              )}
              onPriorityInfoPress={() => showInfoModal(
                'Priority Level',
                '• Low: Nice to have, can be delayed\n• Medium: Important but flexible\n• High: Critical, must be completed'
              )}
              onSubmit={handleAddGoal}
            />
          </Section>
          <Section title="Your Goals">
            {userPreferences && (
              <WeeklyTimeBalance remainingHours={remainingHours} breakdown={breakdown} />
            )}
            {goals.length === 0 ? (
              <EmptyState
                icon="flag-outline"
                title="No Goals Yet"
                message="No goals yet. Add your first goal above!"
              />
            ) : (
              <FlatList
                data={goals}
                renderItem={renderGoalItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            )}
          </Section>
        </ScrollView>
        
        <EditGoalModal
          visible={editModalVisible}
          goal={editGoal}
          editType={editType}
          onTypeSelect={setEditType}
          editPriority={editPriority}
          onPrioritySelect={setEditPriority}
          editColor={editColor}
          onColorSelect={setEditColor}
          editTimeCommitment={editTimeCommitment}
          onTimeCommitmentChange={setEditTimeCommitment}
          onTypeInfoPress={() => showInfoModal(
            'Goal Type',
            '• Short Term: 1-3 months\n• Medium Term: 3-12 months\n• Long Term: 1-5 years'
          )}
          onPriorityInfoPress={() => showInfoModal(
            'Priority Level',
            '• Low: Nice to have, can be delayed\n• Medium: Important but flexible\n• High: Critical, must be completed'
          )}
          onSave={handleSaveEditGoal}
          onCancel={() => setEditModalVisible(false)}
        />
        
        <InfoModal
          visible={infoModalVisible}
          title={infoContent.title}
          content={infoContent.content}
          onClose={() => setInfoModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}; 