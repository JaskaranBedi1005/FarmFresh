import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const EmptyState = ({
  icon = 'cube-outline',
  title = 'Nothing here yet',
  subtitle = 'Check back later',
}) => {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-24 h-24 rounded-full bg-green-50 items-center justify-center mb-4">
        <Ionicons name={icon} size={44} color="#22c55e" />
      </View>
      <Text className="text-gray-800 font-bold text-xl text-center">{title}</Text>
      <Text className="text-gray-500 text-base text-center mt-2">{subtitle}</Text>
    </View>
  );
};

export const OrderStatusBadge = ({ status }) => {
  const configs = {
    confirmed: { label: 'Confirmed', bg: 'bg-blue-100', textColor: '#1d4ed8', icon: 'checkmark-circle-outline' },
    packed: { label: 'Packed', bg: 'bg-amber-100', textColor: '#b45309', icon: 'cube-outline' },
    out_for_delivery: { label: 'On the way', bg: 'bg-orange-100', textColor: '#c2410c', icon: 'car-outline' },
    delivered: { label: 'Delivered', bg: 'bg-green-100', textColor: '#16a34a', icon: 'checkmark-done-circle-outline' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-100', textColor: '#dc2626', icon: 'close-circle-outline' },
    pending: { label: 'Pending', bg: 'bg-gray-100', textColor: '#6b7280', icon: 'time-outline' },
  };

  const cfg = configs[status] || configs.pending;

  return (
    <View className={`flex-row items-center ${cfg.bg} px-3 py-1.5 rounded-full`}>
      <Ionicons name={cfg.icon} size={13} color={cfg.textColor} />
      <Text className="text-xs font-bold ml-1" style={{ color: cfg.textColor }}>{cfg.label}</Text>
    </View>
  );
};

export const SkeletonLoader = ({ width = '100%', height = 20, rounded = false, style = '' }) => {
  return (
    <View
      className={`bg-gray-200 ${rounded ? 'rounded-full' : 'rounded-lg'} ${style}`}
      style={{ width, height }}
    />
  );
};

export const ToastMessage = ({ toast }) => {
  if (!toast) return null;

  const configs = {
    success: { bg: 'bg-green-600', icon: 'checkmark-circle-outline' },
    error: { bg: 'bg-red-500', icon: 'close-circle-outline' },
    info: { bg: 'bg-blue-500', icon: 'information-circle-outline' },
  };

  const cfg = configs[toast.type] || configs.success;

  return (
    <View
      className={`absolute bottom-24 left-4 right-4 ${cfg.bg} rounded-2xl px-4 py-4 flex-row items-center z-50`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      <Ionicons name={cfg.icon} size={22} color="white" />
      <Text className="text-white font-semibold ml-3 flex-1">{toast.message}</Text>
    </View>
  );
};
