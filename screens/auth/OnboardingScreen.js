import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'leaf-outline',
    iconColor: '#ffffff',
    title: 'Farm to Your Doorstep',
    subtitle: 'Get pure, fresh dairy products directly from local farmers. No middlemen, no markups.',
    bg: '#16a34a',
    dotColor: '#16a34a',
  },
  {
    icon: 'water-outline',
    iconColor: '#ffffff',
    title: 'Premium Quality Dairy',
    subtitle: 'A2 milk, desi ghee, fresh paneer — all sourced ethically from verified farmers near you.',
    bg: '#0891b2',
    dotColor: '#0891b2',
  },
  {
    icon: 'car-outline',
    iconColor: '#ffffff',
    title: 'Daily Fresh Delivery',
    subtitle: 'Subscribe to morning deliveries or order on demand. Track your order in real-time.',
    bg: '#7c3aed',
    dotColor: '#7c3aed',
  },
  {
    icon: 'people-outline',
    iconColor: '#ffffff',
    title: 'Support Local Farmers',
    subtitle: 'Every purchase directly supports a farmer family. Fair prices, sustainable agriculture.',
    bg: '#d97706',
    dotColor: '#d97706',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => navigation.replace('Login');

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, index) => (
          <View key={index} style={{ width }} className="flex-1">
            {/* Top colored section */}
            <View
              className="flex-1 items-center justify-center"
              style={{ backgroundColor: slide.bg }}
            >
              {/* Skip button */}
              {index < SLIDES.length - 1 && (
                <TouchableOpacity
                  className="absolute top-14 right-6 px-4 py-2 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  onPress={handleSkip}
                >
                  <Text className="text-white font-semibold text-sm">Skip</Text>
                </TouchableOpacity>
              )}

              {/* Icon rings */}
              <View
                className="w-52 h-52 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
              >
                <View
                  className="w-36 h-36 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <View
                    className="w-24 h-24 rounded-full bg-white items-center justify-center"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 12,
                      elevation: 8,
                    }}
                  >
                    <Ionicons name={slide.icon} size={48} color={slide.bg} />
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom content */}
            <View className="bg-white px-8 pt-10 pb-12" style={{ minHeight: 280 }}>
              <Text className="text-gray-900 font-bold text-3xl text-center leading-tight">
                {slide.title}
              </Text>
              <Text className="text-gray-500 text-base text-center mt-4 leading-relaxed">
                {slide.subtitle}
              </Text>

              {/* Dots */}
              <View className="flex-row justify-center mt-8 mb-8 space-x-2">
                {SLIDES.map((_, i) => (
                  <View
                    key={i}
                    className="h-2 rounded-full"
                    style={{
                      width: i === activeIndex ? 28 : 8,
                      backgroundColor: i === activeIndex ? slide.dotColor : '#e5e7eb',
                    }}
                  />
                ))}
              </View>

              <PrimaryButton
                title={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
                onPress={handleNext}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
