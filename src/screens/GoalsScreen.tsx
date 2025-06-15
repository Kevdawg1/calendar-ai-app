import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, FlatList, ActivityIndicator, Modal } from 'react-native';
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

  useEffect(() => {
    loadGoals();
    loadUserPreferences();
  }, []);

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
          duration: task.duration,
          startDate: task.startDate,
          startTime: task.startTime,
          endTime: task.endTime,
          goalId: goal.id,
          status: 'pending' as const,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          color: goal.color,
        }));
        navigation.navigate('Calendar', { tasks: calendarTasks });
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
      Alert.alert('Error', 'Failed to generate tasks. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const renderColorPicker = (color: string, setColor: (c: string) => void) => (
    <View style={{ flexDirection: 'row', marginVertical: 8 }}>
      {GOAL_COLORS.map((c) => (
        <TouchableOpacity
          key={c}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: c,
            marginHorizontal: 6,
            borderWidth: color === c ? 3 : 1,
            borderColor: color === c ? theme.colors.primary : '#ccc',
          }}
          onPress={() => setColor(c)}
        />
      ))}
    </View>
  );

  const renderGoalForm = () => (
    <View style={sharedStyles.inputContainer}>
      <TextInput
        style={sharedStyles.input}
        value={newGoalText}
        onChangeText={setNewGoalText}
        placeholder="Enter your goal"
        multiline
      />
      <Text style={sharedStyles.sectionLabel}>Goal Type</Text>
      <View style={sharedStyles.formSectionWide}>
        <View style={sharedStyles.typeContainerRow}>
          <TouchableOpacity
            style={[
              sharedStyles.typeButton,
              selectedType === 'short' && sharedStyles.selectedType,
            ]}
            onPress={() => setSelectedType('short')}
          >
            <Text style={selectedType === 'short' ? sharedStyles.selectedTypeText : sharedStyles.typeText}>Short Term</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              sharedStyles.typeButton,
              selectedType === 'medium' && sharedStyles.selectedType,
            ]}
            onPress={() => setSelectedType('medium')}
          >
            <Text style={selectedType === 'medium' ? sharedStyles.selectedTypeText : sharedStyles.typeText}>Medium Term</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              sharedStyles.typeButton,
              selectedType === 'long' && sharedStyles.selectedType,
            ]}
            onPress={() => setSelectedType('long')}
          >
            <Text style={selectedType === 'long' ? sharedStyles.selectedTypeText : sharedStyles.typeText}>Long Term</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={sharedStyles.sectionLabel}>Priority Level</Text>
      <View style={sharedStyles.formSectionWide}>
        <View style={sharedStyles.typeContainerRow}>
          <TouchableOpacity
            style={[
              sharedStyles.priorityButton,
              selectedPriority === 'low' && sharedStyles.selectedPriority,
            ]}
            onPress={() => setSelectedPriority('low')}
          >
            <Text style={selectedPriority === 'low' ? sharedStyles.selectedPriorityText : sharedStyles.priorityText}>Low</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              sharedStyles.priorityButton,
              selectedPriority === 'medium' && sharedStyles.selectedPriority,
            ]}
            onPress={() => setSelectedPriority('medium')}
          >
            <Text style={selectedPriority === 'medium' ? sharedStyles.selectedPriorityText : sharedStyles.priorityText}>Medium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              sharedStyles.priorityButton,
              selectedPriority === 'high' && sharedStyles.selectedPriority,
            ]}
            onPress={() => setSelectedPriority('high')}
          >
            <Text style={selectedPriority === 'high' ? sharedStyles.selectedPriorityText : sharedStyles.priorityText}>High</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={sharedStyles.sectionLabel}>Color</Text>
      {renderColorPicker(selectedColor, setSelectedColor)}
      <Text style={sharedStyles.sectionLabel}>Time Commitment (hours per week)</Text>
      <TextInput
        style={sharedStyles.input}
        value={timeCommitment}
        onChangeText={setTimeCommitment}
        keyboardType="numeric"
        placeholder="Enter hours per week"
      />
      <CustomButton
        title="Add Goal"
        onPress={handleAddGoal}
        style={sharedStyles.button}
      />
    </View>
  );

  const renderEditGoalModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={sharedStyles.modalContainer}>
        <View style={sharedStyles.modalContent}>
          <Text style={sharedStyles.modalTitle}>Edit Goal</Text>
          <Text style={sharedStyles.label}>Title</Text>
          <TextInput
            style={[sharedStyles.input, { backgroundColor: '#f0f0f0' }]}
            value={editGoal?.text || ''}
            editable={false}
          />
          <Text style={sharedStyles.sectionLabel}>Goal Type</Text>
          <View style={sharedStyles.formSectionWide}>
            <View style={sharedStyles.typeContainerRow}>
              <TouchableOpacity
                style={[
                  sharedStyles.typeButton,
                  editType === 'short' && sharedStyles.selectedType,
                ]}
                onPress={() => setEditType('short')}
              >
                <Text style={editType === 'short' ? sharedStyles.selectedTypeText : sharedStyles.typeText}>Short Term</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  sharedStyles.typeButton,
                  editType === 'medium' && sharedStyles.selectedType,
                ]}
                onPress={() => setEditType('medium')}
              >
                <Text style={editType === 'medium' ? sharedStyles.selectedTypeText : sharedStyles.typeText}>Medium Term</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  sharedStyles.typeButton,
                  editType === 'long' && sharedStyles.selectedType,
                ]}
                onPress={() => setEditType('long')}
              >
                <Text style={editType === 'long' ? sharedStyles.selectedTypeText : sharedStyles.typeText}>Long Term</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={sharedStyles.sectionLabel}>Priority Level</Text>
          <View style={sharedStyles.formSectionWide}>
            <View style={sharedStyles.typeContainerRow}>
              <TouchableOpacity
                style={[
                  sharedStyles.priorityButton,
                  editPriority === 'low' && sharedStyles.selectedPriority,
                ]}
                onPress={() => setEditPriority('low')}
              >
                <Text style={editPriority === 'low' ? sharedStyles.selectedPriorityText : sharedStyles.priorityText}>Low</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  sharedStyles.priorityButton,
                  editPriority === 'medium' && sharedStyles.selectedPriority,
                ]}
                onPress={() => setEditPriority('medium')}
              >
                <Text style={editPriority === 'medium' ? sharedStyles.selectedPriorityText : sharedStyles.priorityText}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  sharedStyles.priorityButton,
                  editPriority === 'high' && sharedStyles.selectedPriority,
                ]}
                onPress={() => setEditPriority('high')}
              >
                <Text style={editPriority === 'high' ? sharedStyles.selectedPriorityText : sharedStyles.priorityText}>High</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={sharedStyles.sectionLabel}>Color</Text>
          {renderColorPicker(editColor, setEditColor)}
          <Text style={sharedStyles.sectionLabel}>Time Commitment (hours per week)</Text>
          <TextInput
            style={sharedStyles.input}
            value={editTimeCommitment}
            onChangeText={setEditTimeCommitment}
            keyboardType="numeric"
            placeholder="Enter hours per week"
          />
          <View style={sharedStyles.modalButtons}>
            <TouchableOpacity
              style={[sharedStyles.modalButton, sharedStyles.cancelButton]}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={sharedStyles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[sharedStyles.modalButton, sharedStyles.saveButton]}
              onPress={handleSaveEditGoal}
            >
              <Text style={sharedStyles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <View style={[sharedStyles.card, { borderLeftWidth: 6, borderLeftColor: item.color }] }>
      <View style={sharedStyles.cardHeader}>
        <Text style={sharedStyles.cardTitle}>{item.text}</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => handleEditGoal(item)}
            style={sharedStyles.deleteButton}
          >
            <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteGoal(item.id)}
            style={sharedStyles.deleteButton}
          >
            <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={sharedStyles.cardContent}>
        <Text style={sharedStyles.cardText}>
          Type: {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
        <Text style={sharedStyles.cardText}>
          Priority: {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
        </Text>
        <Text style={sharedStyles.cardText}>
          Time Commitment: {item.timeCommitment} hours/week
        </Text>
      </View>
      <CustomButton
        title="Generate Tasks"
        onPress={() => handleGenerateTasks(item)}
        style={sharedStyles.button}
      />
    </View>
  );

  return (
    <View style={sharedStyles.container}>
      {isLoading && (
        <View style={sharedStyles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={sharedStyles.loadingText}>{loadingStage}</Text>
        </View>
      )}
      <ScrollView style={sharedStyles.content}>
        <Section title="Add New Goal">
          {renderGoalForm()}
        </Section>
        <Section title="Your Goals">
          {goals.length === 0 ? (
            <EmptyState
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
      {renderEditGoalModal()}
    </View>
  );
}; 