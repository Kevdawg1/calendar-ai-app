import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface InfoButtonProps {
  onPress: () => void;
  size?: number;
  color?: string;
}

export const InfoButton: React.FC<InfoButtonProps> = ({
  onPress,
  size = 20,
  color = theme.colors.primary
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        marginLeft: 8,
        padding: 4,
      }}
    >
      <Ionicons name="information-circle-outline" size={size} color={color} />
    </TouchableOpacity>
  );
}; 