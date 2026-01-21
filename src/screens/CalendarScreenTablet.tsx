import React, { useState, useEffect, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { taskService } from '../services/taskService';
import { goalService } from '../services/goalService';
import { Task, Goal } from '../types';
import { Calendar } from 'react-native-calendars';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { theme } from '../theme';
import { sharedStyles } from '../theme/styles';
import { calendarScreenTabletStyles } from '../styles/screens';
import { Ionicons } from '@expo/vector-icons';
import { SplitLayout } from '../components/layout/ResponsiveLayout';
import { 
  getResponsiveValue, 
  getResponsiveFontSize,
  getOptimalTabletMargins,
  getTabletContentPadding
} from '../utils/deviceUtils';

type CalendarScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Calendar'>;
  route: RouteProp<RootStackParamList, 'Calendar'>;
};

export default function CalendarScreenTablet({ navigation, route }: CalendarScreenProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isCalendarVisible, setIsCalendarVisible] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => setIsCalendarVisible(!isCalendarVisible)} 
          style={calendarScreenTabletStyles.headerButton}
        >
          <Ionicons 
            name={isCalendarVisible ? 'eye-off-outline' : 'eye-outline'} 
            size={getResponsiveValue(24, 28)} 
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isCalendarVisible]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allTasks = await taskService.getAllTasks();
        const allGoals = await goalService.getAllGoals();
        
        const filteredTasks = allTasks.filter(
          (t: any) => {
            const isValid = t && t.startDate && t.goalId && t.status && t.createdAt && t.updatedAt;
            return isValid;
          }
        );
        
        setTasks(filteredTasks);
        setGoals(allGoals);
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load tasks and goals');
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

  const getGoalColor = (goalId: string) => {
    if (goalId === 'life-admin') {
      return '#34C759';
    }
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.color : theme.colors.primary;
  };

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter(task => task.startDate === date);
  };

  const getMarkedDates = (tasks: Task[]) => {
    const marked: any = {};
    
    tasks.forEach(task => {
      const date = task.startDate;
      if (!marked[date]) {
        marked[date] = {
          marked: true,
          dotColor: getGoalColor(task.goalId),
          selected: date === selectedDate,
          selectedColor: theme.colors.primary,
        };
      } else {
        marked[date].dots = marked[date].dots || [];
        marked[date].dots.push({
          color: getGoalColor(task.goalId),
          key: task.id,
        });
      }
    });

    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: theme.colors.primary,
      };
    }

    return marked;
  };

  const formatTaskTime = (task: Task) => {
    if (!task.startTime) return 'All day';
    const startTime = task.startTime;
    const endTime = task.endTime || '';
    return endTime ? `${startTime} - ${endTime}` : startTime;
  };

  const getRelativeDateText = (date: string) => {
    const taskDate = parseISO(date);
    if (isToday(taskDate)) return 'Today';
    if (isTomorrow(taskDate)) return 'Tomorrow';
    if (isYesterday(taskDate)) return 'Yesterday';
    return format(taskDate, 'EEEE, MMM d');
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[
        calendarScreenTabletStyles.taskItem,
        { borderLeftColor: getGoalColor(item.goalId) }
      ]}
      onPress={() => {
        // Handle task press - could open edit modal
        console.log('Task pressed:', item.title);
      }}
    >
      <View style={calendarScreenTabletStyles.taskHeader}>
        <Text style={calendarScreenTabletStyles.taskTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={calendarScreenTabletStyles.taskMeta}>
          <Text style={calendarScreenTabletStyles.taskTime}>{formatTaskTime(item)}</Text>
          <Text style={calendarScreenTabletStyles.taskGoal}>{getGoalText(item.goalId)}</Text>
        </View>
      </View>
      {item.description && (
        <Text style={calendarScreenTabletStyles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={calendarScreenTabletStyles.taskStatus}>
        <View style={[
          calendarScreenTabletStyles.statusIndicator,
          { backgroundColor: item.status === 'completed' ? '#34C759' : '#FF9500' }
        ]} />
        <Text style={calendarScreenTabletStyles.statusText}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCalendarPanel = () => (
    <View style={calendarScreenTabletStyles.calendarPanel}>
      <View style={calendarScreenTabletStyles.calendarHeader}>
        <Text style={calendarScreenTabletStyles.panelTitle}>Calendar</Text>
        <TouchableOpacity
          style={calendarScreenTabletStyles.addButton}
          onPress={() => {
            // Handle add task
            console.log('Add task pressed');
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {isCalendarVisible && (
        <Calendar
          current={currentMonth}
          onDayPress={handleDayPress}
          markedDates={getMarkedDates(tasks)}
          theme={{
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: theme.colors.primary,
            dayTextColor: theme.colors.text.primary,
            textDisabledColor: '#d9e1e8',
            arrowColor: theme.colors.primary,
            monthTextColor: theme.colors.text.primary,
            indicatorColor: theme.colors.primary,
            textDayFontSize: getResponsiveFontSize(14, 18),
            textMonthFontSize: getResponsiveFontSize(16, 20),
            textDayHeaderFontSize: getResponsiveFontSize(12, 16),
          }}
          style={calendarScreenTabletStyles.calendar}
        />
      )}
      
      <View style={calendarScreenTabletStyles.timeGridContainer}>
        <Text style={calendarScreenTabletStyles.timeGridTitle}>Today's Schedule</Text>
        <ScrollView style={calendarScreenTabletStyles.timeGridScroll}>
          {getTasksForDate(selectedDate).map(task => (
            <View key={task.id} style={calendarScreenTabletStyles.timeGridItem}>
              <Text style={calendarScreenTabletStyles.timeGridTime}>
                {task.startTime || 'All day'}
              </Text>
              <Text style={calendarScreenTabletStyles.timeGridTitle}>
                {task.title}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderTaskListPanel = () => (
    <View style={calendarScreenTabletStyles.taskListPanel}>
      <View style={calendarScreenTabletStyles.taskListHeader}>
        <Text style={calendarScreenTabletStyles.panelTitle}>
          Tasks for {getRelativeDateText(selectedDate)}
        </Text>
        <Text style={calendarScreenTabletStyles.taskCount}>
          {getTasksForDate(selectedDate).length} tasks
        </Text>
      </View>
      
      <FlatList
        data={getTasksForDate(selectedDate)}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        style={calendarScreenTabletStyles.taskList}
        contentContainerStyle={calendarScreenTabletStyles.taskListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={calendarScreenTabletStyles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={calendarScreenTabletStyles.emptyText}>No tasks scheduled for this date</Text>
            <TouchableOpacity
              style={calendarScreenTabletStyles.emptyAddButton}
              onPress={() => {
                console.log('Add task from empty state');
              }}
            >
              <Text style={calendarScreenTabletStyles.emptyAddButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={sharedStyles.container}>
      {isCalendarVisible ? (
        <SplitLayout
          leftPanel={renderCalendarPanel()}
          rightPanel={renderTaskListPanel()}
          layoutType="calendar"
          backgroundColor={theme.colors.background}
        />
      ) : (
        <View style={calendarScreenTabletStyles.fullWidthContainer}>
          {renderTaskListPanel()}
        </View>
      )}
    </SafeAreaView>
  );
} 