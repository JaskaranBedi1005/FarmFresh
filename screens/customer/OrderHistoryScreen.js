import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { OrderStatusBadge } from '../../components/UIComponents';

export default function OrderHistoryScreen({ navigation }) {
  const { orders } = useApp();
  
  // Sort orders descending if needed, usually backend handles it
  const allOrders = [...(orders || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  const renderOrder = ({ item: order }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OrderTracking', { order })}
      className="bg-white rounded-2xl p-4 mb-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-800 font-bold">#{order.id}</Text>
        <OrderStatusBadge status={order.status} />
      </View>
      <Text className="text-gray-500 text-sm" numberOfLines={1}>
        {order.products?.map((p) => p.name).join(', ')}
      </Text>
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-gray-400 text-xs">{order.date}</Text>
        <Text className="text-green-700 font-bold">₹{order.total}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="pt-12 pb-4 px-5 bg-white flex-row items-center border-b border-gray-100 shadow-sm">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Order History</Text>
      </View>

      <FlatList
        data={allOrders}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4 text-base">You haven't placed any orders yet.</Text>
          </View>
        }
      />
    </View>
  );
}
