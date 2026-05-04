import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useApp } from '../../context/AppContext';

const ROLES = [
  {
    id: 'customer',
    label: 'Customer',
    desc: 'Buy fresh dairy products',
    icon: 'person-outline',
    activeIcon: 'person',
  },
  {
    id: 'farmer',
    label: 'Farmer',
    desc: 'Sell your products directly',
    icon: 'leaf-outline',
    activeIcon: 'leaf',
  },
];

export default function SignupScreen({ navigation }) {
  const { register, showToast } = useApp();
  const [role, setRole] = useState('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !phone || !password) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, phone, password, role, address });
    } catch (e) {
      showToast(e.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-14 px-6 pb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-6"
          >
            <Ionicons name="arrow-back" size={20} color="#1f2937" />
          </TouchableOpacity>

          <Text className="text-gray-900 font-bold text-3xl">Create Account</Text>
          <Text className="text-gray-500 mt-1 text-base">Join the fresh dairy marketplace</Text>
        </View>

        <View className="px-6 pb-12">
          {/* Role Selector */}
          <Text className="text-gray-700 font-semibold mb-3 text-sm">I am a...</Text>
          <View className="flex-row space-x-3 mb-6">
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => setRole(r.id)}
                className={`flex-1 p-4 rounded-2xl border-2 items-center ${
                  role === r.id ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                }`}
                activeOpacity={0.85}
              >
                <View
                  className={`w-12 h-12 rounded-2xl items-center justify-center mb-2 ${
                    role === r.id ? 'bg-green-600' : 'bg-gray-100'
                  }`}
                >
                  <Ionicons
                    name={role === r.id ? r.activeIcon : r.icon}
                    size={24}
                    color={role === r.id ? '#ffffff' : '#6b7280'}
                  />
                </View>
                <Text className={`font-bold text-sm ${role === r.id ? 'text-green-700' : 'text-gray-700'}`}>
                  {r.label}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5 text-center">{r.desc}</Text>
                {role === r.id && (
                  <View className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 items-center justify-center">
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            icon="person-outline"
          />

          <InputField
            label="Email Address"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={phone}
            onChangeText={setPhone}
            icon="call-outline"
            keyboardType="phone-pad"
          />

          <InputField
            label="Address"
            placeholder="Village / City, State"
            value={address}
            onChangeText={setAddress}
            icon="location-outline"
            multiline={true}
            numberOfLines={2}
          />

          <InputField
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            icon="lock-closed-outline"
          />

          <Text className="text-gray-400 text-xs mb-6 leading-relaxed">
            By signing up, you agree to our{' '}
            <Text className="text-green-600 font-semibold">Terms of Service</Text> and{' '}
            <Text className="text-green-600 font-semibold">Privacy Policy</Text>.
          </Text>

          <PrimaryButton
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
          />

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-green-600 font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
