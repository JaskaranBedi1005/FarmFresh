import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const ProductCard = ({ product, onPress, layout = 'grid' }) => {
  const { cartItems, addToCart, updateCartQuantity, removeFromCart } = useApp();
  
  const cartItem = cartItems.find(item => item.productId === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  if (layout === 'list') {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="flex-row bg-white rounded-2xl mb-3 overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 4,
        }}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: product.image }}
          className="w-28 h-28"
          resizeMode="cover"
        />
        <View className="flex-1 p-3 justify-between">
          <View>
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-800 font-bold text-base flex-1" numberOfLines={1}>
                {product.name}
              </Text>
              {product.discount > 0 && (
                <View className="bg-green-100 px-2 py-0.5 rounded-full ml-2">
                  <Text className="text-green-700 text-xs font-bold">{product.discount}% off</Text>
                </View>
              )}
            </View>
            <Text className="text-gray-500 text-xs mt-0.5">by {product.farmerName}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text className="text-gray-600 text-xs ml-1">{product.rating} ({product.reviews})</Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <View>
              <Text className="text-green-700 font-bold text-lg">
                ₹{discountedPrice.toFixed(0)}
                <Text className="text-xs text-gray-500 font-normal">/{product.unit}</Text>
              </Text>
              {product.discount > 0 && (
                <Text className="text-gray-400 text-xs line-through">₹{product.price}</Text>
              )}
            </View>
            {quantityInCart > 0 ? (
              <View className="flex-row items-center bg-green-600 rounded-xl overflow-hidden">
                <TouchableOpacity
                  onPress={() => quantityInCart === 1 ? removeFromCart(product.id) : updateCartQuantity(product.id, quantityInCart - 1)}
                  className="w-8 h-8 items-center justify-center bg-green-700"
                >
                  <Ionicons name="remove" size={14} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-xs w-6 text-center">{quantityInCart}</Text>
                <TouchableOpacity
                  onPress={() => updateCartQuantity(product.id, quantityInCart + 1)}
                  className="w-8 h-8 items-center justify-center bg-green-500"
                >
                  <Ionicons name="add" size={14} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-green-600 rounded-xl px-3 py-2"
                onPress={() => addToCart(product)}
                activeOpacity={0.85}
              >
                <Text className="text-white text-xs font-bold">Add +</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl overflow-hidden flex-1 m-1.5"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
      }}
      activeOpacity={0.9}
    >
      <View className="relative">
        <Image
          source={{ uri: product.image }}
          className="w-full h-36"
          resizeMode="cover"
        />
        {product.discount > 0 && (
          <View className="absolute top-2 left-2 bg-green-500 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">{product.discount}% OFF</Text>
          </View>
        )}
        {product.featured && (
          <View className="absolute top-2 right-2 bg-amber-500 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">⭐ Featured</Text>
          </View>
        )}
      </View>
      <View className="p-3">
        <Text className="text-gray-800 font-bold text-sm" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>
          by {product.farmerName}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="star" size={11} color="#f59e0b" />
          <Text className="text-gray-600 text-xs ml-1">{product.rating}</Text>
        </View>
        <View className="flex-row items-center justify-between mt-2">
          <View>
            <Text className="text-green-700 font-bold text-base">
              ₹{discountedPrice.toFixed(0)}
            </Text>
            <Text className="text-gray-400 text-xs">/{product.unit}</Text>
          </View>
          {quantityInCart > 0 ? (
            <View className="flex-row items-center bg-green-600 rounded-xl overflow-hidden h-8">
              <TouchableOpacity
                onPress={() => quantityInCart === 1 ? removeFromCart(product.id) : updateCartQuantity(product.id, quantityInCart - 1)}
                className="w-8 h-8 items-center justify-center bg-green-700"
              >
                <Ionicons name="remove" size={14} color="white" />
              </TouchableOpacity>
              <Text className="text-white font-bold text-xs w-6 text-center">{quantityInCart}</Text>
              <TouchableOpacity
                onPress={() => updateCartQuantity(product.id, quantityInCart + 1)}
                className="w-8 h-8 items-center justify-center bg-green-500"
              >
                <Ionicons name="add" size={14} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-green-600 w-8 h-8 rounded-xl items-center justify-center"
              onPress={() => addToCart(product)}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
