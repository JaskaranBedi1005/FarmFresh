import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductCard } from '../../components/ProductCard';
import { CategoryChip } from '../../components/CategoryChip';
import { EmptyState } from '../../components/UIComponents';
import { productsApi } from '../../services/api';

const SORT_OPTIONS = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Rating'];

export default function ProductListingScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [layout, setLayout] = useState('grid');
  const [sortBy, setSortBy] = useState('Recommended');
  const [showSort, setShowSort] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productsApi.getAll(),
        productsApi.getCategories(),
      ]);
      setProducts(productsRes.products || []);
      setCategories(categoriesRes.categories || []);
    } catch (e) {
      console.error('Listing fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const filtered = products
    .filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Rating') return b.rating - a.rating;
      return 0;
    });

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
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
          <Text className="text-gray-800 font-bold text-xl flex-1">All Products</Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setLayout(layout === 'grid' ? 'list' : 'grid')}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name={layout === 'grid' ? 'list-outline' : 'grid-outline'} size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSort(!showSort)}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="filter-outline" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-3 text-gray-700 text-base"
            placeholder="Search products..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort dropdown */}
      {showSort && (
        <View className="absolute top-36 right-4 bg-white rounded-2xl z-50 overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              className={`px-6 py-4 flex-row items-center ${sortBy === opt ? 'bg-green-50' : 'bg-white'}`}
              onPress={() => { setSortBy(opt); setShowSort(false); }}
            >
              {sortBy === opt && <Ionicons name="checkmark" size={16} color="#16a34a" />}
              <Text className={`ml-2 font-medium ${sortBy === opt ? 'text-green-700' : 'text-gray-700'}`}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View className="bg-white py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {[{ category_id: 'all', label: 'All', icon: 'grid-outline' }, ...categories.filter(c => c.category_id !== 'all')].map((item, idx) => (
            <CategoryChip
              key={item.category_id || `cat-${idx}`}
              category={{ id: item.category_id, label: item.label, icon: item.icon }}
              selected={selectedCategory === item.category_id}
              onPress={() => setSelectedCategory(item.category_id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      <View className="px-5 py-3 flex-row items-center justify-between">
        <Text className="text-gray-500 text-sm">
          <Text className="font-bold text-gray-700">{filtered.length}</Text> products found
        </Text>
        <Text className="text-gray-400 text-xs">Sort: {sortBy}</Text>
      </View>

      {/* Products */}
      {filtered.length === 0 ? (
        <EmptyState emoji="🔍" title="No products found" subtitle="Try a different search or category" />
      ) : layout === 'grid' ? (
        <FlatList
          key="grid-layout"
          data={filtered}
          keyExtractor={(item, index) => String(item.id || `grid-${index}`)}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View className="w-1/2">
              <ProductCard
                product={item}
                layout="grid"
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
              />
            </View>
          )}
        />
      ) : (
        <FlatList
          key="list-layout"
          data={filtered}
          keyExtractor={(item, index) => String(item.id || `list-${index}`)}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              layout="list"
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            />
          )}
        />
      )}
    </View>
  );
}
