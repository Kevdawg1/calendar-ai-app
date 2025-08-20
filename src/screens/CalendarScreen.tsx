import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { taskService } from '../services/taskService';
import { goalService } from '../services/goalService';
import { meetingService } from '../services/meetingService';
import { Task, Goal, Meeting } from '../types';
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import { generateUUID } from '../utils/uuid';
import { theme } from '../theme';
import { sharedStyles } from '../theme/styles';
import { TimeGrid } from '../components/TimeGrid';
import { AddTaskModal } from '../components/AddTaskModal';
import { AddMeetingModal } from '../components/AddMeetingModal';
import { MeetingItem } from '../components/MeetingItem';
import { ExpandableFab } from '../components/ExpandableFab';
import { Ionicons } from '@expo/vector-icons';

type CalendarScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Calendar'>;
  route: RouteProp<RootStackParamList, 'Calendar'>;
};

const HOUR_HEIGHT = 60; // Height of each hour row in pixels

export default function CalendarScreen({ navigation, route }: CalendarScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calendarKey, setCalendarKey] = useState(0);
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [isAddMeetingModalVisible, setIsAddMeetingModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>();
  const [meetingToEdit, setMeetingToEdit] = useState<Meeting | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [updateAll, setUpdateAll] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(true);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const calendarRef = React.useRef<any>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setIsCalendarVisible(!isCalendarVisible)} style={{ marginRight: 10 }}>
          <Ionicons name={isCalendarVisible ? 'eye-off-outline' : 'eye-outline'} size={24} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isCalendarVisible]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading tasks, meetings, and goals...');
        const allTasks = await taskService.getAllTasks();
        const allMeetings = await meetingService.getAllMeetings();
        const allGoals = await goalService.getAllGoals();
        
        console.log('Loaded tasks:', allTasks);
        console.log('Loaded meetings:', allMeetings);
        console.log('Loaded goals:', allGoals);
        
        const filteredTasks = allTasks.filter(
          (t: any) => {
            const isValid = t && t.startDate && t.goalId && t.status && t.createdAt && t.updatedAt;
            if (!isValid) {
              console.log('Invalid task found:', t);
            }
            return isValid;
          }
        );
        
        console.log('Filtered tasks:', filteredTasks);
        setTasks(filteredTasks);
        setMeetings(allMeetings);
        setGoals(allGoals);
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load tasks, meetings, and goals');
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (route.params?.tasks) {
      const newTasks = route.params.tasks as Task[];
      setTasks(prevTasks => [...prevTasks, ...newTasks]);
    }
  }, [route.params?.tasks]);

  const getGoalText = (goalId: string) => {
    if (goalId === 'life-admin') {
      return 'Life Admin';
    }
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.text : 'Unknown Goal';
  };

  const handleTaskPress = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.recurrence) {
      Alert.alert(
        'Update Recurring Task',
        'Would you like to update this occurrence only or all future occurrences?',
        [
          {
            text: 'This Occurrence Only',
            onPress: () => {
              const singleOccurrenceTask = {
                ...task,
                recurrence: undefined
              };
              setTaskToEdit(singleOccurrenceTask);
              setIsEditing(true);
              setUpdateAll(false);
              setIsAddTaskModalVisible(true);
            },
          },
          {
            text: 'All Future Occurrences',
            onPress: () => {
              setTaskToEdit(task);
              setIsEditing(true);
              setUpdateAll(true);
              setIsAddTaskModalVisible(true);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      setTaskToEdit(task);
      setIsEditing(true);
      setUpdateAll(false);
      setIsAddTaskModalVisible(true);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.recurrence) {
      Alert.alert(
        'Delete Recurring Task',
        'Would you like to delete this occurrence only or all future occurrences?',
        [
          {
            text: 'This Occurrence Only',
            style: 'destructive',
            onPress: async () => {
              try {
                const updatedTasks = await taskService.deleteSingleOccurrence(taskId);
                setTasks(updatedTasks);
              } catch (error) {
                console.error('Error deleting task:', error);
                Alert.alert('Error', 'Failed to delete task');
              }
            },
          },
          {
            text: 'All Future Occurrences',
            style: 'destructive',
            onPress: async () => {
              try {
                const updatedTasks = await taskService.deleteAllRecurringOccurrences(taskId);
                setTasks(updatedTasks);
              } catch (error) {
                console.error('Error deleting recurring tasks:', error);
                Alert.alert('Error', 'Failed to delete recurring tasks');
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      try {
        const updatedTasks = await taskService.deleteSingleOccurrence(taskId);
        setTasks(updatedTasks);
      } catch (error) {
        console.error('Error deleting task:', error);
        Alert.alert('Error', 'Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.recurrence) {
      Alert.alert(
        'Update Recurring Task',
        'Would you like to update this occurrence only or all future occurrences?',
        [
          {
            text: 'This Occurrence Only',
            onPress: async () => {
              try {
                const updatedTasks = await taskService.updateSingleOccurrence(taskId, { 
                  status: newStatus,
                  recurrence: undefined
                });
                setTasks(updatedTasks);
              } catch (error) {
                console.error('Error updating task status:', error);
                Alert.alert('Error', 'Failed to update task status');
              }
            },
          },
          {
            text: 'All Future Occurrences',
            onPress: async () => {
              try {
                const updatedTasks = await taskService.updateRecurringTask(taskId, { status: newStatus });
                setTasks(updatedTasks);
              } catch (error) {
                console.error('Error updating recurring task status:', error);
                Alert.alert('Error', 'Failed to update recurring task status');
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      try {
        const updatedTasks = await taskService.updateSingleOccurrence(taskId, { status: newStatus });
        setTasks(updatedTasks);
      } catch (error) {
        console.error('Error updating task status:', error);
        Alert.alert('Error', 'Failed to update task status');
      }
    }
  };

  const handleMeetingPress = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;

    setMeetingToEdit(meeting);
    setIsEditing(true);
    setIsAddMeetingModalVisible(true);
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    Alert.alert(
      'Delete Meeting',
      'Are you sure you want to delete this meeting?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await meetingService.deleteMeeting(meetingId);
              setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== meetingId));
            } catch (error) {
              console.error('Error deleting meeting:', error);
              Alert.alert('Error', 'Failed to delete meeting');
            }
          },
        },
      ]
    );
  };

  const handleMeetingStatusChange = async (meetingId: string, newStatus: Meeting['status']) => {
    try {
      const updatedMeeting = await meetingService.updateMeeting(meetingId, { status: newStatus });
      if (updatedMeeting) {
        setMeetings(prevMeetings =>
          prevMeetings.map(meeting =>
            meeting.id === meetingId ? updatedMeeting : meeting
          )
        );
      }
    } catch (error) {
      console.error('Error updating meeting status:', error);
      Alert.alert('Error', 'Failed to update meeting status');
    }
  };

  const handleAddTask = async (taskData: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    goalId: string;
    startDate: string;
    recurrence?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal';
      interval: number;
      endDate: string;
    };
  }) => {
    if (!taskData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!taskData.startTime || !taskData.endTime) {
      Alert.alert('Error', 'Please enter both start and end times');
      return;
    }

    if (isEditing && taskToEdit) {
      try {
        // Check if this was originally a recurring task but is now being edited as a single occurrence
        const wasRecurring = taskToEdit.recurrence !== undefined;
        const isNowSingle = !taskData.recurrence;
        
        if (updateAll && wasRecurring && !isNowSingle) {
          // Update all future occurrences
          const updatedTasks = await taskService.updateRecurringTask(taskToEdit.id, {
            ...taskData,
          });
          setTasks(updatedTasks);
        } else {
          // Update single occurrence (either was single or is being converted to single)
          const updatedTasks = await taskService.updateSingleOccurrence(taskToEdit.id, {
            ...taskData,
          });
          setTasks(updatedTasks);
        }
        setIsAddTaskModalVisible(false);
        setTaskToEdit(undefined);
        setIsEditing(false);
        setUpdateAll(false);
      } catch (error) {
        console.error('Error updating task:', error);
        Alert.alert('Error', 'Failed to update task');
      }
    } else {
      const task: Task = {
        id: generateUUID(),
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        startDate: taskData.startDate,
        startTime: taskData.startTime,
        endTime: taskData.endTime,
        goalId: taskData.goalId || 'no-goal',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        recurrence: taskData.recurrence,
      };

      try {
        const addedTask = (await taskService.addTasks([task]))[0];
        setTasks(prev => [...prev, addedTask]);
        setIsAddTaskModalVisible(false);
      } catch (error) {
        console.error('Error adding task:', error);
        Alert.alert('Error', 'Failed to add task');
      }
    }
  };

  const handleAddMeeting = async (meetingData: {
    title: string;
    description: string;
    location: string;
    type: Meeting['type'];
    priority: Meeting['priority'];
    goalId?: string;
    startDate: string;
    startTime: string;
    endTime: string;
    status: Meeting['status'];
    recurrence?: Meeting['recurrence'];
  }) => {
    if (isEditing && meetingToEdit) {
      try {
        const updatedMeeting = await meetingService.updateMeeting(meetingToEdit.id, {
          title: meetingData.title,
          description: meetingData.description,
          location: meetingData.location,
          type: meetingData.type,
          priority: meetingData.priority,
          goalId: meetingData.goalId,
          startDate: meetingData.startDate,
          startTime: meetingData.startTime,
          endTime: meetingData.endTime,
          status: meetingData.status,
          recurrence: meetingData.recurrence,
        });
        
        if (updatedMeeting) {
          setMeetings(prevMeetings =>
            prevMeetings.map(meeting =>
              meeting.id === meetingToEdit.id ? updatedMeeting : meeting
            )
          );
        }
        
        setIsAddMeetingModalVisible(false);
        setMeetingToEdit(undefined);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating meeting:', error);
        Alert.alert('Error', 'Failed to update meeting');
      }
    } else {
      try {
        const newMeeting = await meetingService.addMeeting({
          title: meetingData.title,
          description: meetingData.description,
          location: meetingData.location,
          type: meetingData.type,
          priority: meetingData.priority,
          goalId: meetingData.goalId,
          startDate: meetingData.startDate,
          startTime: meetingData.startTime,
          endTime: meetingData.endTime,
          status: meetingData.status,
          recurrence: meetingData.recurrence,
        });

        setMeetings(prevMeetings => [...prevMeetings, newMeeting]);
        setIsAddMeetingModalVisible(false);
      } catch (error) {
        console.error('Error adding meeting:', error);
        Alert.alert('Error', 'Failed to add meeting');
      }
    }
  };

  const getTasksForDate = (date: string) => {
    const tasksForDay = tasks.filter(task => {
      if (!task.startDate || !task.goalId || !task.status || !task.createdAt || !task.updatedAt) {
        console.log('Task filtered out due to missing required fields:', task);
        return false;
      }
      
      // Each task now has its own startDate, so we just need to check if it matches
      if (task.startDate === date) {
        console.log('Task matches date:', task);
        return true;
      }
      
      return false;
    });

    return tasksForDay.sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0];
      }
      return timeA[1] - timeB[1];
    });
  };

  const getMeetingsForDate = (date: string) => {
    const meetingsForDay = meetings.filter(meeting => {
      if (!meeting.startDate || !meeting.status || !meeting.createdAt || !meeting.updatedAt) {
        console.log('Meeting filtered out due to missing required fields:', meeting);
        return false;
      }
      
      if (meeting.startDate === date) {
        console.log('Meeting matches date:', meeting);
        return true;
      }
      
      return false;
    });
    
    console.log(`Meetings for ${date}:`, meetingsForDay);
    return meetingsForDay.sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0];
      }
      return timeA[1] - timeB[1];
    });
  };

  const getGoalColor = (goalId: string) => {
    if (goalId === 'life-admin') return '#007AFF';
    const goal = goals.find(g => g.id === goalId);
    return goal?.color || '#FF9500';
  };

  const getMeetingColor = (type: Meeting['type']) => {
    switch (type) {
      case 'work':
        return theme.colors.primary;
      case 'personal':
        return theme.colors.secondary;
      case 'social':
        return theme.colors.info;
      case 'health':
        return theme.colors.success;
      case 'education':
        return theme.colors.warning;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getMarkedDates = (tasks: Task[], meetings: Meeting[]) => {
    console.log('Getting marked dates for tasks and meetings:', tasks, meetings);
    const marked: { [key: string]: any } = {};
    
    // Always mark the selected date
    marked[selectedDate] = {
      selected: true,
      selectedColor: theme.colors.primary,
      dots: []
    };
    
    tasks.forEach(task => {
      const color = getGoalColor(task.goalId);
      console.log('Processing task:', task.id, 'with color:', color);
      
      // Each task now has its own startDate, so we just need to mark that specific date
      if (!marked[task.startDate]) {
        marked[task.startDate] = { dots: [] };
      }
      if (!marked[task.startDate].dots.some((dot: any) => dot.color === color)) {
        marked[task.startDate].dots.push({ color, key: task.id });
        console.log('Added dot for task on date:', task.startDate, 'with color:', color);
      }
    });

    meetings.forEach(meeting => {
      const color = getMeetingColor(meeting.type);
      console.log('Processing meeting:', meeting.id, 'with color:', color);
      
      if (!marked[meeting.startDate]) {
        marked[meeting.startDate] = { dots: [] };
      }
      if (!marked[meeting.startDate].dots.some((dot: any) => dot.color === color)) {
        marked[meeting.startDate].dots.push({ color, key: meeting.id });
        console.log('Added dot for meeting on date:', meeting.startDate, 'with color:', color);
      }
    });
    
    console.log('Final marked dates:', marked);
    return marked;
  };

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const handleMonthChange = (month: any) => {
    setCurrentMonth(format(new Date(month.timestamp), 'yyyy-MM-dd'));
  };

  const handleTodayPress = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setSelectedDate(today);
    setCurrentMonth(today);
    setCalendarKey(prev => prev + 1); // Force calendar re-render
    // Scroll to today's tasks
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <View style={sharedStyles.safeAreaContainer}>
        {isCalendarVisible && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={[sharedStyles.header, { marginBottom: 0 }]}>Calendar</Text>
              <TouchableOpacity style={styles.headerButton} onPress={handleTodayPress}>
                <Text style={styles.headerButtonText}>Today</Text>
              </TouchableOpacity>
            </View>
            <Calendar
              key={calendarKey}
              current={currentMonth}
              onMonthChange={handleMonthChange}
              onDayPress={handleDayPress}
              markedDates={getMarkedDates(tasks, meetings)}
              markingType="multi-dot"
              theme={{
                todayTextColor: theme.colors.primary,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: '#fff',
                dotColor: theme.colors.primary,
                selectedDotColor: '#fff',
                arrowColor: theme.colors.primary,
                dotStyle: {
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginTop: 2,
                },
                // @ts-ignore
                'stylesheet.calendar.main': {
                  container: {
                    paddingLeft: 5,
                    paddingRight: 5,
                  },
                  dayContainer: {
                    width: 32,
                    height: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  selected: {
                    backgroundColor: theme.colors.primary,
                    borderRadius: 16,
                    width: 32,
                    height: 32,
                  },
                  today: {
                    backgroundColor: 'transparent',
                  },
                  todayText: {
                    color: theme.colors.primary,
                  },
                },
                // @ts-ignore
                'stylesheet.calendar.header': {
                  dayTextAtIndex0: {
                    color: theme.colors.primary,
                  },
                },
              }}
            />
          </>
        )}

        <ScrollView
          ref={scrollViewRef}
          style={[sharedStyles.content, !isCalendarVisible && { flex: 1 }]}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={sharedStyles.header}>
            <Text style={sharedStyles.header}>
              {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>

          <TimeGrid
            tasks={getTasksForDate(selectedDate)}
            meetings={getMeetingsForDate(selectedDate)}
            onTaskPress={handleTaskPress}
            onTaskDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onMeetingPress={handleMeetingPress}
            onMeetingDelete={handleDeleteMeeting}
            onMeetingStatusChange={handleMeetingStatusChange}
            getGoalText={getGoalText}
            getGoalColor={getGoalColor}
            getMeetingColor={getMeetingColor}
          />
        </ScrollView>

        <ExpandableFab
          onAddTask={() => setIsAddTaskModalVisible(true)}
          onAddMeeting={() => setIsAddMeetingModalVisible(true)}
        />

        {isAddTaskModalVisible && (
          <AddTaskModal
            isVisible={isAddTaskModalVisible}
            onClose={() => {
              setIsAddTaskModalVisible(false);
              setTaskToEdit(undefined);
              setIsEditing(false);
            }}
            onSubmit={handleAddTask}
            goals={goals}
            selectedDate={selectedDate}
            taskToEdit={taskToEdit}
            isEditing={isEditing}
            updateAll={updateAll}
          />
        )}

        {isAddMeetingModalVisible && (
          <AddMeetingModal
            isVisible={isAddMeetingModalVisible}
            onClose={() => {
              setIsAddMeetingModalVisible(false);
              setMeetingToEdit(undefined);
              setIsEditing(false);
            }}
            onSubmit={handleAddMeeting}
            selectedDate={selectedDate}
            meetingToEdit={meetingToEdit}
            isEditing={isEditing}
            goals={goals}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  headerButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
}); 