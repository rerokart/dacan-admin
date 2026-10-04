export const API_ROUTES = {
  // Auth
  AUTH: {
    LOGIN: "auth/login",
    LOGOUT: "auth/logout",
    LOGOUT_ALL: "auth/logout-all",
    ME: "auth/me",
    SESSIONS: "auth/sessions",
    SESSION: (id: string | number) => `auth/sessions/${id}`,
    FORGOT_PASSWORD: "auth/forgot-password",
    VERIFY_OTP: "auth/verify-otp",
    RESET_PASSWORD: "auth/reset-password",
    CHANGE_PASSWORD: "auth/change-password",
    INVITATION: (token: string) => `auth/invitations/${token}`,
    ACCEPT_INVITATION: "auth/invitations/accept",
  },

  // Admins (admin user management)
  ADMINS: {
    LIST: "admins",
    GET: (id: string | number) => `admins/${id}`,
    INVITE: "admins/invite",
    RESEND: (id: string | number) => `admins/${id}/resend-invite`,
    REVOKE_INVITE: (id: string | number) => `admins/${id}/invite`,
    UPDATE: (id: string | number) => `admins/${id}`,
    SUSPEND: (id: string | number) => `admins/${id}/suspend`,
    REACTIVATE: (id: string | number) => `admins/${id}/reactivate`,
    ARCHIVE: (id: string | number) => `admins/${id}/archive`,
    REVOKE_SESSIONS: (id: string | number) => `admins/${id}/sessions`,
  },

  // Roles & permissions
  ROLES: {
    LIST: "roles",
    PERMISSIONS: "permissions",
    UPDATE_PERMISSIONS: (id: string | number) => `roles/${id}/permissions`,
  },

  // Audit log & login history
  AUDIT: {
    LIST: "audit-log",
    EXPORT: "audit-log/export",
    VERIFY: "audit-log/verify",
    LOGIN_HISTORY: "login-history",
  },

  // Categories
  CATEGORIES: {
    LIST: "categories",
    CREATE: "categories",
    GET: (id: string | number) => `categories/${id}`,
    UPDATE: (id: string | number) => `categories/${id}`,
    DELETE: (id: string | number) => `categories/${id}`,
    PRODUCTS: (id: string | number) => `categories/${id}/products`,
    ARCHIVE: (id: string | number) => `categories/${id}/archive`,
    RESTORE: (id: string | number) => `categories/${id}/restore`,
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
    UPDATE_PAYMENT: (id: string | number) => `orders/${id}/payment`,
    INVOICE: (id: string | number) => `orders/${id}/invoice`,
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
    // STATS / RECENT_ORDERS / ORDERS_BY_STATUS are all served by one call.
    STATS: "analytics/dashboard",
    RECENT_ORDERS: "analytics/dashboard",
    SALES_CHART: "analytics/sales",
    ORDERS_BY_STATUS: "analytics/dashboard",
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
    OVERVIEW: "inventory/overview",
    STOCK_LEVELS: "inventory",
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
    CREATE_ORDER: "pos/orders/offline",
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
