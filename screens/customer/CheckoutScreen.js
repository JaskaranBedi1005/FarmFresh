import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { InputField } from '../../components/InputField';
import { useApp } from '../../context/AppContext';

const PAYMENT_MODES = [
  { id: 'cash', label: 'Cash on Delivery', icon: 'cash-outline', desc: 'Pay when delivered' },
  { id: 'upi', label: 'UPI Payment', icon: 'qr-code-outline', desc: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline', desc: 'Visa, Mastercard, Rupay' },
];

export default function CheckoutScreen({ navigation }) {
  const { cartItems, cartTotal, currentUser, placeOrder } = useApp();
  const [selectedAddress, setSelectedAddress] = useState(
    currentUser?.savedAddresses?.[0] || { id: 'new', label: 'Home', address: currentUser?.address || '' }
  );
  const [paymentMode, setPaymentMode] = useState('cash');
  const [specialNote, setSpecialNote] = useState('');
  const [loading, setLoading] = useState(false);

  const deliveryCharge = cartTotal >= 200 ? 0 : 30;
  const grandTotal = cartTotal + deliveryCharge;

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const order = await placeOrder({
        deliveryAddress: selectedAddress.address,
        paymentMode,
        specialNote,
      });
      setLoading(false);
      navigation.replace('OrderTracking', { order });
    } catch (e) {
      setLoading(false);
      // showToast is available via useApp if needed
      console.error('Place order failed:', e);
    }
  };

  const addresses = currentUser?.savedAddresses || [];

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 flex-row items-center border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={20} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-gray-800 font-bold text-xl">Checkout</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Delivery Address */}
        <View className="bg-white rounded-2xl p-5 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.07,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-800 font-bold text-base">📍 Delivery Address</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddAddress')}>
              <Text className="text-green-600 font-semibold text-sm">+ Add New</Text>
            </TouchableOpacity>
          </View>

          {addresses.length > 0 ? (
            addresses.map((addr, index) => (
              <TouchableOpacity
                key={addr.id || `addr-${index}`}
                onPress={() => setSelectedAddress(addr)}
                className={`flex-row items-start p-4 rounded-xl mb-2 border-2 ${
                  selectedAddress?.id === addr.id ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <View className={`w-5 h-5 rounded-full border-2 mt-0.5 items-center justify-center ${
                  selectedAddress?.id === addr.id ? 'border-green-500' : 'border-gray-300'
                }`}>
                  {selectedAddress?.id === addr.id && (
                    <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  )}
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-gray-800 font-semibold">{addr.label}</Text>
                  <Text className="text-gray-500 text-sm mt-0.5">{addr.address}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-gray-50 rounded-xl p-4">
              <Text className="text-gray-600">{currentUser?.address || 'No address saved'}</Text>
            </View>
          )}

          <InputField
            placeholder="Add delivery instructions (optional)"
            value={specialNote}
            onChangeText={setSpecialNote}
            icon="chatbubble-ellipses-outline"
            multiline
            numberOfLines={2}
            style="mt-3 mb-0"
          />
        </View>

        {/* Payment Mode */}
        <View className="bg-white rounded-2xl p-5 mb-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.07,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text className="text-gray-800 font-bold text-base mb-4">💳 Payment Method</Text>
          {PAYMENT_MODES.map((pm) => (
            <TouchableOpacity
              key={pm.id}
              onPress={() => setPaymentMode(pm.id)}
              className={`flex-row items-center p-4 rounded-xl mb-2 border-2 ${
                paymentMode === pm.id ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <View className={`w-10 h-10 rounded-xl items-center justify-center ${
                paymentMode === pm.id ? 'bg-green-600' : 'bg-gray-200'
              }`}>
                <Ionicons name={pm.icon} size={20} color={paymentMode === pm.id ? 'white' : '#6b7280'} />
              </View>
              <View className="ml-3 flex-1">
                <Text className={`font-semibold ${paymentMode === pm.id ? 'text-green-700' : 'text-gray-800'}`}>
                  {pm.label}
                </Text>
                <Text className="text-gray-400 text-xs">{pm.desc}</Text>
              </View>
              {paymentMode === pm.id && (
                <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View className="bg-white rounded-2xl p-5"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.07,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text className="text-gray-800 font-bold text-base mb-4">🧾 Order Summary</Text>
          {cartItems.map((item, index) => (
            <View key={item.id || item.productId || `item-${index}`} className="flex-row justify-between mb-2">
              <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
                {item.name} × {item.quantity}
              </Text>
              <Text className="text-gray-800 font-semibold text-sm ml-4">
                ₹{(item.price * item.quantity).toFixed(0)}
              </Text>
            </View>
          ))}
          <View className="h-px bg-gray-100 my-3" />
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-sm">Delivery</Text>
            <Text className={`text-sm font-semibold ${deliveryCharge === 0 ? 'text-green-600' : 'text-gray-800'}`}>
              {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-800 font-bold">Total</Text>
            <Text className="text-green-700 font-bold text-xl">₹{grandTotal.toFixed(0)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order CTA */}
      <View className="bg-white px-5 py-4 border-t border-gray-100">
        <PrimaryButton
          title={`Place Order · ₹${grandTotal.toFixed(0)} 🎉`}
          onPress={handlePlaceOrder}
          loading={loading}
          size="lg"
        />
      </View>
    </View>
  );
}
