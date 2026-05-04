import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const FarmerCard = ({ farmer, onPress, compact = false }) => {
  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-2xl p-3 mr-3 w-40"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 4,
        }}
        activeOpacity={0.9}
      >
        <View className="items-center">
          <View className="relative">
            <Image
              source={{ uri: farmer.avatar }}
              className="w-16 h-16 rounded-full"
            />
            {farmer.verified && (
              <View className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
            )}
          </View>
          <Text className="text-gray-800 font-bold text-sm mt-2 text-center" numberOfLines={1}>
            {farmer.name}
          </Text>
          <Text className="text-gray-500 text-xs text-center" numberOfLines={1}>
            {farmer.location}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="star" size={11} color="#f59e0b" />
            <Text className="text-gray-700 text-xs font-semibold ml-1">{farmer.rating}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
      }}
      activeOpacity={0.9}
    >
      <View className="flex-row items-center">
        <View className="relative">
          <Image
            source={{ uri: farmer.avatar }}
            className="w-16 h-16 rounded-full"
          />
          {farmer.verified && (
            <View className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={12} color="white" />
            </View>
          )}
        </View>
        <View className="flex-1 ml-4">
          <View className="flex-row items-center">
            <Text className="text-gray-800 font-bold text-base">{farmer.name}</Text>
            {farmer.verified && (
              <View className="ml-2 bg-green-100 px-2 py-0.5 rounded-full">
                <Text className="text-green-700 text-xs font-semibold">Verified</Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center mt-1">
            <Ionicons name="location-outline" size={13} color="#6b7280" />
            <Text className="text-gray-500 text-xs ml-1">{farmer.location}</Text>
          </View>
          <View className="flex-row items-center mt-1.5 space-x-3">
            <View className="flex-row items-center">
              <Ionicons name="star" size={13} color="#f59e0b" />
              <Text className="text-gray-700 text-xs font-semibold ml-1">{farmer.rating}</Text>
              <Text className="text-gray-400 text-xs"> ({farmer.reviews})</Text>
            </View>
            <View className="w-1 h-1 bg-gray-300 rounded-full" />
            <Text className="text-gray-500 text-xs">{farmer.totalProducts} products</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
};
