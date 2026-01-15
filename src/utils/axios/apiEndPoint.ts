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
  },

  // Products
  PRODUCTS: {
    LIST: "products",
    CREATE: "products",
    GET: (id: string | number) => `products/${id}`,
    UPDATE: (id: string | number) => `products/${id}`,
    DELETE: (id: string | number) => `products/${id}`,
  },

  // Orders
  ORDERS: {
    LIST: "orders",
    CREATE: "orders",
    GET: (id: string | number) => `orders/${id}`,
    UPDATE: (id: string | number) => `orders/${id}`,
    DELETE: (id: string | number) => `orders/${id}`,
  },

  // Users
  USERS: {
    LIST: "users",
    GET: (id: string | number) => `users/${id}`,
    UPDATE: (id: string | number) => `users/${id}`,
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
} as const;
