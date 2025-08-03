import React, { useState, useEffect, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  FlatList,
  StyleSheet,
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
import { Ionicons } from '@expo/vector-icons';
import { SplitLayout } from '../components/ResponsiveLayout';
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
          style={styles.headerButton}
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
        styles.taskItem,
        { borderLeftColor: getGoalColor(item.goalId) }
      ]}
      onPress={() => {
        // Handle task press - could open edit modal
        console.log('Task pressed:', item.title);
      }}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.taskMeta}>
          <Text style={styles.taskTime}>{formatTaskTime(item)}</Text>
          <Text style={styles.taskGoal}>{getGoalText(item.goalId)}</Text>
        </View>
      </View>
      {item.description && (
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={styles.taskStatus}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: item.status === 'completed' ? '#34C759' : '#FF9500' }
        ]} />
        <Text style={styles.statusText}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCalendarPanel = () => (
    <View style={styles.calendarPanel}>
      <View style={styles.calendarHeader}>
        <Text style={styles.panelTitle}>Calendar</Text>
        <TouchableOpacity
          style={styles.addButton}
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
          style={styles.calendar}
        />
      )}
      
      <View style={styles.timeGridContainer}>
        <Text style={styles.timeGridTitle}>Today's Schedule</Text>
        <ScrollView style={styles.timeGridScroll}>
          {getTasksForDate(selectedDate).map(task => (
            <View key={task.id} style={styles.timeGridItem}>
              <Text style={styles.timeGridTime}>
                {task.startTime || 'All day'}
              </Text>
              <Text style={styles.timeGridTitle}>
                {task.title}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderTaskListPanel = () => (
    <View style={styles.taskListPanel}>
      <View style={styles.taskListHeader}>
        <Text style={styles.panelTitle}>
          Tasks for {getRelativeDateText(selectedDate)}
        </Text>
        <Text style={styles.taskCount}>
          {getTasksForDate(selectedDate).length} tasks
        </Text>
      </View>
      
      <FlatList
        data={getTasksForDate(selectedDate)}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No tasks scheduled for this date</Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => {
                console.log('Add task from empty state');
              }}
            >
              <Text style={styles.emptyAddButtonText}>Add Task</Text>
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
        <View style={styles.fullWidthContainer}>
          {renderTaskListPanel()}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: getResponsiveValue(10, 16),
    padding: 8,
  },
  calendarPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: getOptimalTabletMargins(),
    padding: getTabletContentPadding(),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveValue(12, 16),
  },
  panelTitle: {
    fontSize: getResponsiveFontSize(18, 24),
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    padding: 8,
  },
  calendar: {
    borderRadius: 8,
    marginBottom: getResponsiveValue(12, 16),
  },
  timeGridContainer: {
    flex: 1,
  },
  timeGridTitle: {
    fontSize: getResponsiveFontSize(16, 20),
    fontWeight: '600',
    marginBottom: getResponsiveValue(8, 12),
    color: theme.colors.text.primary,
  },
  timeGridScroll: {
    flex: 1,
  },
  timeGridItem: {
    flexDirection: 'row',
    padding: getResponsiveValue(8, 12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeGridTime: {
    fontSize: getResponsiveFontSize(12, 16),
    color: theme.colors.text.secondary,
    width: 60,
  },
  taskListPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: getOptimalTabletMargins(),
    padding: getTabletContentPadding(),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveValue(12, 16),
  },
  taskCount: {
    fontSize: getResponsiveFontSize(14, 18),
    color: theme.colors.text.secondary,
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: 20,
  },
  taskItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: getResponsiveValue(12, 16),
    marginBottom: getResponsiveValue(8, 12),
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  taskHeader: {
    marginBottom: getResponsiveValue(4, 6),
  },
  taskTitle: {
    fontSize: getResponsiveFontSize(16, 20),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: getResponsiveValue(4, 6),
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTime: {
    fontSize: getResponsiveFontSize(12, 16),
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  taskGoal: {
    fontSize: getResponsiveFontSize(12, 16),
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  taskDescription: {
    fontSize: getResponsiveFontSize(14, 18),
    color: theme.colors.text.secondary,
    marginBottom: getResponsiveValue(8, 12),
    lineHeight: getResponsiveFontSize(18, 22),
  },
  taskStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: getResponsiveValue(6, 8),
  },
  statusText: {
    fontSize: getResponsiveFontSize(12, 16),
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveValue(40, 60),
  },
  emptyText: {
    fontSize: getResponsiveFontSize(16, 20),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: getResponsiveValue(12, 16),
    marginBottom: getResponsiveValue(20, 24),
  },
  emptyAddButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: getResponsiveValue(20, 24),
    paddingVertical: getResponsiveValue(10, 12),
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: getResponsiveFontSize(14, 18),
    fontWeight: '600',
  },
  fullWidthContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
}); 