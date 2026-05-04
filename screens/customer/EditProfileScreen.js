import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { authApi } from '../../services/api';

export default function EditProfileScreen({ navigation }) {
  const { currentUser, showToast, updateProfile } = useApp();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      alert('Name and Phone are required');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name, email, phone, location });
      navigation.goBack();
    } catch (e) {
      console.error(e);
      // Toast is already handled in AppContext
    } finally {
      setLoading(false);
    }
  };

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
        <Text className="text-lg font-bold text-gray-800">Edit Profile</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        
        <View className="mb-4">
          <Text className="text-gray-800 font-bold mb-2 text-sm">Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            className="bg-white px-4 py-3 rounded-2xl border border-gray-200 text-gray-800"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-800 font-bold mb-2 text-sm">Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            className="bg-white px-4 py-3 rounded-2xl border border-gray-200 text-gray-800"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-800 font-bold mb-2 text-sm">Email Address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-white px-4 py-3 rounded-2xl border border-gray-200 text-gray-800"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-800 font-bold mb-2 text-sm">Location (Optional)</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Mumbai, Maharashtra"
            className="bg-white px-4 py-3 rounded-2xl border border-gray-200 text-gray-800"
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
            <Text className="text-white font-bold text-lg">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
