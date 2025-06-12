import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, SafeAreaView, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format, addDays, parseISO } from 'date-fns';
import { generateTasks } from './src/services/openaiService';

interface Goal {
  id: string;
  text: string;
  type: 'short' | 'medium' | 'long';
  timeCommitment: number;
  priority: 'low' | 'medium' | 'high';
}

interface Task {
  id: string;
  goalId: string;
  title: string;
  duration: number; // in minutes
  date: string;
  completed: boolean;
}

const TIME_OPTIONS = [2, 5, 10, 20, 30, 40];
const GOAL_TYPES = ['short', 'medium', 'long'] as const;
const PRIORITIES = ['low', 'medium', 'high'] as const;

export default function App() {
  const [newGoal, setNewGoal] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<Goal['type']>('medium');
  const [selectedTime, setSelectedTime] = useState<number>(5);
  const [selectedPriority, setSelectedPriority] = useState<Goal['priority']>('medium');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showCalendar, setShowCalendar] = useState(false);

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, {
        id: Date.now().toString(),
        text: newGoal.trim(),
        type: selectedType,
        timeCommitment: selectedTime,
        priority: selectedPriority
      }]);
      setNewGoal('');
      setModalVisible(false);
    }
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
    setTasks(tasks.filter(task => task.goalId !== id));
  };

  const handleGenerateTasks = async () => {
    if (goals.length === 0) {
      setResult('Please add at least one goal to analyze.');
      return;
    }

    try {
      setLoading(true);
      const tasksData = await generateTasks(goals);
      console.log(tasksData);

      // Assign tasks to the correct goal based on matching text (or other logic if available)
      // If the API returns goalId, use it; otherwise, assign to the first goal for now
      const newTasks = tasksData.map((task, index) => ({
        id: Date.now().toString() + index,
        goalId: goals[0].id, // If you have logic to match to the correct goal, update here
        title: task.title,
        duration: task.duration,
        date: task.startDate, // Ensure this is in 'yyyy-MM-dd' format
        completed: false
      }));
      console.log(newTasks);
      setTasks([...tasks, ...newTasks]);
      setShowCalendar(true);
      setResult(''); // Clear any previous error
    } catch (error: any) {
      console.log(error);
      setResult(`Error generating tasks: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getTasksForDate = (date: string) => {
    // Ensure date comparison is in 'yyyy-MM-dd' format
    return tasks.filter(task => format(parseISO(task.date), 'yyyy-MM-dd') === format(parseISO(date), 'yyyy-MM-dd'));
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.taskItem, item.completed && styles.completedTask]}
      onPress={() => toggleTaskCompletion(item.id)}
    >
      <Text style={[styles.taskTitle, item.completed && styles.completedTaskText]}>
        {item.title}
      </Text>
      <Text style={styles.taskDuration}>{item.duration} minutes</Text>
    </TouchableOpacity>
  );

  const renderCalendar = () => (
    <View style={styles.calendarContainer}>
      <Calendar
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          ...tasks.reduce((acc, task) => ({
            ...acc,
            [task.date]: { marked: true, dotColor: task.completed ? '#34C759' : '#007AFF' }
          }), {}),
          [selectedDate]: { selected: true, selectedColor: '#007AFF' }
        }}
        theme={{
          todayTextColor: '#007AFF',
          selectedDayBackgroundColor: '#007AFF',
          dotColor: '#007AFF',
          arrowColor: '#007AFF',
        }}
      />
      <View style={styles.tasksContainer}>
        <Text style={styles.tasksTitle}>Tasks for {format(parseISO(selectedDate), 'MMMM d, yyyy')}</Text>
        <FlatList
          data={getTasksForDate(selectedDate)}
          renderItem={renderTaskItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tasks scheduled for this day</Text>
          }
        />
      </View>
    </View>
  );

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <View style={styles.goalItem}>
      <View style={styles.goalContent}>
        <Text style={styles.goalText}>{item.text}</Text>
        <View style={styles.goalDetails}>
          <Text style={[styles.goalType, styles[`${item.type}Type`]]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Term
          </Text>
          <Text style={styles.goalTime}>{item.timeCommitment}hr/week</Text>
          <Text style={[styles.goalPriority, styles[`${item.priority}Priority`]]}>
            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => removeGoal(item.id)}
        style={styles.removeButton}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Goal</Text>
          
          <TextInput
            style={styles.modalInput}
            placeholder="Enter your goal..."
            value={newGoal}
            onChangeText={setNewGoal}
          />

          <Text style={styles.modalSectionTitle}>Goal Type</Text>
          <View style={styles.optionContainer}>
            {GOAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  selectedType === type && styles.selectedOption
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[
                  styles.optionText,
                  selectedType === type && styles.selectedOptionText
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.modalSectionTitle}>Weekly Time Commitment</Text>
          <View style={styles.optionContainer}>
            {TIME_OPTIONS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.optionButton,
                  selectedTime === time && styles.selectedOption
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.optionText,
                  selectedTime === time && styles.selectedOptionText
                ]}>
                  {time}hr
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.modalSectionTitle}>Priority</Text>
          <View style={styles.optionContainer}>
            {PRIORITIES.map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.optionButton,
                  selectedPriority === priority && styles.selectedOption
                ]}
                onPress={() => setSelectedPriority(priority)}
              >
                <Text style={[
                  styles.optionText,
                  selectedPriority === priority && styles.selectedOptionText
                ]}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.addButton]}
              onPress={addGoal}
            >
              <Text style={styles.modalButtonText}>Add Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Life Goals Analysis</Text>
        
        <TouchableOpacity
          style={styles.addGoalButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addGoalButtonText}>+ Add New Goal</Text>
        </TouchableOpacity>

        <FlatList
          data={goals}
          renderItem={renderGoalItem}
          keyExtractor={item => item.id}
          style={styles.goalsList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No goals added yet. Tap the button above to add your first goal!</Text>
          }
        />

        <TouchableOpacity
          style={[styles.analyzeButton, goals.length === 0 && styles.disabledButton]}
          onPress={handleGenerateTasks}
          disabled={loading || goals.length === 0}
        >
          <Text style={styles.analyzeButtonText}>
            {loading ? "Generating Tasks..." : "Generate Tasks"}
          </Text>
        </TouchableOpacity>

        {showCalendar && renderCalendar()}

        {result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Analysis Result:</Text>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}
      </ScrollView>
      {renderModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  addGoalButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addGoalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalsList: {
    maxHeight: 500,
    marginBottom: 20,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  goalContent: {
    flex: 1,
  },
  goalText: {
    fontSize: 16,
    marginBottom: 8,
  },
  goalDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalType: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  shortType: {
    backgroundColor: '#FFE5B4',
    color: '#B85C00',
  },
  mediumType: {
    backgroundColor: '#B4E5FF',
    color: '#0066B8',
  },
  longType: {
    backgroundColor: '#B4FFE5',
    color: '#00B85C',
  },
  goalTime: {
    fontSize: 12,
    backgroundColor: '#E5B4FF',
    color: '#5C00B8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  goalPriority: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lowPriority: {
    backgroundColor: '#FFB4B4',
    color: '#B80000',
  },
  mediumPriority: {
    backgroundColor: '#FFE5B4',
    color: '#B85C00',
  },
  highPriority: {
    backgroundColor: '#B4FFB4',
    color: '#00B800',
  },
  removeButton: {
    padding: 5,
  },
  removeButtonText: {
    color: '#FF3B30',
    fontSize: 24,
    fontWeight: 'bold',
  },
  analyzeButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  addButton: {
    backgroundColor: '#34C759',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tasksContainer: {
    marginTop: 20,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  taskItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedTask: {
    backgroundColor: '#f0f0f0',
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskDuration: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
});
