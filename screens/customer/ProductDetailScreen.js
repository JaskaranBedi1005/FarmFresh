import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { FarmerCard } from '../../components/FarmerCard';
import { useApp } from '../../context/AppContext';
import { FARMERS } from '../../data/mockData';
import { ToastMessage } from '../../components/UIComponents';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ navigation, route }) {
  const { product } = route.params;
  const { addToCart, toast } = useApp();
  const [quantity, setQuantity] = useState(1);
  const heartScale = useRef(new Animated.Value(1)).current;

  const farmer = {
    id: product.farmerId,
    name: product.farmerName,
    avatar: product.farmerAvatar,
    location: product.farmerLocation,
    verified: product.farmerVerified,
    rating: product.farmerRating || 4.5,
    reviews: product.farmerReviews || 12,
    totalProducts: 8,
  };
  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  const handleLike = () => {
    // Disabled like functionality for now as per request to remove heart icon
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />

      {/* Absolute header buttons */}
      <View className="absolute top-12 left-0 right-0 z-10 flex-row items-center justify-between px-5">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-11 h-11 rounded-full bg-black/30 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View className="flex-row space-x-2">
          {/* Heart icon removed */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            className="w-11 h-11 rounded-full bg-black/30 items-center justify-center"
          >
            <Ionicons name="cart-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Product Image */}
        <View style={{ height: 320 }}>
          <Image
            source={{ uri: product.image }}
            style={{ width, height: 320 }}
            resizeMode="cover"
          />
          <View className="absolute bottom-0 left-0 right-0 h-16 bg-white rounded-t-3xl" />
        </View>

        <View className="px-5 -mt-2">
          {/* Category + discount */}
          <View className="flex-row items-center justify-between">
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-xs font-bold capitalize">{product.category}</Text>
            </View>
            {product.discount > 0 && (
              <View className="bg-red-100 px-3 py-1 rounded-full">
                <Text className="text-red-600 text-xs font-bold">{product.discount}% OFF</Text>
              </View>
            )}
          </View>

          <Text className="text-gray-900 font-bold text-2xl mt-3 leading-tight">{product.name}</Text>

          {/* Rating + Reviews */}
          <View className="flex-row items-center mt-2 space-x-4">
            <View className="flex-row items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.floor(product.rating) ? 'star' : 'star-outline'}
                  size={16}
                  color="#f59e0b"
                />
              ))}
              <Text className="text-gray-700 font-semibold ml-2">{product.rating}</Text>
              <Text className="text-gray-400 ml-1">({product.reviews} reviews)</Text>
            </View>
          </View>

          {/* Tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 -mx-1">
            {product.tags?.map((tag) => (
              <View key={tag} className="bg-gray-100 px-3 py-1 rounded-full mr-2">
                <Text className="text-gray-600 text-xs font-medium">{tag}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Description */}
          <View className="mt-5">
            <Text className="text-gray-800 font-bold text-base mb-2">About this product</Text>
            <Text className="text-gray-500 leading-relaxed text-sm">{product.description}</Text>
          </View>

          {/* Price section */}
          <View className="mt-5 bg-green-50 rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-500 text-xs mb-1">Price per {product.unit}</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-green-700 font-bold text-3xl">
                    ₹{discountedPrice.toFixed(0)}
                  </Text>
                  {product.discount > 0 && (
                    <Text className="text-gray-400 line-through ml-2 text-base">₹{product.price}</Text>
                  )}
                </View>
                {product.discount > 0 && (
                  <Text className="text-green-600 text-xs font-semibold mt-0.5">
                    You save ₹{(product.price - discountedPrice).toFixed(0)}!
                  </Text>
                )}
              </View>
              {/* Quantity selector */}
              <View className="flex-row items-center bg-white rounded-2xl overflow-hidden border-2 border-green-200">
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 items-center justify-center"
                >
                  <Ionicons name="remove" size={20} color="#16a34a" />
                </TouchableOpacity>
                <Text className="text-gray-800 font-bold text-lg w-8 text-center">{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-11 h-11 items-center justify-center bg-green-600"
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            <Text className="text-gray-400 text-xs mt-2">
              {product.stock} {product.unit}s available in stock
            </Text>
          </View>

          {/* Total */}
          <View className="flex-row justify-between items-center mt-4 mb-2">
            <Text className="text-gray-600 font-semibold">Subtotal ({quantity} {product.unit})</Text>
            <Text className="text-gray-900 font-bold text-lg">
              ₹{(discountedPrice * quantity).toFixed(0)}
            </Text>
          </View>

          {/* Farmer card */}
          <View className="mt-4 mb-4">
            <Text className="text-gray-800 font-bold text-base mb-3">Sold by Farmer</Text>
            <FarmerCard farmer={farmer} onPress={() => {}} />
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="bg-white px-5 py-4 border-t border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <View className="flex-row space-x-3">
          <PrimaryButton
            title="Add to Cart"
            onPress={handleAddToCart}
            variant="outline"
            style="flex-1"
          />
          <PrimaryButton
            title="Buy Now →"
            onPress={() => { handleAddToCart(); navigation.navigate('Cart'); }}
            style="flex-1"
          />
        </View>
      </View>

      <ToastMessage toast={toast} />
    </View>
  );
}
