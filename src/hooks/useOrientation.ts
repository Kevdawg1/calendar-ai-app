import { useState, useEffect } from 'react';
import { addOrientationChangeListener, getCurrentOrientation, shouldUseTabletLayout } from '../utils/deviceUtils';

export const useOrientation = () => {
  const [orientation, setOrientation] = useState(getCurrentOrientation());
  const [shouldUseTablet, setShouldUseTablet] = useState(shouldUseTabletLayout());

  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = getCurrentOrientation();
      const newShouldUseTablet = shouldUseTabletLayout();
      
      console.log('useOrientation: Orientation changed to', newOrientation);
      console.log('useOrientation: Should use tablet layout:', newShouldUseTablet);
      
      setOrientation(newOrientation);
      setShouldUseTablet(newShouldUseTablet);
    };

    // Register the callback
    const cleanup = addOrientationChangeListener(handleOrientationChange);

    // Return cleanup function
    return cleanup;
  }, []);

  return {
    orientation,
    shouldUseTablet,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait'
  };
}; 