// ============================================================
// FarmFresh API Service
// Replaces mockData.js calls with real backend API calls
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Base URL ──────────────────────────────────────────────────────
// Change this to your machine's local IP when testing on a physical device
// e.g. 'http://192.168.1.5:3001/api'
// For Android emulator: 'http://10.0.2.2:3001/api'
// For iOS simulator: 'http://localhost:3001/api'
const BASE_URL = 'http://192.168.1.12:3001/api';

// ── Token helpers ─────────────────────────────────────────────────
const TOKEN_KEY = 'farmfresh_token';

export const saveToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

// ── Core fetch wrapper ────────────────────────────────────────────
async function apiRequest(endpoint, options = {}) {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data;
}

// ============================================================
// AUTH API
// ============================================================
export const authApi = {
  /**
   * Register a new user (customer or farmer)
   */
  register: async ({ name, email, phone, password, role, address, location }) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name, email, phone, password, role, address, location },
    });
    if (data.token) await saveToken(data.token);
    return data;
  },

  /**
   * Login with phone + password + role
   */
  login: async ({ phone, password, role }) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { phone, password, role },
    });
    if (data.token) await saveToken(data.token);
    return data; // { token, user }
  },

  /**
   * Get current user profile
   */
  getProfile: () => apiRequest('/auth/profile'),

  /**
   * Update current user profile
   */
  updateProfile: (profileData) => 
    apiRequest('/auth/profile', { method: 'PUT', body: profileData }),

  /**
   * Logout - clear stored token
   */
  logout: async () => {
    await removeToken();
  },

  /**
   * Add a new saved address
   */
  addAddress: (addressData) =>
    apiRequest('/auth/addresses', { method: 'POST', body: addressData }),
};

// ============================================================
// PRODUCTS API
// ============================================================
export const productsApi = {
  /**
   * Get all products with optional filters
   */
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters.farmerId)  params.set('farmerId',  filters.farmerId);
    if (filters.featured !== undefined) params.set('featured', filters.featured);
    if (filters.search)    params.set('search', filters.search);

    const query = params.toString() ? `?${params}` : '';
    return apiRequest(`/products${query}`);
  },

  /**
   * Get a single product by ID
   */
  getById: (productId) => apiRequest(`/products/${productId}`),

  /**
   * Get all categories
   */
  getCategories: () => apiRequest('/products/meta/categories'),

  /**
   * Add a new product (farmer only)
   */
  add: (productData) =>
    apiRequest('/products', { method: 'POST', body: productData }),

  /**
   * Update a product (farmer only)
   */
  update: (productId, productData) =>
    apiRequest(`/products/${productId}`, { method: 'PUT', body: productData }),

  /**
   * Soft-delete a product (farmer only)
   */
  delete: (productId) =>
    apiRequest(`/products/${productId}`, { method: 'DELETE' }),
};

// ============================================================
// CART API
// ============================================================
export const cartApi = {
  /**
   * Get cart items for logged-in user
   */
  get: () => apiRequest('/cart'),

  /**
   * Add item to cart
   */
  add: (productId, quantity = 1) =>
    apiRequest('/cart', { method: 'POST', body: { productId, quantity } }),

  /**
   * Update quantity of a cart item
   */
  updateQuantity: (productId, quantity) =>
    apiRequest(`/cart/${productId}`, { method: 'PUT', body: { quantity } }),

  /**
   * Remove item from cart
   */
  remove: (productId) =>
    apiRequest(`/cart/${productId}`, { method: 'DELETE' }),

  /**
   * Clear entire cart
   */
  clear: () => apiRequest('/cart', { method: 'DELETE' }),
};

// ============================================================
// ORDERS API
// ============================================================
export const ordersApi = {
  /**
   * Place an order from cart (customer only)
   */
  place: ({ deliveryAddress, paymentMode, specialNote }) =>
    apiRequest('/orders', {
      method: 'POST',
      body: { deliveryAddress, paymentMode, specialNote },
    }),

  /**
   * Get all orders for the current user
   */
  getAll: () => apiRequest('/orders'),

  /**
   * Get a single order by ID
   */
  getById: (orderId) => apiRequest(`/orders/${orderId}`),

  /**
   * Update order status (farmer only)
   */
  updateStatus: (orderId, status) =>
    apiRequest(`/orders/${orderId}/status`, { method: 'PUT', body: { status } }),
};

// ============================================================
// FARMER API
// ============================================================
export const farmerApi = {
  /**
   * Get farmer dashboard stats
   */
  getStats: () => apiRequest('/farmer/stats'),

  /**
   * Get weekly sales data
   */
  getWeeklySales: () => apiRequest('/farmer/weekly-sales'),

  /**
   * Get monthly earnings data
   */
  getMonthlyEarnings: () => apiRequest('/farmer/monthly-earnings'),

  /**
   * Get all farmers (public)
   */
  getAll: () => apiRequest('/farmers'),
};
