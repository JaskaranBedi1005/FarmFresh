import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { CategoryChip } from '../../components/CategoryChip';
import { ProductCard } from '../../components/ProductCard';
import { FarmerCard } from '../../components/FarmerCard';
import { ToastMessage } from '../../components/UIComponents';
import { productsApi, farmerApi } from '../../services/api';
import { BANNERS } from '../../data/mockData';

const { width } = Dimensions.get('window');

const DiscountBanner = ({ banner, onPress }) => (
  <View
    className="rounded-2xl px-6 py-5 mx-1"
    style={{ backgroundColor: banner.bg, width: width - 48 }}
  >
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-white font-bold text-xl">{banner.title}</Text>
        <Text className="text-white/80 text-sm mt-1">{banner.subtitle}</Text>
        <TouchableOpacity onPress={onPress} className="mt-3 bg-white/25 self-start px-4 py-2 rounded-full">
          <Text className="text-white font-semibold text-sm">Grab Deal →</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 52 }}>{banner.emoji}</Text>
    </View>
  </View>
);

export default function CustomerHomeScreen({ navigation }) {
  const { currentUser, cartCount, toast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchData = async () => {
    try {
      const [productsRes, farmersRes, categoriesRes] = await Promise.all([
        productsApi.getAll(),
        farmerApi.getAll(),
        productsApi.getCategories(),
      ]);
      setProducts(productsRes.products || []);
      setFarmers(farmersRes.farmers || []);
      setCategories(categoriesRes.categories || []);
    } catch (e) {
      console.error('Home fetch error:', e);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Show featured products; if none, fall back to top-rated
  const featuredProducts = products.filter((p) => p.featured).length > 0
    ? products.filter((p) => p.featured)
    : [...products].sort((a, b) => b.rating - a.rating).slice(0, 6);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const headerBg = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: ['transparent', '#ffffff'],
    extrapolate: 'clamp',
  });

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" backgroundColor="#16a34a" />

      {/* Top header bg */}


      <FlatList
        data={[]}
        keyExtractor={() => 'empty'}
        renderItem={null}
        ListHeaderComponent={
          <>
            <View key="sec-greeting" className="bg-green-600">
              {/* Greeting */}
              <View className="px-5 pt-14 pb-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-green-100 text-sm font-medium">
                      {new Date().getHours() < 12 ? 'Good Morning! 🌞' : new Date().getHours() < 17 ? 'Good Afternoon! ☀️' : 'Good Evening! 🌙'}
                    </Text>
                    <Text className="text-white font-bold text-2xl mt-0.5">
                      {currentUser?.name ? `Hi, ${currentUser.name.split(' ')[0]}!` : 'Welcome! 👋'}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="location-outline" size={13} color="#bbf7d0" />
                      <Text className="text-green-200 text-xs ml-1">{currentUser?.address || 'Set your location'}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center space-x-3">
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Cart')}
                      className="w-11 h-11 bg-white/20 rounded-full items-center justify-center relative"
                    >
                      <Ionicons name="cart-outline" size={22} color="white" />
                      {cartCount > 0 && (
                        <View className="absolute -top-1 -right-1 bg-amber-400 w-5 h-5 rounded-full items-center justify-center">
                          <Text className="text-white text-xs font-bold">{cartCount}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Search bar */}
                <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 mt-5"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5,
                  }}
                >
                  <Ionicons name="search-outline" size={20} color="#9ca3af" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-700 text-base"
                    placeholder="Search milk, paneer, ghee..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            <View key="sec-banners">
              {/* Discount banners */}
              <View className="mt-2 mb-4">
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) =>
                    setActiveBanner(Math.round(e.nativeEvent.contentOffset.x / (width - 48)))
                  }
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {BANNERS.map((banner) => (
                    <DiscountBanner key={banner.id} banner={banner} onPress={() => navigation.navigate('ProductListing')} />
                  ))}
                </ScrollView>
                <View className="flex-row justify-center mt-3 space-x-1.5">
                  {BANNERS.map((_, i) => (
                    <View
                      key={i}
                      className="h-1.5 rounded-full"
                      style={{
                        width: i === activeBanner ? 20 : 6,
                        backgroundColor: i === activeBanner ? '#16a34a' : '#d1d5db',
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View key="sec-categories">
              {/* Categories */}
              <View className="mb-5">
                <View className="flex-row items-center justify-between px-5 mb-3">
                  <Text className="text-gray-800 font-bold text-lg">Categories</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
                  <CategoryChip
                    category={{ id: 'all', label: 'All', icon: 'grid-outline' }}
                    selected={selectedCategory === 'all'}
                    onPress={() => setSelectedCategory('all')}
                  />
                  {categories.filter(c => c.category_id !== 'all').map((cat, index) => (
                    <CategoryChip
                      key={cat.category_id || `cat-${index}`}
                      category={{ id: cat.category_id, label: cat.label, icon: cat.icon }}
                      selected={selectedCategory === cat.category_id}
                      onPress={() => setSelectedCategory(cat.category_id)}
                    />
                  ))}
                </ScrollView>
              </View>
            </View>

            {selectedCategory === 'all' && searchQuery === '' && (
              <View key="sec-featured">
                {/* Featured Products */}
                <View className="mb-5">
                  <View className="flex-row items-center justify-between px-5 mb-3">
                    <Text className="text-gray-800 font-bold text-lg">⭐ Featured</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('ProductListing')}>
                      <Text className="text-green-600 font-semibold">See all</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
                    {featuredProducts.map((product, index) => (
                      <View key={product.id || `feat-${index}`} style={{ width: 180, marginRight: 12 }}>
                        <ProductCard
                          product={product}
                          onPress={() => navigation.navigate('ProductDetail', { product })}
                          layout="grid"
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            <View key="sec-all-products">
              {/* All / Filtered Products */}
              <View className="px-5 mb-5">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-800 font-bold text-lg">
                    {selectedCategory === 'all' ? '🥛 All Products' : `📦 ${categories.find((c) => c.category_id === selectedCategory)?.label}`}
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('ProductListing')}>
                    <Text className="text-green-600 font-semibold">View all</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap -mx-1.5">
                  {filteredProducts.map((product, index) => (
                    <View key={product.id || `prod-${index}`} className="w-1/2">
                      <ProductCard
                        product={product}
                        onPress={() => navigation.navigate('ProductDetail', { product })}
                        layout="grid"
                      />
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {selectedCategory === 'all' && searchQuery === '' && (
              <View key="sec-nearby">
                {/* Nearby Farmers */}
                <View className="px-5 mb-8">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-800 font-bold text-lg">👨‍🌾 Nearby Farmers</Text>
                    <TouchableOpacity>
                      <Text className="text-green-600 font-semibold">See all</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                    {farmers.length > 0 ? (
                      farmers.map((farmer, index) => (
                        <FarmerCard key={farmer.id || `farmer-${index}`} farmer={farmer} compact onPress={() => {}} />
                      ))
                    ) : (
                      <View className="bg-white rounded-2xl p-6 items-center justify-center border border-gray-100" style={{ width: width - 40 }}>
                        <Ionicons name="people-outline" size={32} color="#9ca3af" />
                        <Text className="text-gray-500 mt-2 text-center">Finding fresh dairy farmers near you... 🐄</Text>
                        <Text className="text-gray-400 text-xs mt-1 text-center">Check back soon for new listings!</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
            )}
          </>
        }
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor="#22c55e" />}
      />

      <ToastMessage toast={toast} />
    </View>
  );
}
