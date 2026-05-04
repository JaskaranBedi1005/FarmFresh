import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState } from '../../components/UIComponents';
import { useApp } from '../../context/AppContext';

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const discountedPrice = item.discount
    ? item.price - (item.price * item.discount) / 100
    : item.price;

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
      <Image source={{ uri: item.image }} className="w-20 h-20 rounded-xl" resizeMode="cover" />
      <View className="flex-1 ml-4 justify-between">
        <View className="flex-row items-start justify-between">
          <Text className="text-gray-800 font-bold text-base flex-1 pr-2" numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity onPress={() => onRemove(item.productId)}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
        <Text className="text-gray-500 text-xs">by {item.farmerName}</Text>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-green-700 font-bold text-lg">
            ₹{(discountedPrice * item.quantity).toFixed(0)}
          </Text>
          <View className="flex-row items-center bg-gray-100 rounded-xl overflow-hidden">
            <TouchableOpacity
              onPress={() => onDecrease(item.productId, item.quantity - 1)}
              className="w-9 h-9 items-center justify-center"
            >
              <Ionicons name="remove" size={16} color="#374151" />
            </TouchableOpacity>
            <Text className="text-gray-800 font-bold text-base w-7 text-center">{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => onIncrease(item.productId, item.quantity + 1)}
              className="w-9 h-9 items-center justify-center bg-green-600"
            >
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function CartScreen({ navigation }) {
  const { cartItems, cartTotal, updateCartQuantity, removeFromCart } = useApp();

  const deliveryCharge = cartTotal >= 200 ? 0 : 30;
  const grandTotal = cartTotal + deliveryCharge;

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
        <Text className="text-gray-800 font-bold text-xl flex-1">My Cart</Text>
        {cartItems.length > 0 && (
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 font-bold text-sm">{cartItems.length} items</Text>
          </View>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <EmptyState emoji="🛒" title="Your cart is empty" subtitle="Add some fresh dairy products to get started!" />
          <TouchableOpacity
            className="mt-4 bg-green-600 px-8 py-4 rounded-2xl"
            onPress={() => navigation.navigate('ProductListing')}
          >
            <Text className="text-white font-bold text-base">Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
            {/* Free delivery banner */}
            {cartTotal < 200 && (
              <View className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 flex-row items-center">
                <Text className="text-xl mr-2">🚚</Text>
                <View className="flex-1">
                  <Text className="text-amber-800 font-semibold text-sm">
                    Add ₹{200 - cartTotal} more for FREE delivery!
                  </Text>
                  <View className="h-2 bg-amber-200 rounded-full mt-2">
                    <View
                      className="h-2 bg-amber-500 rounded-full"
                      style={{ width: `${(cartTotal / 200) * 100}%` }}
                    />
                  </View>
                </View>
              </View>
            )}

            {cartItems.map((item, index) => (
              <CartItem
                key={item.cartItemId || item.productId || `cart-${index}`}
                item={item}
                onIncrease={updateCartQuantity}
                onDecrease={updateCartQuantity}
                onRemove={removeFromCart}
              />
            ))}

            {/* Order Summary */}
            <View className="bg-white rounded-2xl p-5 mt-2 mb-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.07,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <Text className="text-gray-800 font-bold text-base mb-4">Order Summary</Text>
              <View className="space-y-3">
                {[
                  { label: 'Subtotal', value: `₹${cartTotal.toFixed(0)}` },
                  { label: 'Delivery Charge', value: deliveryCharge === 0 ? 'FREE 🎉' : `₹${deliveryCharge}`, green: deliveryCharge === 0 },
                  { label: 'Platform Fee', value: '₹0', green: true },
                ].map((row) => (
                  <View key={row.label} className="flex-row justify-between">
                    <Text className="text-gray-500 text-sm">{row.label}</Text>
                    <Text className={`font-semibold text-sm ${row.green ? 'text-green-600' : 'text-gray-800'}`}>
                      {row.value}
                    </Text>
                  </View>
                ))}
                <View className="h-px bg-gray-100 my-2" />
                <View className="flex-row justify-between">
                  <Text className="text-gray-800 font-bold text-base">Grand Total</Text>
                  <Text className="text-green-700 font-bold text-xl">₹{grandTotal.toFixed(0)}</Text>
                </View>
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
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-600">Total</Text>
              <Text className="text-gray-900 font-bold text-xl">₹{grandTotal.toFixed(0)}</Text>
            </View>
            <PrimaryButton
              title="Proceed to Checkout →"
              onPress={() => navigation.navigate('Checkout')}
            />
          </View>
        </>
      )}
    </View>
  );
}
