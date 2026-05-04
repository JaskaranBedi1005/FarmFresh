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

export default function LoginScreen({ navigation }) {
  const { login, showToast } = useApp();
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      showToast('Please enter phone and password', 'error');
      return;
    }
    setLoading(true);
    try {
      await login(phone.trim(), password, role);
    } catch (e) {
      showToast(e.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'customer', label: 'Customer', subtitle: 'Buy fresh dairy', icon: 'person-outline' },
    { id: 'farmer', label: 'Farmer', subtitle: 'Sell products', icon: 'leaf-outline' },
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-green-700 pt-16 pb-12 px-6 rounded-b-3xl items-center">
          <View
            className="w-20 h-20 bg-white rounded-2xl items-center justify-center mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Ionicons name="leaf" size={38} color="#16a34a" />
          </View>
          <Text className="text-white font-bold text-3xl">FarmFresh</Text>
          <Text className="text-green-300 mt-1 text-sm">Sign in to continue</Text>
        </View>

        <View className="px-6 pt-8 pb-10">
          {/* Role Selector */}
          <View className="bg-gray-100 rounded-2xl p-1 flex-row mb-8">
            {roles.map((r) => (
              <TouchableOpacity
                key={r.id}
                className={`flex-1 py-3 rounded-xl items-center flex-row justify-center ${
                  role === r.id ? 'bg-white' : ''
                }`}
                style={
                  role === r.id
                    ? {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 6,
                        elevation: 3,
                      }
                    : {}
                }
                onPress={() => setRole(r.id)}
              >
                <Ionicons
                  name={r.icon}
                  size={16}
                  color={role === r.id ? '#16a34a' : '#9ca3af'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  className={`font-semibold ${
                    role === r.id ? 'text-green-700' : 'text-gray-500'
                  }`}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <InputField
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={phone}
            onChangeText={setPhone}
            icon="call-outline"
            keyboardType="phone-pad"
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            icon="lock-closed-outline"
          />

          <TouchableOpacity className="items-end mb-6 -mt-2">
            <Text className="text-green-600 font-semibold text-sm">Forgot Password?</Text>
          </TouchableOpacity>

          <PrimaryButton
            title={`Sign In as ${role === 'farmer' ? 'Farmer' : 'Customer'}`}
            onPress={handleLogin}
            loading={loading}
          />

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-400 font-medium text-sm">or continue with</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Social Login */}
          <View className="flex-row space-x-3">
            {[
              { label: 'Google', icon: 'logo-google' },
              { label: 'Apple', icon: 'logo-apple' },
            ].map((social) => (
              <TouchableOpacity
                key={social.label}
                className="flex-1 border-2 border-gray-200 rounded-2xl py-3.5 flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <Ionicons name={social.icon} size={18} color="#374151" style={{ marginRight: 8 }} />
                <Text className="font-semibold text-gray-700">{social.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign up */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text className="text-green-600 font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
