import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { 
  getDeviceInfo, 
  getResponsiveValue, 
  getOptimalTabletMargins,
  getTabletLayoutWidth,
  getOptimalLayoutRatios
} from '../utils/deviceUtils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  style?: any;
  direction?: 'row' | 'column';
  spacing?: number;
  padding?: number;
  backgroundColor?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  style,
  direction = 'column',
  spacing = 0,
  padding = 0,
  backgroundColor
}) => {
  const deviceInfo = getDeviceInfo();
  const responsivePadding = getResponsiveValue(16, getOptimalTabletMargins());
  const responsiveSpacing = getResponsiveValue(8, 12);

  const layoutStyle = [
    styles.container,
    {
      flexDirection: deviceInfo.isTablet ? 'row' : direction,
      padding: padding || responsivePadding,
      gap: spacing || responsiveSpacing,
      backgroundColor,
      width: deviceInfo.isTablet ? getTabletLayoutWidth() : '100%',
      alignSelf: deviceInfo.isTablet ? 'center' : 'stretch',
    },
    style
  ];

  return <View style={layoutStyle}>{children}</View>;
};

interface SplitLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftRatio?: number; // Percentage of width for left panel (0-1)
  rightRatio?: number; // Percentage of width for right panel (0-1)
  style?: any;
  backgroundColor?: string;
  layoutType?: 'calendar' | 'goals' | 'custom';
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  leftPanel,
  rightPanel,
  leftRatio,
  rightRatio,
  style,
  backgroundColor,
  layoutType = 'custom'
}) => {
  const deviceInfo = getDeviceInfo();
  const optimalRatios = getOptimalLayoutRatios();
  
  // Use optimal ratios if not specified
  let finalLeftRatio = leftRatio;
  let finalRightRatio = rightRatio;
  
  if (layoutType === 'calendar') {
    finalLeftRatio = optimalRatios.calendar.left;
    finalRightRatio = optimalRatios.calendar.right;
  } else if (layoutType === 'goals') {
    finalLeftRatio = optimalRatios.goals.left;
    finalRightRatio = optimalRatios.goals.right;
  } else {
    finalLeftRatio = leftRatio || 0.5;
    finalRightRatio = rightRatio || 0.5;
  }
  
  if (!deviceInfo.isTablet) {
    // On phone, stack vertically
    return (
      <View style={[styles.splitContainer, style, { backgroundColor }]}>
        <View style={styles.fullWidth}>{leftPanel}</View>
        <View style={styles.fullWidth}>{rightPanel}</View>
      </View>
    );
  }

  // On tablet, use split layout with full width utilization
  return (
    <View style={[styles.tabletContainer, style, { backgroundColor }]}>
      <View style={[styles.tabletPanel, { flex: finalLeftRatio }]}>{leftPanel}</View>
      <View style={[styles.tabletPanel, { flex: finalRightRatio }]}>{rightPanel}</View>
    </View>
  );
};

interface ThreeColumnLayoutProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftRatio?: number;
  centerRatio?: number;
  rightRatio?: number;
  style?: any;
  backgroundColor?: string;
}

export const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({
  leftPanel,
  centerPanel,
  rightPanel,
  leftRatio,
  centerRatio,
  rightRatio,
  style,
  backgroundColor
}) => {
  const deviceInfo = getDeviceInfo();
  const optimalRatios = getOptimalLayoutRatios();
  
  // Use optimal ratios if not specified
  const finalLeftRatio = leftRatio || optimalRatios.lifeAdmin.left;
  const finalCenterRatio = centerRatio || optimalRatios.lifeAdmin.center;
  const finalRightRatio = rightRatio || optimalRatios.lifeAdmin.right;
  
  if (!deviceInfo.isTablet) {
    // On phone, stack vertically
    return (
      <View style={[styles.splitContainer, style, { backgroundColor }]}>
        <View style={styles.fullWidth}>{leftPanel}</View>
        <View style={styles.fullWidth}>{centerPanel}</View>
        <View style={styles.fullWidth}>{rightPanel}</View>
      </View>
    );
  }

  // On tablet, use three-column layout with full width utilization
  return (
    <View style={[styles.tabletContainer, style, { backgroundColor }]}>
      <View style={[styles.tabletPanel, { flex: finalLeftRatio }]}>{leftPanel}</View>
      <View style={[styles.tabletPanel, { flex: finalCenterRatio }]}>{centerPanel}</View>
      <View style={[styles.tabletPanel, { flex: finalRightRatio }]}>{rightPanel}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  tabletContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    maxWidth: '100%',
  },
  panel: {
    paddingHorizontal: 8,
  },
  tabletPanel: {
    paddingHorizontal: getOptimalTabletMargins(),
  },
  fullWidth: {
    width: '100%',
    paddingHorizontal: 16,
  },
}); 