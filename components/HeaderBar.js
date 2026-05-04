import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const HeaderBar = ({
  title,
  subtitle = null,
  onBack = null,
  rightAction = null,
  rightIcon = null,
  onRightPress = null,
  transparent = false,
}) => {
  return (
    <View
      className={`flex-row items-center px-4 py-4 ${transparent ? '' : 'bg-white border-b border-gray-100'}`}
      style={
        !transparent
          ? {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 3,
            }
          : {}
      }
    >
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#1f2937" />
        </TouchableOpacity>
      )}
      <View className="flex-1">
        <Text className="text-gray-800 font-bold text-lg">{title}</Text>
        {subtitle && (
          <Text className="text-gray-500 text-xs mt-0.5">{subtitle}</Text>
        )}
      </View>
      {rightAction && (
        <TouchableOpacity
          onPress={onRightPress}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name={rightIcon || 'ellipsis-vertical'} size={20} color="#1f2937" />
        </TouchableOpacity>
      )}
    </View>
  );
};
