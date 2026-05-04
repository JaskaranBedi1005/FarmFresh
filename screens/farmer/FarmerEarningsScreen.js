import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { farmerApi } from '../../services/api';

const { width } = Dimensions.get('window');

const BAR_MAX_HEIGHT = 120;

const WeeklyBar = ({ day, value, maxValue, isHighest }) => {
  const barHeight = Math.max(8, (value / maxValue) * BAR_MAX_HEIGHT);
  return (
    <View className="items-center flex-1">
      <Text className="text-green-600 text-xs font-bold mb-1 text-center" numberOfLines={1}>
        ₹{(value / 1000).toFixed(1)}k
      </Text>
      <View
        className="rounded-full justify-end"
        style={{ height: BAR_MAX_HEIGHT + 8, width: 24, backgroundColor: '#f0fdf4' }}
      >
        <View
          className="rounded-full"
          style={{
            height: barHeight,
            width: 24,
            backgroundColor: isHighest ? '#16a34a' : '#4ade80',
          }}
        />
      </View>
      <Text className="text-gray-500 text-xs mt-1">{day}</Text>
    </View>
  );
};

export default function FarmerEarningsScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly'); // weekly | monthly
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, weeklyRes, monthlyRes] = await Promise.all([
        farmerApi.getStats(),
        farmerApi.getWeeklySales(),
        farmerApi.getMonthlyEarnings(),
      ]);
      setStats(statsRes.stats);
      setWeeklyData(weeklyRes.weeklyData || []);
      setMonthlyData(monthlyRes.monthlyData || []);
    } catch (e) {
      console.error('Earnings fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  if (!stats) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-400">Loading earnings...</Text>
      </View>
    );
  }

  const maxWeeklySale = weeklyData.length ? Math.max(...weeklyData.map((d) => d.sales)) : 1;
  const weeklyTotal = weeklyData.reduce((sum, d) => sum + d.sales, 0);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

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
        <Text className="text-gray-800 font-bold text-xl">Earnings Report</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Hero Earnings Card */}
        <View
          className="rounded-3xl p-6 mb-5"
          style={{
            backgroundColor: '#166534',
            shadowColor: '#166534',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          <Text className="text-green-300 text-sm font-medium">Total This Month</Text>
          <Text className="text-white font-bold text-5xl mt-2">
            ₹{stats.monthlyEarnings.toLocaleString()}
          </Text>
          <View className="flex-row items-center mt-2">
            <Ionicons name="trending-up" size={16} color="#4ade80" />
            <Text className="text-green-400 font-semibold ml-2">+8.5% from last month</Text>
          </View>

          <View className="flex-row mt-6 pt-4 border-t border-green-700">
            {[
              { label: 'This Week', value: `₹${weeklyTotal.toLocaleString()}` },
              { label: 'Avg/Day', value: `₹${(weeklyTotal / 7).toFixed(0)}` },
              { label: 'Orders', value: `${stats.todayOrders * 7}` },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <View className="w-px bg-green-600" />}
                <View className="flex-1 items-center">
                  <Text className="text-white font-bold text-lg">{item.value}</Text>
                  <Text className="text-green-400 text-xs">{item.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Tab switcher */}
        <View className="bg-gray-200 rounded-xl p-1 flex-row mb-5">
          {['weekly', 'monthly'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl items-center ${activeTab === tab ? 'bg-white' : ''}`}
              style={activeTab === tab ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              } : {}}
            >
              <Text className={`font-semibold capitalize ${activeTab === tab ? 'text-green-700' : 'text-gray-500'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <View className="bg-white rounded-2xl p-5 mb-5"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.07,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text className="text-gray-800 font-bold text-base mb-5">
            {activeTab === 'weekly' ? '📊 Weekly Sales' : '📆 Monthly Revenue'}
          </Text>

          {activeTab === 'weekly' ? (
            <View className="flex-row justify-between items-end" style={{ height: BAR_MAX_HEIGHT + 50 }}>
              {weeklyData.map((d) => (
                <WeeklyBar
                  key={d.day}
                  day={d.day}
                  value={d.sales}
                  maxValue={maxWeeklySale}
                  isHighest={d.sales === maxWeeklySale}
                />
              ))}
            </View>
          ) : (
            <View className="space-y-3">
              {monthlyData.map((m) => {
                const maxRev = Math.max(...monthlyData.map((x) => x.revenue));
                const pct = (m.revenue / maxRev) * 100;
                return (
                  <View key={m.month}>
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-gray-700 font-semibold text-sm">{m.month}</Text>
                      <Text className="text-green-700 font-bold text-sm">₹{m.revenue.toLocaleString()}</Text>
                    </View>
                    <View className="h-3 bg-gray-100 rounded-full">
                      <View
                        className="h-3 bg-green-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Breakdown cards */}
        <Text className="text-gray-800 font-bold text-base mb-3">Revenue Breakdown</Text>
        <View className="flex-row flex-wrap -mx-1.5">
          {[
            { label: 'Milk Sales', value: '₹18,200', pct: '43%', icon: '🥛', color: '#0891b2', bg: '#e0f2fe' },
            { label: 'Ghee Sales', value: '₹12,500', pct: '29%', icon: '🫙', color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Paneer', value: '₹7,800', pct: '18%', icon: '🧀', color: '#7c3aed', bg: '#ede9fe' },
            { label: 'Others', value: '₹4,000', pct: '10%', icon: '🧈', color: '#16a34a', bg: '#dcfce7' },
          ].map((item) => (
            <View key={item.label} className="w-1/2 p-1.5">
              <View
                className="rounded-2xl p-4"
                style={{ backgroundColor: item.bg }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-2xl">{item.icon}</Text>
                  <Text className="font-bold text-sm" style={{ color: item.color }}>{item.pct}</Text>
                </View>
                <Text className="text-gray-800 font-bold text-lg">{item.value}</Text>
                <Text className="text-gray-500 text-xs">{item.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payout info */}
        <View className="bg-green-50 rounded-2xl p-5 mt-4 border border-green-100">
          <View className="flex-row items-center mb-3">
            <Ionicons name="wallet-outline" size={20} color="#16a34a" />
            <Text className="text-green-800 font-bold ml-2">Next Payout</Text>
          </View>
          <Text className="text-green-700 font-bold text-3xl">₹12,450</Text>
          <Text className="text-green-600 text-sm mt-1">Scheduled: April 28, 2026</Text>
          <View className="mt-3 flex-row items-center">
            <Ionicons name="information-circle-outline" size={14} color="#16a34a" />
            <Text className="text-green-600 text-xs ml-1">Payouts processed every Monday</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
