import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const CategoryChip = ({ category, selected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-4 py-2 rounded-full mr-2 border-2 ${
        selected
          ? 'bg-green-600 border-green-600'
          : 'bg-white border-gray-100'
      }`}
      style={{
        shadowColor: selected ? '#22c55e' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: selected ? 0.3 : 0.06,
        shadowRadius: 6,
        elevation: selected ? 4 : 2,
      }}
      activeOpacity={0.85}
    >
      <Ionicons
        name={category.icon || 'grid-outline'}
        size={14}
        color={selected ? '#ffffff' : '#6b7280'}
        style={{ marginRight: 6 }}
      />
      <Text
        className={`font-semibold text-sm ${
          selected ? 'text-white' : 'text-gray-600'
        }`}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );
};
