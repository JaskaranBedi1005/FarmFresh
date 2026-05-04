import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { DELIVERY_PERSON, ORDER_STATUS_STEPS } from '../../data/mockData';

const STATUS_TIMELINE = [
  { key: 'confirmed', label: 'Order Confirmed', icon: 'checkmark-circle', desc: 'Your order has been placed' },
  { key: 'packed', label: 'Packed & Ready', icon: 'cube', desc: 'Farmer packed your order' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'bicycle', desc: 'On the way to you' },
  { key: 'delivered', label: 'Delivered', icon: 'home', desc: 'Enjoy your fresh dairy!' },
];

export default function OrderTrackingScreen({ navigation, route }) {
  const order = route.params?.order;
  
  if (!order) return null;
  const currentStep = ORDER_STATUS_STEPS[order.status] ?? 0;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (order.status !== 'delivered') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const statusColor = {
    confirmed: '#3b82f6',
    packed: '#f59e0b',
    out_for_delivery: '#f97316',
    delivered: '#22c55e',
  }[order.status] || '#22c55e';

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 flex-row items-center border-b border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={20} color="#1f2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-800 font-bold text-xl">Track Order</Text>
          <Text className="text-gray-500 text-xs">#{order.id}</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
          <Ionicons name="share-social-outline" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Status hero card */}
        <View
          className="rounded-3xl p-6 mb-5 items-center"
          style={{ backgroundColor: statusColor }}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View className="w-24 h-24 rounded-full bg-white/25 items-center justify-center mb-4">
              <Ionicons
                name={STATUS_TIMELINE[currentStep].icon}
                size={48}
                color="white"
              />
            </View>
          </Animated.View>
          <Text className="text-white font-bold text-2xl">{STATUS_TIMELINE[currentStep].label}</Text>
          <Text className="text-white/80 text-sm mt-1">{STATUS_TIMELINE[currentStep].desc}</Text>
          <View className="bg-white/20 mt-4 px-5 py-2 rounded-full">
            <Text className="text-white font-semibold">
              {order.status === 'delivered' ? 'Delivered on ' + order.date : 'Estimated: 30-45 mins'}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View className="bg-white rounded-2xl p-5 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.07,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text className="text-gray-800 font-bold text-base mb-5">Order Timeline</Text>
          {STATUS_TIMELINE.map((step, index) => {
            const done = index <= currentStep;
            const active = index === currentStep;
            return (
              <View key={step.key} className="flex-row">
                <View className="items-center mr-4">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      done ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <Ionicons
                      name={done ? step.icon : 'ellipse-outline'}
                      size={20}
                      color={done ? 'white' : '#9ca3af'}
                    />
                  </View>
                  {index < STATUS_TIMELINE.length - 1 && (
                    <View
                      className="w-0.5 flex-1 mt-1 mb-1"
                      style={{
                        backgroundColor: index < currentStep ? '#22c55e' : '#e5e7eb',
                        minHeight: 32,
                      }}
                    />
                  )}
                </View>
                <View className={`flex-1 pb-5 ${index === STATUS_TIMELINE.length - 1 ? 'pb-0' : ''}`}>
                  <Text className={`font-semibold ${done ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.label}
                  </Text>
                  <Text className={`text-sm mt-0.5 ${active ? 'text-green-600 font-medium' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                    {active ? '⏱ In progress...' : done ? step.desc : 'Upcoming'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Delivery Person Card */}
        {(order.status === 'out_for_delivery' || order.status === 'delivered') && (
          <View className="bg-white rounded-2xl p-5 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.07,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            <Text className="text-gray-800 font-bold text-base mb-4">🚴 Delivery Partner</Text>
            <View className="flex-row items-center">
              <Image
                source={{ uri: DELIVERY_PERSON.avatar }}
                className="w-16 h-16 rounded-full"
              />
              <View className="flex-1 ml-4">
                <Text className="text-gray-800 font-bold text-lg">{DELIVERY_PERSON.name}</Text>
                <Text className="text-gray-500 text-sm">{DELIVERY_PERSON.vehicle}</Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="star" size={13} color="#f59e0b" />
                  <Text className="text-gray-600 font-semibold ml-1 text-sm">{DELIVERY_PERSON.rating}</Text>
                </View>
              </View>
              <TouchableOpacity
                className="w-12 h-12 rounded-full bg-green-600 items-center justify-center"
              >
                <Ionicons name="call" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Order Details */}
        <View className="bg-white rounded-2xl p-5 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.07,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text className="text-gray-800 font-bold text-base mb-4">📦 Order Details</Text>
          {(order.products || []).map((item, i) => (
            <View key={i} className="flex-row justify-between mb-2">
              <Text className="text-gray-600 text-sm">{item.name} × {item.quantity}</Text>
              <Text className="text-gray-800 font-semibold text-sm">₹{item.price * item.quantity}</Text>
            </View>
          ))}
          <View className="h-px bg-gray-100 my-3" />
          <View className="flex-row justify-between">
            <Text className="text-gray-600">📍 Delivering to</Text>
            <Text className="text-gray-800 font-semibold text-sm flex-1 text-right ml-4" numberOfLines={2}>
              {order.address}
            </Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-600">💳 Payment</Text>
            <Text className="text-gray-800 font-semibold">{order.paymentMode}</Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-800 font-bold">Total Paid</Text>
            <Text className="text-green-700 font-bold text-lg">₹{order.total}</Text>
          </View>
        </View>

        {order.status === 'delivered' && (
          <PrimaryButton
            title="Rate & Review ⭐"
            onPress={() => {}}
            variant="outline"
          />
        )}
      </ScrollView>
    </View>
  );
}
