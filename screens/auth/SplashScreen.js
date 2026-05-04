import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen({ navigation }) {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-green-700 items-center justify-center">
      <StatusBar style="light" backgroundColor="#15803d" />

      {/* Decorative circles */}
      <View
        style={{
          position: 'absolute', top: -60, right: -60,
          width: 240, height: 240, borderRadius: 120,
          backgroundColor: 'rgba(255,255,255,0.06)',
        }}
      />
      <View
        style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 300, height: 300, borderRadius: 150,
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}
      />

      <Animated.View
        style={{ transform: [{ scale: logoScale }], opacity: logoOpacity }}
        className="items-center"
      >
        <View
          className="w-28 h-28 bg-white rounded-3xl items-center justify-center mb-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 16,
          }}
        >
          <Ionicons name="leaf" size={56} color="#16a34a" />
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity }} className="items-center">
        <Text className="text-white font-bold text-4xl tracking-wide">FarmFresh</Text>
        <Text className="text-green-300 font-semibold text-sm tracking-widest mt-1 uppercase">
          Dairy
        </Text>
      </Animated.View>

      <Animated.View style={{ opacity: taglineOpacity }} className="items-center mt-6 px-10">
        <View className="h-px bg-white/20 w-16 mb-5" />
        <Text className="text-green-100 text-center text-sm font-medium">
          Fresh Dairy, Direct from Farmers
        </Text>
      </Animated.View>

      <View className="absolute bottom-12 items-center">
        <Text className="text-green-400 text-xs">Powered by FarmFresh Technologies</Text>
      </View>
    </View>
  );
}
