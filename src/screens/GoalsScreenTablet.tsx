import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  FlatList, 
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { goalService } from '../services/goalService';
import { openaiService } from '../services/openaiService';
import { Goal, Task } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { sharedStyles } from '../theme/styles';
import { goalsScreenTabletStyles } from '../styles/screens';
import { Section } from '../components/layout/Section';
import { EmptyState } from '../components/display/EmptyState';
import { Button as CustomButton } from '../components/buttons/Button';
import { userPreferencesService, UserPreferences } from '../services/userPreferencesService';
import { taskService } from '../services/taskService';
import { GoalForm } from '../components/forms/GoalForm';
import { EditGoalModal } from '../components/modals/EditGoalModal';
import { InfoModal } from '../components/modals/InfoModal';
import { WeeklyTimeBalance } from '../components/display/WeeklyTimeBalance';
import { GoalCard } from '../components/cards/GoalCard';
import { SplitLayout } from '../components/layout/ResponsiveLayout';
import { getResponsiveValue, getResponsiveFontSize } from '../utils/deviceUtils';

const GOAL_COLORS = ['#007AFF', '#FF9500', '#34C759', '#AF52DE', '#FF2D55', '#5AC8FA', '#FFD60A'];

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const GoalsScreenTablet = () => {
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
      const wakeUpTime = new Date(userPreferences.wakeUpTime);
      const sleepTime = new Date(userPreferences.sleepTime);
      
      // Calculate available hours per day
      const wakeHour = wakeUpTime.getHours() + wakeUpTime.getMinutes() / 60;
      const sleepHour = sleepTime.getHours() + sleepTime.getMinutes() / 60;
      const availableHoursPerDay = sleepHour - wakeHour;
      
      // Calculate work hours
      let workHoursPerWeek = 0;
      if (userPreferences.hasWorkSchedule) {
        Object.values(userPreferences.workSchedule).forEach(day => {
          if (day && day.startTime && day.endTime) {
            const startHour = new Date(day.startTime).getHours() + new Date(day.startTime).getMinutes() / 60;
            const endHour = new Date(day.endTime).getHours() + new Date(day.endTime).getMinutes() / 60;
            workHoursPerWeek += (endHour - startHour);
          }
        });
      }
      
      // Calculate task hours
      const allTasks = await taskService.getAllTasks();
      const taskHoursPerWeek = goals.reduce((total, goal) => total + goal.timeCommitment, 0);
      
      const weeklyAvailableHours = availableHoursPerDay * 7;
      const remaining = weeklyAvailableHours - workHoursPerWeek - taskHoursPerWeek;
      
      setBreakdown({
        availableHours: availableHoursPerDay,
        weeklyAvailableHours,
        workHours: workHoursPerWeek,
        taskHours: taskHoursPerWeek,
        remaining: Math.max(0, remaining),
      });
      
      setRemainingHours(remaining);
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

    try {
      const newGoal: Goal = {
        id: '',
        text: newGoalText.trim(),
        type: selectedType,
        priority: selectedPriority,
        timeCommitment: parseInt(timeCommitment),
        createdAt: new Date().toISOString(),
        color: selectedColor,
      };

      await goalService.addGoal(newGoal);
      setNewGoalText('');
      setSelectedType('short');
      setSelectedPriority('medium');
      setTimeCommitment('20');
      setSelectedColor(GOAL_COLORS[0]);
      loadGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
      Alert.alert('Error', 'Failed to add goal');
    }
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
            try {
              await goalService.deleteGoal(goalId);
              loadGoals();
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal');
            }
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
    setEditColor(goal.color);
    setEditModalVisible(true);
  };

  const handleSaveEditGoal = async () => {
    if (!editGoal) return;

    try {
      const updatedGoal: Goal = {
        ...editGoal,
        type: editType,
        priority: editPriority,
        timeCommitment: parseInt(editTimeCommitment),
        color: editColor,
      };

      await goalService.updateGoal(updatedGoal);
      setEditModalVisible(false);
      setEditGoal(null);
      loadGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Error', 'Failed to update goal');
    }
  };

  const handleGenerateTasks = async (goal: Goal) => {
    try {
      setIsLoading(true);
      setLoadingStage('Analyzing goal...');

      const existingTasks = await taskService.getAllTasks();
      const generatedTasks = await openaiService.generateTasks([goal], existingTasks, userPreferences);

      setLoadingStage('Saving tasks...');
      await taskService.addTasks(generatedTasks);

      setIsLoading(false);
      setLoadingStage('');
      
      Alert.alert(
        'Success',
        `Generated ${generatedTasks.length} tasks for "${goal.text}"`,
        [
          { text: 'OK' },
          { 
            text: 'View Calendar', 
            onPress: () => navigation.navigate('Calendar', {}) 
          }
        ]
      );
    } catch (error) {
      setIsLoading(false);
      setLoadingStage('');
      console.error('Error generating tasks:', error);
      Alert.alert('Error', 'Failed to generate tasks. Please try again.');
    }
  };

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <GoalCard
      goal={item}
      onEdit={() => handleEditGoal(item)}
      onDelete={() => handleDeleteGoal(item.id)}
      onGenerateTasks={() => handleGenerateTasks(item)}
      isLoading={isLoading}
      loadingStage={loadingStage}
    />
  );

  const renderGoalFormPanel = () => (
    <View style={goalsScreenTabletStyles.formPanel}>
      <View style={goalsScreenTabletStyles.formHeader}>
        <Text style={goalsScreenTabletStyles.panelTitle}>Add New Goal</Text>
        <TouchableOpacity
          style={goalsScreenTabletStyles.infoButton}
          onPress={() => showInfoModal(
            'Goal Types',
            'Short-term: 1 month or less\nMedium-term: 1-6 months\nLong-term: 6+ months'
          )}
        >
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <GoalForm
        goalText={newGoalText}
        onGoalTextChange={setNewGoalText}
        selectedType={selectedType}
        onTypeSelect={setSelectedType}
        selectedPriority={selectedPriority}
        onPrioritySelect={setSelectedPriority}
        timeCommitment={timeCommitment}
        onTimeCommitmentChange={setTimeCommitment}
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
        onTypeInfoPress={() => showInfoModal(
          'Goal Types',
          'Short-term: 1 month or less\nMedium-term: 1-6 months\nLong-term: 6+ months'
        )}
        onPriorityInfoPress={() => showInfoModal(
          'Priority Levels',
          'Low: Nice to have\nMedium: Important\nHigh: Critical'
        )}
        onSubmit={handleAddGoal}
      />
    </View>
  );

  const renderGoalListPanel = () => (
    <View style={goalsScreenTabletStyles.listPanel}>
      <View style={goalsScreenTabletStyles.listHeader}>
        <Text style={goalsScreenTabletStyles.panelTitle}>Your Goals</Text>
        <Text style={goalsScreenTabletStyles.goalCount}>{goals.length} goals</Text>
      </View>
      
      <View style={goalsScreenTabletStyles.timeBalanceContainer}>
        <WeeklyTimeBalance breakdown={breakdown} remainingHours={remainingHours} />
      </View>
      
      {goals.length === 0 ? (
        <EmptyState
          icon="trophy-outline"
          title="No Goals Yet"
          description="Start by adding your first goal. What would you like to achieve?"
        />
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id}
          style={goalsScreenTabletStyles.goalList}
          contentContainerStyle={goalsScreenTabletStyles.goalListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={sharedStyles.container}>
      <SplitLayout
        leftPanel={renderGoalFormPanel()}
        rightPanel={renderGoalListPanel()}
        layoutType="goals"
        backgroundColor={theme.colors.background}
      />
      
      <EditGoalModal
        visible={editModalVisible}
        goal={editGoal}
        type={editType}
        onTypeChange={setEditType}
        priority={editPriority}
        onPriorityChange={setEditPriority}
        timeCommitment={editTimeCommitment}
        onTimeCommitmentChange={setEditTimeCommitment}
        color={editColor}
        onColorChange={setEditColor}
        onSave={handleSaveEditGoal}
        onCancel={() => {
          setEditModalVisible(false);
          setEditGoal(null);
        }}
        goalColors={GOAL_COLORS}
      />
      
      <InfoModal
        visible={infoModalVisible}
        title={infoContent.title}
        content={infoContent.content}
        onClose={() => setInfoModalVisible(false)}
      />
    </SafeAreaView>
  );
}; 