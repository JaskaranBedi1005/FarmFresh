import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';

export default function AddAddressScreen({ navigation }) {
  const { addAddress } = useApp();
  
  const [label, setLabel] = useState('Home');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!address.trim()) {
      alert('Please enter your full address');
      return;
    }

    setLoading(true);
    try {
      await addAddress(label, address, isDefault);
      navigation.goBack();
    } catch (e) {
      console.error(e);
      // Toast is already handled in AppContext
    } finally {
      setLoading(false);
    }
  };

  const labels = ['Home', 'Work', 'Other'];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View className="pt-12 pb-4 px-5 bg-white flex-row items-center justify-between border-b border-gray-100 shadow-sm">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Add Address</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-800 font-bold mb-4 text-base">Save address as</Text>
        <View className="flex-row space-x-3 mb-6">
          {labels.map((l) => (
            <TouchableOpacity
              key={l}
              onPress={() => setLabel(l)}
              className={`px-6 py-2 rounded-full border ${
                label === l ? 'bg-green-100 border-green-600' : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`font-semibold ${
                  label === l ? 'text-green-700' : 'text-gray-500'
                }`}
              >
                {l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-gray-800 font-bold mb-2 text-base">Full Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="House no., Building, Street, Area"
          placeholderTextColor="#9ca3af"
          className="bg-white px-4 py-3 rounded-2xl border border-gray-200 text-gray-800 h-32"
          multiline
          textAlignVertical="top"
        />

        <View className="flex-row items-center justify-between bg-white px-4 py-4 rounded-2xl border border-gray-200 mt-6">
          <View>
            <Text className="text-gray-800 font-bold">Set as Default</Text>
            <Text className="text-gray-500 text-xs mt-0.5">Use this address for future orders</Text>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: '#d1d5db', true: '#16a34a' }}
            thumbColor={'#ffffff'}
          />
        </View>

      </ScrollView>

      {/* Footer */}
      <View className="p-5 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`h-14 rounded-2xl items-center justify-center ${loading ? 'bg-green-400' : 'bg-green-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Save Address</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
