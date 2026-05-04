import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { OrderStatusBadge } from '../../components/UIComponents';
const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI Payment', icon: 'qr-code-outline', desc: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline', desc: 'Visa, Mastercard, Rupay' },
  { id: 'cash', label: 'Cash on Delivery', icon: 'cash-outline', desc: 'Pay when delivered' },
];

export default function CustomerProfileScreen({ navigation }) {
  const { currentUser, logout, orders } = useApp();
  const allOrders = orders || [];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" backgroundColor="#16a34a" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header / Profile Hero */}
        <View className="bg-green-600 pt-12 pb-8 px-5">
          <Text className="text-green-200 text-sm font-medium mb-5">My Profile</Text>
          <View className="flex-row items-center">
            <View className="relative">
              <Image
                source={{ uri: currentUser?.avatar || 'https://i.pravatar.cc/150?img=33' }}
                className="w-20 h-20 rounded-full border-3 border-white"
              />
              <TouchableOpacity className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full items-center justify-center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="camera" size={14} color="#16a34a" />
              </TouchableOpacity>
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-white font-bold text-2xl">{currentUser?.name || 'Arjun Sharma'}</Text>
              <Text className="text-green-200 text-sm mt-0.5">{currentUser?.phone || '+91 98765 11111'}</Text>
              <Text className="text-green-200 text-sm">{currentUser?.email || 'arjun@example.com'}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('EditProfile')}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons name="create-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="flex-row mt-6 bg-white/15 rounded-2xl p-4 space-x-4">
            {[
              { label: 'Orders', value: allOrders.length },
              { label: 'Delivered', value: allOrders.filter((o) => o.status === 'delivered').length },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <View className="w-px bg-white/30" />}
                <View className="flex-1 items-center">
                  <Text className="text-white font-bold text-2xl">{stat.value}</Text>
                  <Text className="text-green-200 text-xs mt-0.5">{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View className="px-5 mt-5">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-800 font-bold text-base">Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')}>
              <Text className="text-green-600 font-semibold text-sm">View all</Text>
            </TouchableOpacity>
          </View>

          {allOrders.slice(0, 2).map((order) => (
            <TouchableOpacity
              key={order.id}
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
          ))}
        </View>

        {/* My Addresses */}
        <View className="px-5 mt-5">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-800 font-bold text-base">My Addresses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddAddress')}>
              <Text className="text-green-600 font-semibold text-sm">+ Add New</Text>
            </TouchableOpacity>
          </View>
          
          {currentUser?.savedAddresses?.length > 0 ? (
            currentUser.savedAddresses.map((addr) => (
              <View 
                key={addr.id}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 5,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center mb-1">
                  <Ionicons name="location" size={16} color="#16a34a" />
                  <Text className="text-gray-800 font-bold ml-2">{addr.label}</Text>
                </View>
                <Text className="text-gray-500 text-sm ml-6 leading-5">{addr.address}</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 text-sm italic bg-white p-4 rounded-2xl text-center border border-gray-100">No saved addresses yet.</Text>
          )}
        </View>

        {/* Payment Methods */}
        <View className="px-5 mt-4">
          <Text className="text-gray-800 font-bold text-base mb-3">Payment Methods</Text>
          <View className="bg-white rounded-2xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.07,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            {PAYMENT_METHODS.map((pm, i) => (
              <View
                key={pm.id}
                className={`flex-row items-center px-5 py-4 ${i < PAYMENT_METHODS.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center mr-4">
                  <Ionicons name={pm.icon} size={20} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 font-bold">{pm.label}</Text>
                  <Text className="text-gray-400 text-xs mt-0.5">{pm.desc}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              </View>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 border-2 border-red-100 rounded-2xl py-4 flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="text-red-500 font-bold ml-2">Logout</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-gray-300 text-xs mt-6">FarmFresh v1.0.0 · Made with ❤️</Text>
      </ScrollView>
    </View>
  );
}
