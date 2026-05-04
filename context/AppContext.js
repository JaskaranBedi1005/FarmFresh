import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, cartApi, ordersApi } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole]     = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // for splash screen

  // Cart state (synced with backend)
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Orders state
  const [orders, setOrders] = useState([]);

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // ── Auto-login: restore session from saved token ────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('farmfresh_token');
          if (token) {
            const { user } = await authApi.getProfile();
            const normalized = normalizeUser(user);
            setCurrentUser(normalized);
            setUserRole(normalized.role);
            setIsLoggedIn(true);
            await refreshCart();
            await refreshOrders();
          }
        } catch (e) {
          console.error('Session restoration failed:', e);
          await AsyncStorage.removeItem('farmfresh_token');
          setIsLoggedIn(false);
          setUserRole(null);
        } finally {
        setAuthLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ── Normalize Oracle uppercase keys to camelCase ────────────────
  const normalizeUser = (u) => ({
    id:                 u.USER_ID              || u.user_id              || u.id,
    name:               u.NAME                 || u.name,
    email:              u.EMAIL                || u.email,
    phone:              u.PHONE                || u.phone,
    role:               u.ROLE                 || u.role,
    avatar:             u.AVATAR_URL           || u.avatar_url           || u.avatar,
    address:            u.ADDRESS              || u.address,
    location:           u.LOCATION             || u.location,
    about:              u.ABOUT                || u.about,
    verified:           !!(u.VERIFIED || u.verified),
    yearsOfExperience:  Number(u.YEARS_OF_EXPERIENCE  || u.years_of_experience  || u.yearsOfExperience || 0),
    rating:             Number(u.RATING               || u.rating || 0),
    bankAccount:        String(u.BANK_ACCOUNT         || u.bank_account         || u.bankAccount || ''),
    upi:                String(u.UPI_ID               || u.upi_id               || u.upi || ''),
    savedAddresses:     (u.savedAddresses || []).map(a => ({
      id:      a.ADDRESS_ID || a.address_id || a.id,
      label:   a.LABEL      || a.label,
      address: a.ADDRESS    || a.address,
    })),
  });

  // ── Login ────────────────────────────────────────────────────────
  const login = async (phone, password, role) => {
    const data = await authApi.login({ phone, password, role });
    const user = normalizeUser(data.user);
    setCurrentUser(user);
    setUserRole(user.role);
    setIsLoggedIn(true);
    await refreshCart();
    await refreshOrders();
    return user;
  };

  // ── Register ─────────────────────────────────────────────────────
  const register = async ({ name, email, phone, password, role, address, location }) => {
    const data = await authApi.register({ name, email, phone, password, role, address, location });
    showToast('Registration successful! Welcome to FarmFresh 🌿');
    // After register, login
    const loginData = await authApi.login({ phone, password, role });
    const user = normalizeUser(loginData.user);
    setCurrentUser(user);
    setUserRole(user.role);
    setIsLoggedIn(true);
    return user;
  };

  // ── Logout ───────────────────────────────────────────────────────
  const logout = async () => {
    await authApi.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCartItems([]);
    setCartTotal(0);
    setCartCount(0);
    setOrders([]);
  };

  // ── Update Profile ───────────────────────────────────────────────
  const updateProfile = async (profileData) => {
    try {
      await authApi.updateProfile(profileData);
      const { user } = await authApi.getProfile();
      setCurrentUser(normalizeUser(user));
      showToast('Profile updated successfully! 🎉');
    } catch (e) {
      showToast('Failed to update profile', 'error');
      throw e;
    }
  };

  // ── Add Address ──────────────────────────────────────────────────
  const addAddress = async (label, address, isDefault = false) => {
    try {
      await authApi.addAddress({ label, address, isDefault });
      // Fetch fresh profile to update addresses list
      const { user } = await authApi.getProfile();
      setCurrentUser(normalizeUser(user));
      showToast('Address added successfully! 📍');
    } catch (e) {
      showToast('Failed to add address', 'error');
      throw e;
    }
  };

  // ── Cart: refresh from backend ───────────────────────────────────
  const refreshCart = async () => {
    try {
      const { items, cartTotal: total, cartCount: count } = await cartApi.get();
      setCartItems(items || []);
      setCartTotal(total || 0);
      setCartCount(count || 0);
    } catch (e) {
      // Not logged in yet or network error – silent fail
    }
  };

  // ── Orders: refresh from backend ─────────────────────────────────
  const refreshOrders = async () => {
    try {
      const data = await ordersApi.getAll();
      setOrders(data.orders || []);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    }
  };

  // ── Add to cart ──────────────────────────────────────────────────
  const addToCart = async (product, quantity = 1) => {
    try {
      await cartApi.add(product.id, quantity);
      await refreshCart();
      showToast(`${product.name} added to cart! 🛒`);
    } catch (e) {
      showToast(e.message || 'Failed to add to cart', 'error');
    }
  };

  // ── Remove from cart ─────────────────────────────────────────────
  const removeFromCart = async (productId) => {
    try {
      await cartApi.remove(productId);
      await refreshCart();
    } catch (e) {
      showToast('Failed to remove item', 'error');
    }
  };

  // ── Update cart quantity ─────────────────────────────────────────
  const updateCartQuantity = async (productId, quantity) => {
    try {
      await cartApi.updateQuantity(productId, quantity);
      await refreshCart();
    } catch (e) {
      showToast('Failed to update quantity', 'error');
    }
  };

  // ── Clear cart ───────────────────────────────────────────────────
  const clearCart = async () => {
    try {
      await cartApi.clear();
      setCartItems([]);
      setCartTotal(0);
      setCartCount(0);
    } catch (e) {
      showToast('Failed to clear cart', 'error');
    }
  };

  // ── Place order ──────────────────────────────────────────────────
  const placeOrder = async ({ deliveryAddress, paymentMode, specialNote }) => {
    const data = await ordersApi.place({ deliveryAddress, paymentMode, specialNote });
    // cart is cleared on the backend
    setCartItems([]);
    setCartTotal(0);
    setCartCount(0);
    setOrders((prev) => [data.order, ...prev]);
    return data.order;
  };

  // ── Toast ────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AppContext.Provider
      value={{
        // Auth
        isLoggedIn,
        userRole,
        currentUser,
        authLoading,
        login,
        register,
        logout,
        addAddress,
        updateProfile,
        // Cart
        cartItems,
        cartTotal,
        cartCount,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        refreshCart,
        // Orders
        orders,
        placeOrder,
        // UI
        isDarkMode,
        setIsDarkMode,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
