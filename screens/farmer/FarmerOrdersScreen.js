import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatusBadge, EmptyState } from '../../components/UIComponents';
import { ordersApi } from '../../services/api';
import { useApp } from '../../context/AppContext';

const STATUS_FILTERS = ['All', 'Pending', 'Confirmed', 'Packed', 'Delivered'];

export default function FarmerOrdersScreen({ navigation }) {
  const { showToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersApi.getAll();
      setOrders(res.orders || []);
    } catch (e) {
      console.error('Fetch orders error:', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Pending') return o.status === 'confirmed';
    return o.status.toLowerCase().includes(activeFilter.toLowerCase());
  });

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Order status updated to "${newStatus.replace(/_/g, ' ')}"! ✅`);
    } catch (e) {
      showToast(e.message || 'Failed to update status', 'error');
    }
  };

  const handleAccept = (order) => {
    Alert.alert('Accept Order', `Accept order #${order.id} from ${order.customerName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept ✅', onPress: () => updateStatus(order.id, 'packed') },
    ]);
  };

  const handleReject = (order) => {
    Alert.alert('Reject Order', `Reject order #${order.id}? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject ❌', style: 'destructive', onPress: () => updateStatus(order.id, 'cancelled') },
    ]);
  };

  const getNextStatus = (status) => {
    const flow = ['confirmed', 'packed', 'out_for_delivery', 'delivered'];
    const idx = flow.indexOf(status);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const renderItem = ({ item }) => {
    const nextStatus = getNextStatus(item.status);
    return (
      <View
        className="bg-white rounded-2xl p-4 mb-3"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.07,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        {/* Top row */}
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-gray-800 font-bold text-base">#{item.id}</Text>
            <Text className="text-gray-500 text-xs mt-0.5">{item.date}</Text>
          </View>
          <OrderStatusBadge status={item.status} />
        </View>

        {/* Customer info */}
        <View className="flex-row items-center bg-gray-50 rounded-xl p-3 mb-3">
          <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
            <Text className="text-lg">👤</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-gray-800 font-semibold">{item.customerName}</Text>
            <Text className="text-gray-400 text-xs" numberOfLines={1}>📍 {item.address}</Text>
          </View>
          <TouchableOpacity className="w-9 h-9 bg-green-100 rounded-full items-center justify-center">
            <Ionicons name="call-outline" size={16} color="#16a34a" />
          </TouchableOpacity>
        </View>

        {/* Products */}
        <View className="mb-3">
          {item.products?.map((p, i) => (
            <View key={i} className="flex-row justify-between mb-1">
              <Text className="text-gray-600 text-sm">{p.name} × {p.quantity}</Text>
              <Text className="text-gray-800 font-semibold text-sm">₹{p.price * p.quantity}</Text>
            </View>
          ))}
          <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
            <Text className="text-gray-600 font-semibold">Total · {item.paymentMode}</Text>
            <Text className="text-green-700 font-bold text-base">₹{item.total}</Text>
          </View>
        </View>

        {/* Action buttons */}
        {item.status !== 'delivered' && item.status !== 'cancelled' && (
          <View className="flex-row space-x-2 mt-1">
            {item.status === 'confirmed' && (
              <>
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center bg-red-50 border border-red-200 py-3 rounded-xl"
                  onPress={() => handleReject(item)}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
                  <Text className="text-red-500 font-semibold ml-1.5 text-sm">Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center bg-green-600 py-3 rounded-xl"
                  onPress={() => handleAccept(item)}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                  <Text className="text-white font-semibold ml-1.5 text-sm">Accept</Text>
                </TouchableOpacity>
              </>
            )}
            {nextStatus && item.status !== 'confirmed' && (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center bg-green-600 py-3 rounded-xl"
                onPress={() => updateStatus(item.id, nextStatus)}
              >
                <Ionicons name="arrow-forward-circle-outline" size={16} color="white" />
                <Text className="text-white font-semibold ml-1.5 text-sm capitalize">
                  Mark as {nextStatus.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {item.status === 'cancelled' && (
          <View className="bg-red-50 rounded-xl px-4 py-2.5 items-center">
            <Text className="text-red-500 font-semibold text-sm">❌ Order Rejected</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={20} color="#1f2937" />
          </TouchableOpacity>
          <View>
            <Text className="text-gray-800 font-bold text-xl">Manage Orders</Text>
            <Text className="text-gray-400 text-xs">{filtered.length} orders</Text>
          </View>
        </View>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STATUS_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full mr-2 ${
                activeFilter === filter ? 'bg-green-600' : 'bg-gray-100'
              }`}
            >
              <Text className={`font-semibold text-sm ${
                activeFilter === filter ? 'text-white' : 'text-gray-600'
              }`}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filtered.length === 0 ? (
        <EmptyState emoji="📋" title="No orders" subtitle="Orders will appear here once customers place them" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
