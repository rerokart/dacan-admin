export const API_ROUTES = {
  // Auth
  AUTH: {
    LOGIN: "auth/login",
    REGISTER: "auth/register",
    LOGOUT: "auth/logout",
    REFRESH: "auth/refresh",
    FORGOT_PASSWORD: "auth/forgot-password",
    RESET_PASSWORD: "auth/reset-password",
  },

  // Categories
  CATEGORIES: {
    LIST: "categories",
    CREATE: "categories",
    GET: (id: string | number) => `categories/${id}`,
    UPDATE: (id: string | number) => `categories/${id}`,
    DELETE: (id: string | number) => `categories/${id}`,
    PRODUCTS: (id: string | number) => `categories/${id}/products`,
  },

  // Products
  PRODUCTS: {
    LIST: "products",
    CREATE: "products",
    GET: (id: string | number) => `products/${id}`,
    UPDATE: (id: string | number) => `products/${id}`,
    DELETE: (id: string | number) => `products/${id}`,
    SEARCH: "products/search",
    FEATURED: "products/featured",
    LATEST: "products/latest",
    VARIANTS: (id: string | number) => `products/${id}/variants`,
    VARIANT: (productId: string | number, variantId: string | number) =>
      `products/${productId}/variants/${variantId}`,
    UPLOAD_IMAGE: "products/upload-image",
    IMAGES: (id: string | number) => `products/${id}/images`,
    IMAGE: (productId: string | number, imageId: string | number) =>
      `products/${productId}/images/${imageId}`,
    REVIEWS: (id: string | number) => `products/${id}/reviews`,
  },

  // Orders
  ORDERS: {
    LIST: "orders",
    CREATE: "orders",
    GET: (id: string | number) => `orders/${id}`,
    UPDATE: (id: string | number) => `orders/${id}`,
    DELETE: (id: string | number) => `orders/${id}`,
    UPDATE_STATUS: (id: string | number) => `orders/${id}/status`,
    CANCEL: (id: string | number) => `orders/${id}/cancel`,
    UPDATE_PAYMENT: (id: string | number) => `orders/${id}/payment`,
    INVOICE: (id: string | number) => `orders/${id}/invoice`,
    OFFLINE: "orders/offline",
  },

  // Users
  USERS: {
    LIST: "users",
    GET: (id: string | number) => `users/${id}`,
    UPDATE: (id: string | number) => `users/${id}`,
    BLOCK: (id: string | number) => `users/${id}/block`,
    PROFILE: "users/profile",
  },

  // Dashboard
  DASHBOARD: {
    STATS: "dashboard/stats",
    RECENT_ORDERS: "dashboard/recent-orders",
    SALES_CHART: "dashboard/sales-chart",
    ORDERS_BY_STATUS: "dashboard/orders-by-status",
    LOW_STOCK: "dashboard/low-stock",
  },

  // Coupons
  COUPONS: {
    LIST: "coupons",
    CREATE: "coupons",
    GET: (id: string | number) => `coupons/${id}`,
    UPDATE: (id: string | number) => `coupons/${id}`,
    DELETE: (id: string | number) => `coupons/${id}`,
    VALIDATE: "coupons/validate",
  },

  // Inventory
  INVENTORY: {
    OVERVIEW: "inventory",
    STOCK_LEVELS: "inventory/stock",
    UPDATE_STOCK: "inventory/update",
    HISTORY: "inventory/history",
  },

  // Reviews
  REVIEWS: {
    LIST: "reviews",
    CREATE: "reviews/add",
    GET: (id: string | number) => `reviews/${id}`,
    UPDATE: (id: string | number) => `reviews/${id}`,
    DELETE: (id: string | number) => `reviews/${id}`,
    APPROVE: (id: string | number) => `reviews/${id}/approve`,
    REJECT: (id: string | number) => `reviews/${id}/reject`,
    IMAGES: (id: string | number) => `reviews/${id}/images`,
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: "analytics/dashboard",
    SALES: "analytics/sales",
  },

  // POS
  POS: {
    PRODUCTS: "pos/products",
    CUSTOMERS: "pos/customers",
    CREATE_CUSTOMER: "pos/customers",
  },

  // Banners
  BANNERS: {
    LIST: "banners",
    CREATE: "banners",
    GET: (id: string | number) => `banners/${id}`,
    UPDATE: (id: string | number) => `banners/${id}`,
    DELETE: (id: string | number) => `banners/${id}`,
    REORDER: "banners/reorder",
  },

  // Wishlists
  WISHLISTS: {
    LIST: "wishlists",
  },

  // Payments
  PAYMENTS: {
    CREATE_ORDER: "payments/create-order",
    VERIFY: "payments/verify",
    COD: "payments/cod",
  },
} as const;
