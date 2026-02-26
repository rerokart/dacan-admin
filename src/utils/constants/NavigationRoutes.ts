/**
 * Application Routes Constants
 * Centralized route definitions for the e-commerce admin dashboard
 */

// =============================================================================
// ROUTE PATHS
// =============================================================================

export const ROUTES = {
  // Main Routes
  HOME: "/",
  DASHBOARD: "/",

  // Categories
  CATEGORIES: "/categories",
  CATEGORIES_ADD: "/categories/add",
  CATEGORIES_EDIT: (id: string | number) => `/categories/${id}/edit`,

  // Products
  PRODUCTS: "/products",
  PRODUCTS_ADD: "/products/add",
  PRODUCTS_EDIT: (id: string | number) => `/products/${id}/edit`,

  // Orders
  ORDERS: "/orders",
  ORDERS_DETAIL: (id: string | number) => `/orders/${id}`,

  // Users
  USERS: "/users",
  USERS_DETAIL: (id: string | number) => `/users/${id}`,

  // Reviews
  REVIEWS: "/reviews",

  // Coupons
  COUPONS: "/coupons",
  COUPONS_ADD: "/coupons/add",
  COUPONS_EDIT: (id: string | number) => `/coupons/${id}/edit`,

  // Inventory
  INVENTORY: "/inventory",
  INVENTORY_STOCK: "/inventory/stock",

  // Reports
  REPORTS: "/reports",

  // POS
  POS: "/pos",

  // Banners
  BANNERS: "/banners",
  BANNERS_ADD: "/banners/add",
  BANNERS_EDIT: (id: string | number) => `/banners/${id}/edit`,

  // Wishlists
  WISHLISTS: "/wishlists",

  // User
  PROFILE: "/profile",

  // Authentication
  SIGN_IN: "/signin",
  SIGN_UP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Error Pages
  ERROR_404: "/error-404",
  ERROR_500: "/error-500",

  // Demo Pages
  DEMO: {
    CHARTS: {
      BAR: "/charts/bar-chart",
      LINE: "/charts/line-chart",
    },
    FORMS: "/forms/form-elements",
    TABLES: "/tables/basic-tables",
    CALENDAR: "/calendar",
    BLANK: "/blank",
    UI_ELEMENTS: {
      ALERTS: "/ui-elements/alerts",
      AVATARS: "/ui-elements/avatars",
      BADGE: "/ui-elements/badge",
      BUTTONS: "/ui-elements/buttons",
      IMAGES: "/ui-elements/images",
      MODALS: "/ui-elements/modals",
      VIDEOS: "/ui-elements/videos",
    },
  },
} as const;

// =============================================================================
// AUTHENTICATION ROUTES - Routes that require authentication
// =============================================================================

export const AUTHENTICATED_ROUTES: string[] = [
  ROUTES.DASHBOARD,
  ROUTES.CATEGORIES,
  ROUTES.CATEGORIES_ADD,
  ROUTES.PRODUCTS,
  ROUTES.PRODUCTS_ADD,
  ROUTES.ORDERS,
  ROUTES.USERS,
  ROUTES.REVIEWS,
  ROUTES.COUPONS,
  ROUTES.COUPONS_ADD,
  ROUTES.INVENTORY,
  ROUTES.INVENTORY_STOCK,
  ROUTES.REPORTS,
  ROUTES.POS,
  ROUTES.BANNERS,
  ROUTES.BANNERS_ADD,
  ROUTES.WISHLISTS,
  ROUTES.PROFILE,
  ROUTES.DEMO.CHARTS.BAR,
  ROUTES.DEMO.CHARTS.LINE,
  ROUTES.DEMO.FORMS,
  ROUTES.DEMO.TABLES,
  ROUTES.DEMO.CALENDAR,
  ROUTES.DEMO.BLANK,
  ROUTES.DEMO.UI_ELEMENTS.ALERTS,
  ROUTES.DEMO.UI_ELEMENTS.AVATARS,
  ROUTES.DEMO.UI_ELEMENTS.BADGE,
  ROUTES.DEMO.UI_ELEMENTS.BUTTONS,
  ROUTES.DEMO.UI_ELEMENTS.IMAGES,
  ROUTES.DEMO.UI_ELEMENTS.MODALS,
  ROUTES.DEMO.UI_ELEMENTS.VIDEOS,
];

// =============================================================================
// UNAUTHENTICATED ROUTES - Public routes that don't require authentication
// =============================================================================

export const UNAUTHENTICATED_ROUTES: string[] = [
  ROUTES.SIGN_IN,
  ROUTES.SIGN_UP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.ERROR_404,
  ROUTES.ERROR_500,
];

// =============================================================================
// ROUTE GROUPS
// =============================================================================

export const AUTH_ROUTES = [ROUTES.SIGN_IN, ROUTES.SIGN_UP] as const;

export const ERROR_ROUTES = [ROUTES.ERROR_404, ROUTES.ERROR_500] as const;

export const DEMO_ROUTES = [
  ROUTES.DEMO.CHARTS.BAR,
  ROUTES.DEMO.CHARTS.LINE,
  ROUTES.DEMO.FORMS,
  ROUTES.DEMO.TABLES,
  ROUTES.DEMO.CALENDAR,
  ROUTES.DEMO.BLANK,
  ...Object.values(ROUTES.DEMO.UI_ELEMENTS),
] as const;


/**
 * Check if a route requires authentication
 */
export const isAuthenticatedRoute = (path: string): boolean => {
  return AUTHENTICATED_ROUTES.some(
    (route) => path === route || path.startsWith(route + "/")
  );
};

/**
 * Check if a route is public (unauthenticated)
 */
export const isPublicRoute = (path: string): boolean => {
  return UNAUTHENTICATED_ROUTES.some(
    (route) => path === route || path.startsWith(route + "/")
  );
};

/**
 * Get redirect path after login
 */
export const getPostLoginRedirect = (): string => {
  return ROUTES.DASHBOARD;
};

/**
 * Get redirect path when not authenticated
 */
export const getLoginRedirect = (): string => {
  return ROUTES.SIGN_IN;
};
