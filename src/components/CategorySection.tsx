import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { theme } from '../theme';
import { sharedStyles } from '../theme/styles';

interface CategorySectionProps {
  category: string;
  isExpanded: boolean;
  isAllSelected: boolean;
  onToggle: (category: string) => void;
  onToggleAll: (category: string) => void;
  children: React.ReactNode;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  isExpanded,
  isAllSelected,
  onToggle,
  onToggleAll,
  children,
}) => {
  return (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        style={sharedStyles.card}
        onPress={() => onToggle(category)}
      >
        <View style={sharedStyles.cardHeader}>
          <View style={sharedStyles.cardContentRow}>
            <Checkbox
              value={isAllSelected}
              onValueChange={() => onToggleAll(category)}
              color={theme.colors.primary}
            />
            <Text style={sharedStyles.cardTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.text.primary}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.tasksContainer}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginBottom: theme.spacing.md,
  },
  tasksContainer: {
    marginTop: theme.spacing.sm,
  },
}); 