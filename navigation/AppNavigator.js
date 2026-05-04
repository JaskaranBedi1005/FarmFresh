import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Auth screens
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Customer screens
import CustomerHomeScreen from '../screens/customer/HomeScreen';
import ProductListingScreen from '../screens/customer/ProductListingScreen';
import ProductDetailScreen from '../screens/customer/ProductDetailScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import OrderTrackingScreen from '../screens/customer/OrderTrackingScreen';
import CustomerProfileScreen from '../screens/customer/ProfileScreen';
import AddAddressScreen from '../screens/customer/AddAddressScreen';
import EditProfileScreen from '../screens/customer/EditProfileScreen';
import OrderHistoryScreen from '../screens/customer/OrderHistoryScreen';

// Farmer screens
import FarmerDashboardScreen from '../screens/farmer/FarmerDashboardScreen';
import ManageProductsScreen from '../screens/farmer/ManageProductsScreen';
import AddProductScreen from '../screens/farmer/AddProductScreen';
import FarmerOrdersScreen from '../screens/farmer/FarmerOrdersScreen';
import FarmerEarningsScreen from '../screens/farmer/FarmerEarningsScreen';

import { useApp } from '../context/AppContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Customer Tab Bar ──────────────────────────────────────────────────────────

function CustomerTabBar({ state, descriptors, navigation }) {
  const { cartCount } = useApp();

  const tabs = [
    { name: 'Home', icon: 'home', label: 'Home' },
    { name: 'ProductListing', icon: 'grid', label: 'Products' },
    { name: 'Cart', icon: 'cart', label: 'Cart', badge: cartCount },
    { name: 'Profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        paddingBottom: 20,
        paddingTop: 12,
        paddingHorizontal: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 20,
      }}
    >
      {tabs.map((tab, index) => {
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            style={{ flex: 1, alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <View style={{ position: 'relative' }}>
              <View
                style={{
                  width: 48,
                  height: 34,
                  borderRadius: 16,
                  backgroundColor: isFocused ? '#dcfce7' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={isFocused ? tab.icon : `${tab.icon}-outline`}
                  size={22}
                  color={isFocused ? '#16a34a' : '#9ca3af'}
                />
              </View>
              {tab.badge > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: '#f59e0b',
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{tab.badge}</Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontSize: 11,
                fontWeight: isFocused ? '700' : '500',
                color: isFocused ? '#16a34a' : '#9ca3af',
                marginTop: 4,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Farmer Tab Bar ────────────────────────────────────────────────────────────

function FarmerTabBar({ state, descriptors, navigation }) {
  const tabs = [
    { name: 'FarmerDashboard', icon: 'home', label: 'Dashboard' },
    { name: 'ManageProducts', icon: 'cube', label: 'Products' },
    { name: 'FarmerOrders', icon: 'list', label: 'Orders' },
    { name: 'Profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        paddingBottom: 20,
        paddingTop: 12,
        paddingHorizontal: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 20,
      }}
    >
      {tabs.map((tab, index) => {
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            style={{ flex: 1, alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 48,
                height: 34,
                borderRadius: 16,
                backgroundColor: isFocused ? '#dcfce7' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name={isFocused ? tab.icon : `${tab.icon}-outline`}
                size={22}
                color={isFocused ? '#16a34a' : '#9ca3af'}
              />
            </View>
            <Text
              style={{
                fontSize: 11,
                fontWeight: isFocused ? '700' : '500',
                color: isFocused ? '#16a34a' : '#9ca3af',
                marginTop: 4,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Customer Tab Navigator ────────────────────────────────────────────────────

function CustomerTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomerTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="ProductListing" component={ProductListingScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={CustomerProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Farmer Tab Navigator ──────────────────────────────────────────────────────

function FarmerTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FarmerTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="FarmerDashboard" component={FarmerDashboardScreen} />
      <Tab.Screen name="ManageProducts" component={ManageProductsScreen} />
      <Tab.Screen name="FarmerOrders" component={FarmerOrdersScreen} />
      <Tab.Screen name="Profile" component={CustomerProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Main Navigator ────────────────────────────────────────────────────────────

export default function AppNavigator() {
  const { isLoggedIn, userRole } = useApp();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!isLoggedIn || !userRole ? (
        // Auth flow
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : userRole === 'farmer' ? (
        // Farmer flow
        <>
          <Stack.Screen name="FarmerMain" component={FarmerTabs} />
          <Stack.Screen name="AddProduct" component={AddProductScreen} />
          <Stack.Screen name="ManageProducts" component={ManageProductsScreen} />
          <Stack.Screen name="FarmerOrders" component={FarmerOrdersScreen} />
          <Stack.Screen name="FarmerEarnings" component={FarmerEarningsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </>
      ) : (
        // Customer flow
        <>
          <Stack.Screen name="CustomerMain" component={CustomerTabs} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="ProductListing" component={ProductListingScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
          <Stack.Screen name="AddAddress" component={AddAddressScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
