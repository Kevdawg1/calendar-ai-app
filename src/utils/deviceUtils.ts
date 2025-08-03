import { Dimensions, Platform } from 'react-native';

// Get the actual screen dimensions
let { width, height } = Dimensions.get('window');

// State to track orientation changes
let currentOrientation = width > height ? 'landscape' : 'portrait';
let orientationChangeCallbacks: (() => void)[] = [];

// Listen for screen dimension changes
Dimensions.addEventListener('change', ({ window }) => {
  const newWidth = window.width;
  const newHeight = window.height;
  const newOrientation = newWidth > newHeight ? 'landscape' : 'portrait';
  
  // Update dimensions
  width = newWidth;
  height = newHeight;
  
  // Check if orientation actually changed
  if (newOrientation !== currentOrientation) {
    currentOrientation = newOrientation;
    console.log('Orientation changed:', { 
      from: currentOrientation === 'landscape' ? 'portrait' : 'landscape', 
      to: currentOrientation,
      dimensions: { width, height }
    });
    
    // Notify all registered callbacks
    orientationChangeCallbacks.forEach(callback => callback());
  }
  
  console.log('Screen dimensions changed:', { width, height });
});

// Function to register orientation change callbacks
export const addOrientationChangeListener = (callback: () => void) => {
  orientationChangeCallbacks.push(callback);
  
  // Return cleanup function
  return () => {
    const index = orientationChangeCallbacks.indexOf(callback);
    if (index > -1) {
      orientationChangeCallbacks.splice(index, 1);
    }
  };
};

// Function to get current orientation
export const getCurrentOrientation = () => currentOrientation;

// Force screen dimensions for tablets if detection is wrong
const getActualScreenDimensions = () => {
  const deviceInfo = getDeviceInfo();
  
  // If we detect it's a tablet but the dimensions are phone-like, 
  // use the physical screen dimensions
  if (deviceInfo.isTablet && (width < 600 || height < 600)) {
    // For Android tablets, try to get the real dimensions
    if (Platform.OS === 'android') {
      // Use a reasonable tablet size if detection fails
      return { width: 1920, height: 1200 };
    }
  }
  
  return { width, height };
};

// Force tablet dimensions based on device characteristics
const forceTabletDimensions = () => {
  // Check if this looks like a tablet based on various indicators
  const isLikelyTablet = 
    Platform.OS === 'android' && 
    (width >= 800 || height >= 800 || width * height >= 600000);
  
  if (isLikelyTablet) {
    // Force tablet dimensions
    return { width: 1920, height: 1200 };
  }
  
  return { width, height };
};

export interface DeviceInfo {
  isTablet: boolean;
  isPhone: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  platform: 'ios' | 'android' | 'web';
}

export const getDeviceInfo = (): DeviceInfo => {
  const screenWidth = Math.min(width, height);
  const screenHeight = Math.max(width, height);
  const orientation = width > height ? 'landscape' : 'portrait';
  
  // Enhanced tablet detection logic - only consider it a tablet in landscape
  let isTablet = false;
  
  if (Platform.OS === 'ios') {
    // iOS tablet detection - only in landscape
    if (orientation === 'landscape') {
      isTablet = screenWidth >= 768;
    }
  } else if (Platform.OS === 'android') {
    // Android tablet detection - only in landscape
    if (orientation === 'landscape') {
      const screenArea = width * height;
      
      // Multiple detection methods for Android tablets in landscape
      isTablet = 
        screenWidth >= 600 || 
        screenHeight >= 600 || 
        screenArea >= 600000 || // Area-based detection for high-res devices
        width >= 1000 || // Force tablet for wide screens
        height >= 1000 || // Force tablet for tall screens
        screenArea >= 400000; // Lower threshold for tablet detection
      
      // Additional check for very high resolution devices
      if (width >= 2000 || height >= 2000) {
        isTablet = true;
      }
      
      // Force tablet detection for Android if dimensions suggest it
      if (width >= 800 || height >= 800) {
        isTablet = true;
      }
      
      // Force tablet detection for Android tablets regardless of detected dimensions
      if (screenArea >= 400000) { // 400k pixels is roughly tablet territory
        isTablet = true;
      }
      
      // Special case: if the device is reporting phone dimensions but has large area
      // This handles the case where your tablet reports 576x768 but should be 2560x1600
      if (screenArea >= 300000 && (width >= 500 || height >= 500)) {
        isTablet = true;
      }
    }
  } else {
    // Web or other platforms - only in landscape
    if (orientation === 'landscape') {
      isTablet = screenWidth >= 768;
    }
  }
  
  return {
    isTablet,
    isPhone: !isTablet,
    screenWidth,
    screenHeight,
    orientation,
    platform: Platform.OS as 'ios' | 'android' | 'web'
  };
};

export const isTablet = (): boolean => getDeviceInfo().isTablet;

export const isPhone = (): boolean => getDeviceInfo().isPhone;

// New function to check if we should use tablet layout (tablet + landscape)
export const shouldUseTabletLayout = (): boolean => {
  const deviceInfo = getDeviceInfo();
  return deviceInfo.isTablet && deviceInfo.orientation === 'landscape';
};

export const getResponsiveValue = <T>(
  phoneValue: T,
  tabletValue: T
): T => {
  return shouldUseTabletLayout() ? tabletValue : phoneValue;
};

export const getResponsivePadding = () => {
  return getResponsiveValue(16, 24);
};

export const getResponsiveMargin = () => {
  return getResponsiveValue(8, 16);
};

export const getResponsiveFontSize = (phoneSize: number, tabletSize: number) => {
  return getResponsiveValue(phoneSize, tabletSize);
};

export const getResponsiveIconSize = (phoneSize: number, tabletSize: number) => {
  return getResponsiveValue(phoneSize, tabletSize);
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  phone: 600,
  tablet: 768,
  largeTablet: 1024,
  desktop: 1200
};

export const getBreakpoint = () => {
  const { screenWidth } = getDeviceInfo();
  
  if (screenWidth >= BREAKPOINTS.desktop) return 'desktop';
  if (screenWidth >= BREAKPOINTS.largeTablet) return 'largeTablet';
  if (screenWidth >= BREAKPOINTS.tablet) return 'tablet';
  return 'phone';
};

// New utilities for better tablet space utilization
export const getFullScreenWidth = (): number => {
  const actualDimensions = getActualScreenDimensions();
  const forcedDimensions = forceTabletDimensions();
  
  // Use the larger of the two
  return Math.max(actualDimensions.width, forcedDimensions.width);
};

export const getFullScreenHeight = (): number => {
  const actualDimensions = getActualScreenDimensions();
  const forcedDimensions = forceTabletDimensions();
  
  // Use the larger of the two
  return Math.max(actualDimensions.height, forcedDimensions.height);
};

export const getTabletLayoutWidth = (): number => {
  const deviceInfo = getDeviceInfo();
  const actualWidth = getFullScreenWidth();
  
  if (!shouldUseTabletLayout()) return actualWidth;
  
  // For tablets, use the full width minus minimal margins
  return actualWidth - 32; // 16px margin on each side
};

export const getTabletPanelWidth = (ratio: number): number => {
  const layoutWidth = getTabletLayoutWidth();
  return layoutWidth * ratio;
};

export const getOptimalTabletMargins = () => {
  if (!shouldUseTabletLayout()) return 16;
  
  // For tablets, use smaller margins to maximize content area
  return 12;
};

export const getTabletContentPadding = () => {
  if (!shouldUseTabletLayout()) return 16;
  
  // For tablets, use smaller padding to fit more content
  return 12;
};

// Calculate optimal layout ratios based on screen size
export const getOptimalLayoutRatios = () => {
  const screenWidth = getFullScreenWidth();
  
  if (!shouldUseTabletLayout()) {
    return {
      calendar: { left: 0.6, right: 0.4 },
      goals: { left: 0.4, right: 0.6 },
      lifeAdmin: { left: 0.25, center: 0.45, right: 0.3 }
    };
  }
  
  // For larger tablets, adjust ratios to use more space
  if (screenWidth >= 1024) {
    return {
      calendar: { left: 0.33, right: 0.67 },
      goals: { left: 0.45, right: 0.55 },
      lifeAdmin: { left: 0.2, center: 0.5, right: 0.3 }
    };
  }
  
  // For medium tablets
  return {
    calendar: { left: 0.33, right: 0.67 },
    goals: { left: 0.45, right: 0.55 },
    lifeAdmin: { left: 0.25, center: 0.45, right: 0.3 }
  };
};

// Force landscape orientation for tablets
export const shouldForceLandscape = (): boolean => {
  const deviceInfo = getDeviceInfo();
  return deviceInfo.isTablet && deviceInfo.platform === 'android';
};

// Debug function to help verify tablet detection
export const debugDeviceInfo = () => {
  const info = getDeviceInfo();
  const actualDimensions = getActualScreenDimensions();
  const forcedDimensions = forceTabletDimensions();
  
  console.log('=== Device Info Debug ===');
  console.log('Raw Dimensions:', { width, height });
  console.log('Actual Dimensions:', actualDimensions);
  console.log('Forced Dimensions:', forcedDimensions);
  console.log('Final Full Width:', getFullScreenWidth());
  console.log('Final Full Height:', getFullScreenHeight());
  console.log('Platform:', info.platform);
  console.log('Orientation:', info.orientation);
  console.log('Is Tablet:', info.isTablet);
  console.log('Is Phone:', info.isPhone);
  console.log('Should Use Tablet Layout:', shouldUseTabletLayout());
  console.log('Screen Width:', info.screenWidth);
  console.log('Screen Height:', info.screenHeight);
  console.log('Breakpoint:', getBreakpoint());
  console.log('Tablet Layout Width:', getTabletLayoutWidth());
  console.log('Optimal Margins:', getOptimalTabletMargins());
  console.log('Screen Area:', width * height);
  console.log('Should Force Landscape:', shouldForceLandscape());
  console.log('========================');
  return info;
}; 