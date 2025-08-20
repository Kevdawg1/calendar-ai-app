# ExpandableFab Component

## Overview

The `ExpandableFab` component is a floating action button that expands vertically to show multiple action options. It's designed to replace the overlapping FAB buttons with a clean, animated interface.

## Features

### 🎯 **Smooth Animations**
- Spring-based animations for natural feel
- Rotation animation for the main button (45° when expanded)
- Staggered opacity and translation animations for expandable buttons
- Smooth collapse/expand transitions

### 🎨 **Visual Design**
- Main button: Large circular button with primary color
- Meeting button: Blue button with people icon
- Task button: Green button with add-circle icon
- Shadow effects for depth
- Proper spacing and sizing

### ♿ **Accessibility**
- Proper accessibility labels for all buttons
- Accessibility roles defined
- Screen reader friendly

### 📱 **User Experience**
- Backdrop overlay when expanded (tappable to close)
- Proper touch feedback with activeOpacity
- Auto-collapse when an action is selected
- Smooth timing for modal transitions

## Usage

```tsx
import { ExpandableFab } from '../components/ExpandableFab';

function MyScreen() {
  const handleAddTask = () => {
    // Open task modal
    setIsAddTaskModalVisible(true);
  };

  const handleAddMeeting = () => {
    // Open meeting modal
    setIsAddMeetingModalVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Your screen content */}
      
      <ExpandableFab
        onAddTask={handleAddTask}
        onAddMeeting={handleAddMeeting}
      />
    </View>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onAddTask` | `() => void` | Yes | Callback when task button is pressed |
| `onAddMeeting` | `() => void` | Yes | Callback when meeting button is pressed |

## Animation Details

### Main Button
- **Rotation**: 0° → 45° when expanded
- **Animation**: Spring with tension: 120, friction: 10

### Expandable Buttons
- **Meeting Button**: 
  - Translation: 0 → -80px (farthest)
  - Opacity: 0 → 1 (staggered)
- **Task Button**:
  - Translation: 0 → -40px (closer)
  - Opacity: 0 → 1 (staggered)

### Timing
- Expandable buttons appear with staggered timing
- 150ms delay before opening modals (allows animation to complete)
- Backdrop appears immediately when expanded

## Styling

### Colors
- **Main Button**: `theme.colors.primary` (blue)
- **Meeting Button**: `theme.colors.info` (light blue)
- **Task Button**: `theme.colors.secondary` (green)

### Sizes
- **Main Button**: 64x64px
- **Expandable Buttons**: 120x48px
- **Icons**: 20px for expandable, 32px for main

### Shadows
- **Main Button**: Larger shadow for prominence
- **Expandable Buttons**: Smaller shadow for subtlety

## Implementation Notes

### State Management
- Uses `useState` for expansion state
- Uses `useState` with `Animated.Value` for animations

### Performance
- Animations use `useNativeDriver: false` for transform animations
- Proper cleanup and timing for smooth transitions

### Touch Handling
- Backdrop closes the menu when tapped
- Each button has proper touch feedback
- Auto-collapse after action selection

## Future Enhancements

1. **More Actions**: Support for additional expandable buttons
2. **Custom Icons**: Allow custom icons for each action
3. **Different Directions**: Support for horizontal expansion
4. **Haptic Feedback**: Add haptic feedback for interactions
5. **Theme Support**: Better theme integration and customization 