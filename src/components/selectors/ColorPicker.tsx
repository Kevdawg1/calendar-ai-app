import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  colors?: string[];
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
  colors = ['#007AFF', '#FF9500', '#34C759', '#AF52DE', '#FF2D55', '#5AC8FA', '#FFD60A']
}) => {
  return (
    <View style={{ flexDirection: 'row', marginVertical: 8 }}>
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: color,
            marginHorizontal: 6,
            borderWidth: selectedColor === color ? 3 : 1,
            borderColor: selectedColor === color ? theme.colors.primary : '#ccc',
          }}
          onPress={() => onColorSelect(color)}
        />
      ))}
    </View>
  );
}; 