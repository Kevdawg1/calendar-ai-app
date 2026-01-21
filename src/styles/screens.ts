import { StyleSheet } from 'react-native';
import { theme } from '../theme';
import { 
  getResponsiveValue, 
  getResponsiveFontSize,
  getResponsiveIconSize,
  getOptimalTabletMargins,
  getTabletContentPadding
} from '../utils/deviceUtils';

export const calendarScreenStyles = StyleSheet.create({
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

export const calendarScreenTabletStyles = StyleSheet.create({
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

export const goalsScreenTabletStyles = StyleSheet.create({
  formPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: getResponsiveValue(8, 12),
    padding: getResponsiveValue(12, 16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 0,
    maxWidth: '100%',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveValue(16, 20),
  },
  panelTitle: {
    fontSize: getResponsiveFontSize(18, 22),
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  infoButton: {
    padding: 4,
  },
  timeBalanceContainer: {
    marginTop: getResponsiveValue(16, 20),
  },
  listPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: getResponsiveValue(8, 12),
    padding: getResponsiveValue(12, 16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveValue(16, 20),
  },
  goalCount: {
    fontSize: getResponsiveFontSize(14, 16),
    color: theme.colors.text.secondary,
  },
  goalList: {
    flex: 1,
  },
  goalListContent: {
    paddingBottom: 20,
  },
});

export const homeScreenStyles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gridItemText: {
    color: '#fff',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});

export const homeScreenTabletStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: getOptimalTabletMargins(),
    paddingVertical: getTabletContentPadding(),
  },
  header: {
    alignItems: 'center',
    marginBottom: getResponsiveValue(32, 48),
    paddingTop: getResponsiveValue(20, 32),
  },
  title: {
    fontSize: getResponsiveFontSize(28, 36),
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: getResponsiveValue(8, 12),
  },
  subtitle: {
    fontSize: getResponsiveFontSize(16, 20),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: getResponsiveFontSize(22, 28),
    maxWidth: 600,
  },
  menuContainer: {
    marginBottom: getResponsiveValue(32, 48),
  },
  menuItem: {
    borderRadius: 16,
    marginBottom: getResponsiveValue(16, 20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveValue(20, 28),
  },
  iconContainer: {
    width: getResponsiveValue(60, 80),
    height: getResponsiveValue(60, 80),
    borderRadius: getResponsiveValue(30, 40),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveValue(16, 20),
  },
  textContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: getResponsiveFontSize(20, 24),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: getResponsiveValue(4, 6),
  },
  menuItemSubtitle: {
    fontSize: getResponsiveFontSize(14, 16),
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: getResponsiveFontSize(18, 20),
  },
  arrow: {
    opacity: 0.8,
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: getResponsiveValue(20, 24),
    marginTop: getResponsiveValue(16, 20),
  },
  infoTitle: {
    fontSize: getResponsiveFontSize(18, 20),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: getResponsiveValue(8, 12),
  },
  infoText: {
    fontSize: getResponsiveFontSize(14, 16),
    color: theme.colors.text.secondary,
    lineHeight: getResponsiveFontSize(20, 22),
  },
  tabletIndicator: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: getResponsiveValue(12, 16),
    paddingVertical: getResponsiveValue(6, 8),
    borderRadius: 20,
    marginTop: getResponsiveValue(8, 12),
  },
  tabletIndicatorText: {
    color: '#fff',
    fontSize: getResponsiveFontSize(12, 14),
    fontWeight: '600',
  },
});

export const lifeAdminScreenTabletStyles = StyleSheet.create({
  column: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: getResponsiveValue(8, 12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getResponsiveValue(12, 16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  columnTitle: {
    fontSize: getResponsiveFontSize(16, 18),
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  selectedCount: {
    fontSize: getResponsiveFontSize(12, 14),
    color: theme.colors.text.secondary,
  },
  collapseButton: {
    padding: 4,
  },
  selectAllButton: {
    padding: 4,
  },
  selectAllText: {
    fontSize: getResponsiveFontSize(12, 14),
    color: theme.colors.primary,
    fontWeight: '500',
  },
  columnContent: {
    flex: 1,
    padding: getResponsiveValue(8, 12),
  },
  categoryItem: {
    padding: getResponsiveValue(12, 16),
    borderRadius: 8,
    marginBottom: getResponsiveValue(4, 6),
    backgroundColor: '#f8f9fa',
  },
  selectedCategoryItem: {
    backgroundColor: theme.colors.primary + '20',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveValue(4, 6),
  },
  categoryName: {
    fontSize: getResponsiveFontSize(14, 16),
    fontWeight: '600',
    color: theme.colors.text.primary,
    textTransform: 'capitalize',
  },
  categoryCount: {
    fontSize: getResponsiveFontSize(12, 14),
    color: theme.colors.text.secondary,
  },
  taskItem: {
    padding: getResponsiveValue(12, 16),
    borderRadius: 8,
    marginBottom: getResponsiveValue(4, 6),
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedTaskItem: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  scheduledTaskItem: {
    backgroundColor: theme.colors.success + '20',
    borderColor: theme.colors.success,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: getResponsiveValue(4, 6),
  },
  taskTitle: {
    fontSize: getResponsiveFontSize(14, 16),
    fontWeight: '500',
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: getResponsiveValue(8, 12),
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskFrequency: {
    fontSize: getResponsiveFontSize(12, 14),
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  taskCategory: {
    fontSize: getResponsiveFontSize(12, 14),
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
    marginBottom: getResponsiveValue(2, 4),
  },
  frequencyButton: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveValue(40, 60),
  },
  emptyText: {
    fontSize: getResponsiveFontSize(14, 16),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: getResponsiveValue(8, 12),
  },
  actionPanel: {
    padding: getResponsiveValue(12, 16),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  scheduleButton: {
    marginBottom: getResponsiveValue(8, 12),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: getResponsiveFontSize(12, 14),
    color: theme.colors.text.secondary,
    marginLeft: getResponsiveValue(8, 12),
  },
});

export const settingsScreenStyles = StyleSheet.create({
  dangerZone: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  dangerZoneTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.danger,
    marginBottom: theme.spacing.sm,
  },
  dangerZoneDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  resetButton: {
    backgroundColor: theme.colors.danger,
  },
  versionContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  versionText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export const welcomeScreenStyles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  welcomeImage: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.lg,
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    paddingBottom: theme.spacing.xl,
  },
  getStartedButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
});
