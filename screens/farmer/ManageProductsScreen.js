import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState } from '../../components/UIComponents';
import { productsApi } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function ManageProductsScreen({ navigation }) {
  const { showToast, currentUser } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await productsApi.getAll({ farmerId: currentUser.id });
      setProducts(res.products || []);
    } catch (e) {
      console.error('Fetch my products error:', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMyProducts();
    });
    return unsubscribe;
  }, [navigation]);

  const handleDelete = async (id, name) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productsApi.delete(id);
              setProducts((prev) => prev.filter((p) => p.id !== id));
              showToast('Product deleted successfully');
            } catch (e) {
              showToast(e.message || 'Failed to delete product', 'error');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isLowStock = item.stock <= 5;
    return (
      <View
        className="bg-white rounded-2xl p-4 mb-3 flex-row"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.07,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        <View className="relative">
          <Image source={{ uri: item.image }} className="w-24 h-24 rounded-xl" resizeMode="cover" />
          {isLowStock && (
            <View className="absolute -top-1 -left-1 bg-red-500 px-1.5 py-0.5 rounded-full">
              <Text className="text-white text-xs font-bold">Low</Text>
            </View>
          )}
        </View>

        <View className="flex-1 ml-4">
          <Text className="text-gray-800 font-bold text-base" numberOfLines={1}>{item.name}</Text>
          <View className="flex-row items-center mt-1 space-x-2">
            <View className="bg-green-100 px-2 py-0.5 rounded-full">
              <Text className="text-green-700 text-xs font-semibold capitalize">{item.category}</Text>
            </View>
            {item.featured && (
              <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                <Text className="text-amber-700 text-xs font-semibold">⭐ Featured</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View>
              <Text className="text-green-700 font-bold text-lg">₹{item.price}</Text>
              <Text className="text-gray-400 text-xs">per {item.unit}</Text>
            </View>
            <View className={`${isLowStock ? 'bg-red-50' : 'bg-green-50'} px-3 py-1.5 rounded-xl`}>
              <Text className={`text-xs font-bold ${isLowStock ? 'text-red-600' : 'text-green-700'}`}>
                Stock: {item.stock}
              </Text>
            </View>
          </View>

          <View className="flex-row space-x-2 mt-3">
            <TouchableOpacity
              className="flex-row items-center bg-blue-50 px-3 py-2 rounded-xl flex-1 justify-center"
              onPress={() => navigation.navigate('AddProduct', { product: item, isEditing: true })}
            >
              <Ionicons name="create-outline" size={15} color="#3b82f6" />
              <Text className="text-blue-600 font-semibold text-xs ml-1">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center bg-red-50 px-3 py-2 rounded-xl flex-1 justify-center"
              onPress={() => handleDelete(item.id, item.name)}
            >
              <Ionicons name="trash-outline" size={15} color="#ef4444" />
              <Text className="text-red-500 font-semibold text-xs ml-1">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
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
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={20} color="#1f2937" />
            </TouchableOpacity>
            <View>
              <Text className="text-gray-800 font-bold text-xl">My Products</Text>
              <Text className="text-gray-400 text-xs">{products.length} products listed</Text>
            </View>
          </View>
          <TouchableOpacity
            className="bg-green-600 flex-row items-center px-4 py-2.5 rounded-xl"
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white font-bold ml-1">Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {products.length === 0 ? (
        <EmptyState emoji="📦" title="No products yet" subtitle="Start selling by adding your first dairy product!" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
