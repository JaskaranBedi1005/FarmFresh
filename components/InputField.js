import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const InputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  icon = null,
  error = null,
  multiline = false,
  numberOfLines = 1,
  style = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View className={`mb-4 ${style}`}>
      {label && (
        <Text className="text-gray-700 font-semibold mb-1.5 text-sm">{label}</Text>
      )}
      <View
        className={`flex-row items-center bg-white rounded-2xl px-4 py-0 border-2 ${
          focused ? 'border-green-500' : error ? 'border-red-400' : 'border-gray-100'
        }`}
        style={{
          shadowColor: focused ? '#22c55e' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: focused ? 0.15 : 0.05,
          shadowRadius: 8,
          elevation: focused ? 4 : 2,
        }}
      >
        {icon && (
          <View className="mr-3">
            <Ionicons name={icon} size={20} color={focused ? '#16a34a' : '#9ca3af'} />
          </View>
        )}
        <TextInput
          className={`flex-1 text-gray-800 text-base font-medium ${multiline ? 'py-3' : 'h-14'}`}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!!(secureTextEntry && !showPassword)}
          keyboardType={keyboardType}
          multiline={!!multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>}
    </View>
  );
};
