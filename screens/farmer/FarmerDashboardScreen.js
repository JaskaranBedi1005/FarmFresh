import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { farmerApi, ordersApi } from '../../services/api';

const { width } = Dimensions.get('window');

const StatCard = ({ label, value, icon, color, bg, suffix = '' }) => (
  <View
    className="rounded-2xl p-4 flex-1"
    style={{
      backgroundColor: bg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    }}
  >
    <View className={`w-10 h-10 rounded-xl items-center justify-center mb-3`} style={{ backgroundColor: color + '25' }}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text className="text-gray-800 font-bold text-xl">{value}{suffix}</Text>
    <Text className="text-gray-500 text-xs mt-0.5">{label}</Text>
  </View>
);

const MiniBar = ({ day, value, maxValue }) => {
  const barHeight = Math.max(4, (value / maxValue) * 80);
  return (
    <View className="items-center flex-1">
      <Text className="text-green-600 text-xs font-bold mb-1">₹{(value / 1000).toFixed(1)}k</Text>
      <View className="bg-gray-100 rounded-full w-6 justify-end" style={{ height: 88 }}>
        <View
          className="bg-green-500 rounded-full w-6"
          style={{ height: barHeight }}
        />
      </View>
      <Text className="text-gray-400 text-xs mt-1">{day}</Text>
    </View>
  );
};

export default function FarmerDashboardScreen({ navigation }) {
  const { currentUser, logout } = useApp();
  const [refreshing, setRefreshing]   = useState(false);
  const [stats, setStats]             = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [weeklyData, setWeeklyData]   = useState([]);
  const maxSales = weeklyData.length
    ? Math.max(...weeklyData.map((d) => d.sales))
    : 1;

  const fetchData = async () => {
    try {
      const [statsRes, weeklyRes, ordersRes] = await Promise.all([
        farmerApi.getStats(),
        farmerApi.getWeeklySales(),
        ordersApi.getAll(),
      ]);
      setStats(statsRes.stats);
      setWeeklyData(weeklyRes.weeklyData || []);
      setRecentOrders((ordersRes.orders || []).slice(0, 3));
    } catch (e) {
      console.error('Dashboard fetch error:', e);
      // If we get an authorization error, the role might be mismatched
      if (e.message.includes('403') || e.message.includes('restricted')) {
        logout();
      }
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (!stats) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-400">Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" backgroundColor="#166534" />

      {/* Header */}
      <View className="bg-green-700 pt-12 pb-16 px-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={{ uri: currentUser?.avatar || 'https://i.pravatar.cc/150?img=11' }}
              className="w-12 h-12 rounded-full border-2 border-green-400"
            />
            <View className="ml-3">
              <Text className="text-green-200 text-xs">Welcome back,</Text>
              <Text className="text-white font-bold text-xl">{currentUser?.name?.split(' ')[0] || 'Ramesh'} 👨‍🌾</Text>
            </View>
          </View>
          <View className="flex-row space-x-2">
            <TouchableOpacity className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <Ionicons name="settings-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <Text className="text-green-300 text-sm mt-3">
          📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => 'empty'}
        renderItem={null}
        ListHeaderComponent={
          <>
            {/* Earnings hero */}
            <View className="mx-5 bg-white rounded-3xl p-5 mb-4 -mt-10"
              style={{
                shadowColor: '#16a34a',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-gray-500 text-sm">Today's Earnings</Text>
                  <Text className="text-gray-900 font-bold text-4xl">₹{stats.todaySales.toLocaleString()}</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="trending-up" size={14} color="#22c55e" />
                    <Text className="text-green-600 font-semibold text-sm ml-1">+12% from yesterday</Text>
                  </View>
                </View>
                <View className="w-16 h-16 bg-green-100 rounded-2xl items-center justify-center">
                  <Text className="text-4xl">💰</Text>
                </View>
              </View>

              <View className="flex-row space-x-3">
                <View className="flex-1 bg-green-50 rounded-xl p-3">
                  <Text className="text-green-700 font-bold text-xl">{stats.todayOrders}</Text>
                  <Text className="text-green-600 text-xs">Orders Today</Text>
                </View>
                <View className="flex-1 bg-amber-50 rounded-xl p-3">
                  <Text className="text-amber-700 font-bold text-xl">{stats.pendingOrders}</Text>
                  <Text className="text-amber-600 text-xs">Pending</Text>
                </View>
                <View className="flex-1 bg-blue-50 rounded-xl p-3">
                  <Text className="text-blue-700 font-bold text-xl">₹{(stats.monthlyEarnings / 1000).toFixed(0)}k</Text>
                  <Text className="text-blue-600 text-xs">This Month</Text>
                </View>
              </View>
            </View>

            {/* Stat cards */}
            <View className="px-5 mb-4">
              <View className="flex-row space-x-3">
                <StatCard label="Products Listed" value={stats.totalProducts} icon="cube-outline" color="#7c3aed" bg="#faf5ff" />
                <StatCard label="Low Stock Alerts" value={stats.lowStock} icon="warning-outline" color="#f59e0b" bg="#fffbeb" />
              </View>
            </View>

            {/* Weekly chart */}
            <View className="mx-5 bg-white rounded-2xl p-5 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.07,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-gray-800 font-bold text-base">📊 Weekly Sales</Text>
                <TouchableOpacity onPress={() => navigation.navigate('FarmerEarnings')}>
                  <Text className="text-green-600 font-semibold text-sm">Full report →</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-between items-end" style={{ height: 110 }}>
                {weeklyData.map((d) => (
                  <MiniBar key={d.day} day={d.day} value={d.sales} maxValue={maxSales} />
                ))}
              </View>
            </View>

            {/* Quick actions */}
            <View className="px-5 mb-4">
              <Text className="text-gray-800 font-bold text-base mb-3">Quick Actions</Text>
              <View className="flex-row flex-wrap -mx-1.5">
                {[
                  { label: 'Add Product', icon: 'add-circle-outline', color: '#16a34a', bg: '#dcfce7', screen: 'AddProduct' },
                  { label: 'View Orders', icon: 'list-outline', color: '#7c3aed', bg: '#ede9fe', screen: 'FarmerOrders' },
                  { label: 'My Products', icon: 'cube-outline', color: '#0891b2', bg: '#e0f2fe', screen: 'ManageProducts' },
                  { label: 'Earnings', icon: 'bar-chart-outline', color: '#f59e0b', bg: '#fef3c7', screen: 'FarmerEarnings' },
                ].map((action) => (
                  <TouchableOpacity
                    key={action.label}
                    onPress={() => navigation.navigate(action.screen)}
                    className="w-1/2 p-1.5"
                    activeOpacity={0.85}
                  >
                    <View
                      className="rounded-2xl p-4 items-center"
                      style={{ backgroundColor: action.bg }}
                    >
                      <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center mb-2"
                        style={{
                          shadowColor: action.color,
                          shadowOffset: { width: 0, height: 3 },
                          shadowOpacity: 0.2,
                          shadowRadius: 6,
                          elevation: 3,
                        }}
                      >
                        <Ionicons name={action.icon} size={24} color={action.color} />
                      </View>
                      <Text className="text-gray-700 font-semibold text-sm">{action.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent orders */}
            <View className="px-5 pb-10">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-800 font-bold text-base">Recent Orders</Text>
                <TouchableOpacity onPress={() => navigation.navigate('FarmerOrders')}>
                  <Text className="text-green-600 font-semibold text-sm">View all</Text>
                </TouchableOpacity>
              </View>
              {recentOrders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  className="bg-white rounded-2xl p-4 mb-3"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.07,
                    shadowRadius: 10,
                    elevation: 3,
                  }}
                  activeOpacity={0.85}
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-800 font-bold">#{order.id}</Text>
                    <View className={`px-3 py-1 rounded-full ${
                      order.status === 'confirmed' ? 'bg-blue-100' :
                      order.status === 'packed' ? 'bg-amber-100' :
                      order.status === 'out_for_delivery' ? 'bg-orange-100' : 'bg-green-100'
                    }`}>
                      <Text className={`text-xs font-bold capitalize ${
                        order.status === 'confirmed' ? 'text-blue-700' :
                        order.status === 'packed' ? 'text-amber-700' :
                        order.status === 'out_for_delivery' ? 'text-orange-700' : 'text-green-700'
                      }`}>{order.status.replace(/_/g, ' ')}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-500 text-sm mt-1">{order.customerName}</Text>
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-gray-400 text-xs">{order.date}</Text>
                    <Text className="text-green-700 font-bold">₹{order.total}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor="#22c55e" />}
      />
    </View>
  );
}
