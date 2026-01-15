# Mobile App Implementation Plan
# React Native Expo - Decan India E-Commerce

**Version:** 3.0  
**Framework:** React Native + Expo  
**Duration:** 8-10 Weeks  
**Date:** January 10, 2026

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Setup & Installation](#setup--installation)
4. [Navigation Structure](#navigation-structure)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Screen Implementation](#screen-implementation)
8. [Product Variant Handling](#product-variant-handling)
9. [Offline Capabilities](#offline-capabilities)
10. [Push Notifications](#push-notifications)
11. [Payment Integration](#payment-integration)
12. [Testing](#testing)
13. [Build & Deployment](#build--deployment)
14. [Week-by-Week Plan](#week-by-week-plan)

---

## 1. Tech Stack

### 1.1 Core Dependencies

```json
{
  "name": "decan-india-mobile",
  "version": "1.0.0",
  "main": "expo-router",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~50.0.0",
    "expo-router": "~3.4.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    
    "// Navigation": "",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/native-stack": "^6.9.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "expo-router": "~3.4.0",
    
    "// State Management": "",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.17.0",
    
    "// Styling (NativeWind)": "",
    "nativewind": "^4.1.0",
    "tailwindcss": "^3.4.0",

    "// UI Components (React Native Paper)": "",
    "react-native-paper": "^5.12.0",
    "react-native-vector-icons": "^10.0.0",
    
    "// Forms": "",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    
    "// API": "",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.17.0",
    
    "// Storage": "",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "expo-secure-store": "~12.7.0",
    
    "// Image": "",
    "expo-image-picker": "~14.7.0",
    "expo-image": "~1.10.0",
    "react-native-fast-image": "^8.6.3",
    
    "// Camera/Barcode": "",
    "expo-camera": "~14.0.0",
    "expo-barcode-scanner": "~12.9.0",
    
    "// Location/Maps": "",
    "expo-location": "~16.5.0",
    "react-native-maps": "1.10.0",
    
    "// Notifications": "",
    "expo-notifications": "~0.27.0",
    
    "// Payments": "",
    "react-native-razorpay": "^2.3.0",
    
    "// Biometrics": "",
    "expo-local-authentication": "~13.8.0",
    
    "// Utils": "",
    "date-fns": "^3.0.0",
    "react-native-uuid": "^2.0.0",
    "react-native-toast-message": "^2.2.0",
    
    "// Animation": "",
    "react-native-reanimated": "~3.6.0",
    "react-native-gesture-handler": "~2.14.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.0",
    "typescript": "^5.3.0"
  }
}
```

### 1.2 Why Expo?

✅ **Fast Development** - Hot reload, OTA updates  
✅ **Cross-Platform** - Single codebase for iOS & Android  
✅ **Built-in APIs** - Camera, Location, Notifications, etc.  
✅ **Easy Deployment** - Build & submit from cloud  
✅ **Expo Router** - File-based routing (like Next.js)  

---

## 2. Project Structure

```
mobile-app/
├── app/                              # Expo Router (file-based routing)
│   ├── (auth)/                       # Auth screens
│   │   ├── _layout.tsx              # Auth layout
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                       # Bottom tabs
│   │   ├── _layout.tsx              # Tabs layout
│   │   ├── index.tsx                # Home
│   │   ├── categories.tsx           # Categories
│   │   ├── cart.tsx                 # Cart
│   │   └── profile.tsx              # Profile
│   ├── (shop)/                       # Shopping screens
│   │   ├── products.tsx             # Product listing
│   │   ├── product/[id].tsx         # Product details
│   │   ├── search.tsx               # Search
│   │   └── category/[id].tsx        # Category products
│   ├── (user)/                       # User screens
│   │   ├── orders.tsx               # Order history
│   │   ├── order/[id].tsx           # Order details
│   │   ├── addresses.tsx            # Address management
│   │   ├── wishlist.tsx             # Wishlist
│   │   └── edit-profile.tsx         # Edit profile
│   ├── (checkout)/                   # Checkout flow
│   │   ├── checkout.tsx             # Main checkout
│   │   ├── address-select.tsx       # Address selection
│   │   ├── payment.tsx              # Payment method
│   │   └── success.tsx              # Order success
│   ├── (static)/                     # Static pages
│   │   ├── about.tsx
│   │   ├── contact.tsx
│   │   ├── privacy.tsx
│   │   ├── terms.tsx
│   │   └── faq.tsx
│   ├── _layout.tsx                   # Root layout
│   ├── +not-found.tsx               # 404 page
│   └── modal.tsx                    # Example modal
├── components/
│   ├── ui/                           # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Loading.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorBoundary.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── SocialLogin.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductList.tsx
│   │   ├── ProductFilters.tsx
│   │   ├── ProductSort.tsx
│   │   ├── ProductImages.tsx
│   │   ├── VariantSelector.tsx      # ⭐ NEW
│   │   ├── AddToCartButton.tsx
│   │   └── RatingStars.tsx
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── CouponInput.tsx
│   ├── orders/
│   │   ├── OrderCard.tsx
│   │   ├── OrderStatusBadge.tsx
│   │   ├── OrderTimeline.tsx
│   │   └── TrackingMap.tsx
│   ├── checkout/
│   │   ├── AddressCard.tsx
│   │   ├── AddressForm.tsx
│   │   ├── PaymentMethod.tsx
│   │   └── OrderSummary.tsx
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Banner.tsx
│   │   ├── CategoryCard.tsx
│   │   └── BottomSheet.tsx
│   └── reviews/
│       ├── ReviewItem.tsx
│       ├── ReviewForm.tsx
│       └── RatingDistribution.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts                # Axios instance
│   │   ├── auth.ts                  # Auth APIs
│   │   ├── products.ts              # Product APIs
│   │   ├── cart.ts                  # Cart APIs
│   │   ├── orders.ts                # Order APIs
│   │   ├── payments.ts              # Payment APIs
│   │   └── users.ts                 # User APIs
│   ├── store/
│   │   ├── authStore.ts             # Auth state (Zustand)
│   │   ├── cartStore.ts             # Cart state
│   │   ├── wishlistStore.ts         # Wishlist state
│   │   └── appStore.ts              # App settings
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useProducts.ts
│   │   ├── useOrders.ts
│   │   ├── useWishlist.ts
│   │   └── useDebounce.ts
│   ├── utils/
│   │   ├── formatters.ts            # Format price, date, etc.
│   │   ├── validators.ts            # Zod schemas
│   │   ├── storage.ts               # AsyncStorage wrapper
│   │   ├── constants.ts             # App constants
│   │   └── helpers.ts               # Helper functions
│   ├── services/
│   │   ├── notification.ts          # Push notifications
│   │   ├── location.ts              # Location services
│   │   ├── payment.ts               # Payment service
│   │   └── analytics.ts             # Analytics
│   └── types/
│       ├── index.ts
│       ├── product.ts
│       ├── order.ts
│       ├── user.ts
│       └── api.ts
├── assets/
│   ├── images/
│   │   ├── logo.png
│   │   ├── placeholder.png
│   │   └── banners/
│   ├── fonts/
│   └── icons/
├── config/
│   ├── app.config.ts                # Expo config
│   └── env.ts                       # Environment variables
├── .env
├── .env.example
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. Setup & Installation

### 3.1 Initialize Project

```bash
# Create Expo project with TypeScript
npx create-expo-app@latest decan-india-mobile --template expo-template-blank-typescript

cd decan-india-mobile

# Install core dependencies
npm install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# Install NativeWind (Tailwind CSS for React Native)
npm install nativewind tailwindcss
npx tailwindcss init

# Install React Native Paper (Material Design UI)
npm install react-native-paper react-native-vector-icons

# Install state management & API
npm install axios zustand @tanstack/react-query zod react-hook-form @hookform/resolvers

# Install storage
npm install @react-native-async-storage/async-storage expo-secure-store

# Install media & device features
npm install expo-image-picker expo-camera expo-location react-native-maps
npm install expo-notifications expo-local-authentication

# Install utilities
npm install react-native-razorpay date-fns react-native-toast-message
```

### 3.2 Environment Variables

```bash
# .env.example

# API
API_BASE_URL=http://localhost:8000/api
# or
API_BASE_URL=https://api.decanindia.com/api

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx

# Google Maps (for location)
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX

# App Config
APP_NAME=Decan India
APP_VERSION=1.0.0
```

### 3.3 Expo Configuration

```typescript
// app.config.ts

import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Decan India",
  slug: "decan-india",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.decanindia.app"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.decanindia.app",
    permissions: [
      "CAMERA",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "RECEIVE_BOOT_COMPLETED",
      "VIBRATE"
    ]
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-camera",
      {
        "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera"
      }
    ],
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
      }
    ],
    [
      "expo-notifications",
      {
        "icon": "./assets/notification-icon.png",
        "color": "#ffffff"
      }
    ]
  ],
  extra: {
    apiUrl: process.env.API_BASE_URL,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    eas: {
      projectId: "your-project-id"
    }
  }
});
```

### 3.4 NativeWind + React Native Paper Setup

#### Tailwind Configuration

```javascript
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
};
```

#### Babel Configuration

```javascript
// babel.config.js

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

#### Metro Configuration

```javascript
// metro.config.js

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

#### Global CSS

```css
/* global.css */

@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### TypeScript Declarations

```typescript
// nativewind-env.d.ts

/// <reference types="nativewind/types" />
```

#### React Native Paper Theme

```typescript
// lib/theme/paper.ts

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#3B82F6',
    secondary: '#10B981',
    error: '#EF4444',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60A5FA',
    secondary: '#34D399',
    error: '#F87171',
  },
};
```

---

## 4. Navigation Structure

### 4.1 Root Layout

```typescript
// app/_layout.tsx

import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { lightTheme } from '@/lib/theme/paper';
import '../global.css';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <PaperProvider theme={lightTheme}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(shop)" options={{ headerShown: false }} />
            <Stack.Screen name="(checkout)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
          <Toast />
        </QueryClientProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
```

### 4.2 Bottom Tabs Layout

```typescript
// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { Icon } from 'react-native-paper';
import { useCartStore } from '@/lib/store/cartStore';

export default function TabsLayout() {
  const itemCount = useCartStore((state) => state.items.length);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon source="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => (
            <Icon source="view-grid" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <Icon source="cart" color={color} size={size} />
          ),
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon source="account" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

## 5. State Management

### 5.1 Auth Store (Zustand)

```typescript
// lib/store/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  profile_image?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      
      clearAuth: () =>
        set({ user: null, token: null, isAuthenticated: false }),
      
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 5.2 Cart Store

```typescript
// lib/store/cartStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    image: string;
  };
  variant?: {
    variant_name: string;
    price: number;
  };
}

interface CartStore {
  items: CartItem[];
  
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) =>
              i.product_id === item.product_id &&
              i.variant_id === item.variant_id
          );
          
          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += item.quantity;
            return { items: newItems };
          }
          
          return { items: [...state.items, item] };
        }),
      
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        })),
      
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => {
          const price = item.variant?.price || item.product.price;
          return total + price * item.quantity;
        }, 0);
      },
      
      getItemCount: () => {
        const items = get().items;
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## 6. API Integration

### 6.1 API Client Setup

```typescript
// lib/api/client.ts

import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);
```

### 6.2 Product API

```typescript
// lib/api/products.ts

import { apiClient } from './client';

export const productApi = {
  // Get products with filters
  getProducts: async (params: {
    category_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },
  
  // Get single product with variants
  getProduct: async (productId: string) => {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  },
  
  // Get product variants
  getProductVariants: async (productId: string) => {
    const response = await apiClient.get(`/products/${productId}/variants`);
    return response.data;
  },
  
  // Search products
  searchProducts: async (query: string) => {
    const response = await apiClient.get('/products/search', {
      params: { q: query },
    });
    return response.data;
  },
};
```

### 6.3 Cart API

```typescript
// lib/api/cart.ts

import { apiClient } from './client';

export const cartApi = {
  // Get cart
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },
  
  // Add to cart
  addToCart: async (data: {
    product_id: string;
    variant_id?: string;
    quantity: number;
  }) => {
    const response = await apiClient.post('/cart/add', data);
    return response.data;
  },
  
  // Update cart item
  updateCartItem: async (cartItemId: string, quantity: number) => {
    const response = await apiClient.put(`/cart/update/${cartItemId}`, {
      quantity,
    });
    return response.data;
  },
  
  // Remove from cart
  removeFromCart: async (cartItemId: string) => {
    const response = await apiClient.delete(`/cart/remove/${cartItemId}`);
    return response.data;
  },
  
  // Clear cart
  clearCart: async () => {
    const response = await apiClient.delete('/cart/clear');
    return response.data;
  },
  
  // Sync cart (local to server)
  syncCart: async (items: any[]) => {
    const response = await apiClient.post('/cart/sync', { items });
    return response.data;
  },
};
```

---

## 7. Screen Implementation

### 7.1 Product Details Screen

```typescript
// app/(shop)/product/[id].tsx

import { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Chip, ActivityIndicator } from 'react-native-paper';
import { productApi } from '@/lib/api/products';
import { useCartStore } from '@/lib/store/cartStore';
import { VariantSelector } from '@/components/products/VariantSelector';
import { ProductImages } from '@/components/products/ProductImages';
import { RatingStars } from '@/components/products/RatingStars';
import { ReviewItem } from '@/components/reviews/ReviewItem';
import Toast from 'react-native-toast-message';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProduct(id as string),
  });

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (product.has_variants && !selectedVariant) {
      Toast.show({ type: 'error', text1: 'Please select a variant' });
      return;
    }

    addItem({
      id: `${product.id}-${selectedVariant?.id || 'default'}`,
      product_id: product.id,
      variant_id: selectedVariant?.id,
      quantity,
      product: {
        name: product.name,
        price: selectedVariant?.price || product.base_price,
        image: product.primary_image,
      },
      variant: selectedVariant
        ? { variant_name: selectedVariant.variant_name, price: selectedVariant.price }
        : undefined,
    });

    Toast.show({ type: 'success', text1: 'Added to cart!' });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const currentPrice = selectedVariant?.price || product.base_price;
  const originalPrice = selectedVariant?.original_price || product.original_price;
  const stockQty = selectedVariant?.stock_quantity || product.stock_quantity;
  const inStock = stockQty > 0;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Product Images */}
        <ProductImages images={product.images} />

        {/* Product Info */}
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900">{product.name}</Text>
          <Text className="text-sm text-gray-500 mt-1">SKU: {product.sku}</Text>

          {/* Rating */}
          <View className="flex-row items-center mt-2 gap-2">
            <RatingStars rating={product.average_rating} />
            <Text className="text-sm text-gray-600">
              ({product.total_reviews} reviews)
            </Text>
          </View>

          {/* Price */}
          <View className="flex-row items-center mt-4 gap-3">
            <Text className="text-3xl font-bold text-primary">₹{currentPrice}</Text>
            {originalPrice && (
              <>
                <Text className="text-lg text-gray-400 line-through">
                  ₹{originalPrice}
                </Text>
                <Chip mode="flat" compact className="bg-green-100">
                  <Text className="text-green-700 text-xs font-medium">
                    {product.discount_percentage}% OFF
                  </Text>
                </Chip>
              </>
            )}
          </View>

          {/* Variant Selector */}
          {product.has_variants && (
            <VariantSelector
              variants={product.variants}
              selected={selectedVariant}
              onSelect={setSelectedVariant}
            />
          )}

          {/* Stock Status */}
          <View className="mt-4">
            <Chip
              mode="flat"
              icon={inStock ? 'check-circle' : 'close-circle'}
              className={inStock ? 'bg-green-50' : 'bg-red-50'}
            >
              <Text className={inStock ? 'text-green-700' : 'text-red-700'}>
                {inStock ? `In Stock (${stockQty})` : 'Out of Stock'}
              </Text>
            </Chip>
          </View>

          {/* Description */}
          <Text className="text-lg font-semibold text-gray-900 mt-6 mb-2">
            Description
          </Text>
          <Text className="text-base text-gray-600 leading-6">
            {product.description}
          </Text>

          {/* Reviews */}
          <Text className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            Reviews
          </Text>
          {product.reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="p-4 border-t border-gray-200 bg-white">
        <Button
          mode="contained"
          onPress={handleAddToCart}
          disabled={!inStock}
          icon="cart-plus"
          className="rounded-lg"
          contentStyle={{ paddingVertical: 8 }}
        >
          Add to Cart
        </Button>
      </View>
    </View>
  );
}
```

---

## 8. Product Variant Handling ⭐

### 8.1 Variant Selector Component

```typescript
// components/products/VariantSelector.tsx

import { View, Text, Pressable } from 'react-native';
import { Chip } from 'react-native-paper';

interface Variant {
  id: string;
  variant_name: string;
  price: number;
  stock_quantity: number;
}

interface Props {
  variants: Variant[];
  selected: Variant | null;
  onSelect: (variant: Variant) => void;
}

export function VariantSelector({ variants, selected, onSelect }: Props) {
  return (
    <View className="my-4">
      <Text className="text-base font-semibold text-gray-900 mb-3">
        Select Size:
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {variants.map((variant) => {
          const isSelected = selected?.id === variant.id;
          const isDisabled = variant.stock_quantity === 0;

          return (
            <Pressable
              key={variant.id}
              onPress={() => !isDisabled && onSelect(variant)}
              disabled={isDisabled}
              className={`
                border rounded-lg p-3 min-w-[80px] items-center
                ${isSelected ? 'border-primary bg-blue-50' : 'border-gray-200 bg-white'}
                ${isDisabled ? 'opacity-50' : ''}
              `}
            >
              <Text
                className={`
                  text-sm font-medium
                  ${isSelected ? 'text-primary' : 'text-gray-900'}
                  ${isDisabled ? 'line-through' : ''}
                `}
              >
                {variant.variant_name}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                ₹{variant.price}
              </Text>
              {isDisabled && (
                <Text className="text-[10px] text-red-500 mt-0.5">
                  Out of Stock
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {selected && (
        <Chip icon="check" className="mt-3 self-start bg-blue-50">
          <Text className="text-primary text-sm">
            {selected.variant_name} - ₹{selected.price}
          </Text>
        </Chip>
      )}
    </View>
  );
}
```

---

## 9. Payment Integration

### 9.1 Razorpay Setup

```typescript
// lib/services/payment.ts

import RazorpayCheckout from 'react-native-razorpay';
import Constants from 'expo-constants';

interface PaymentOptions {
  amount: number;
  orderId: string;
  orderNumber: string;
  name: string;
  email: string;
  mobile: string;
}

export const paymentService = {
  openRazorpay: async (options: PaymentOptions): Promise<any> => {
    const razorpayKeyId = Constants.expoConfig?.extra?.razorpayKeyId;
    
    const paymentOptions = {
      description: `Order #${options.orderNumber}`,
      image: 'https://your-logo-url.com/logo.png',
      currency: 'INR',
      key: razorpayKeyId,
      amount: options.amount * 100, // Convert to paise
      name: 'Decan India',
      order_id: options.orderId,
      prefill: {
        email: options.email,
        contact: options.mobile,
        name: options.name,
      },
      theme: { color: '#3B82F6' },
    };
    
    try {
      const data = await RazorpayCheckout.open(paymentOptions);
      return {
        success: true,
        paymentId: data.razorpay_payment_id,
        orderId: data.razorpay_order_id,
        signature: data.razorpay_signature,
      };
    } catch (error) {
      return {
        success: false,
        error: error.description || 'Payment failed',
      };
    }
  },
};
```

---

## 10. Week-by-Week Plan

### Week 1-2: Setup & Core (50 hours)
- Day 1-2: Project setup, dependencies
- Day 3-4: Navigation, auth screens
- Day 5-6: Product listing, search
- Day 7-8: Product details with variants ⭐
- Day 9-10: Cart functionality

### Week 3-4: Checkout & Orders (50 hours)
- Day 1-2: Address management
- Day 3-4: Checkout flow
- Day 5-6: Razorpay integration
- Day 7-8: Order history
- Day 9-10: Order tracking

### Week 5-6: Additional Features (45 hours)
- Day 1-2: Wishlist
- Day 3-4: Reviews & ratings
- Day 5-6: Profile management
- Day 7-8: Push notifications
- Day 9-10: Offline mode

### Week 7-8: Polish & Testing (40 hours)
- Day 1-2: UI polish
- Day 3-4: Performance optimization
- Day 5-6: Testing
- Day 7-8: Bug fixes
- Day 9-10: Build & deployment

**Total:** ~185 hours over 8-10 weeks

---

## 11. Build & Deployment

### 11.1 EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### 11.2 OTA Updates

```bash
# Update without rebuilding
eas update --branch production --message "Bug fixes"
```

---

## Summary

This React Native Expo mobile app provides:

✅ **Cross-platform** (iOS & Android)  
✅ **Product variants** support  
✅ **Razorpay** payments  
✅ **Push notifications**  
✅ **Offline mode**  
✅ **Biometric auth**  
✅ **Clean architecture**  

**Ready to build! 🚀**
