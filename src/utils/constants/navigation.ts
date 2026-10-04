/**
 * Navigation Constants
 * Centralized navigation menu definitions for the e-commerce admin dashboard
 */

import { ROUTES } from "./NavigationRoutes";

// =============================================================================
// TYPES
// =============================================================================

export interface NavSubItem {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
  /** array = any-of; a Super Admin always passes. Omit to inherit the parent's visibility. */
  permission?: string | string[];
}

export interface NavItem {
  name: string;
  icon: string; // Icon component name from icons index
  path?: string;
  subItems?: NavSubItem[];
  /** array = any-of; a Super Admin always passes. Omit for an item visible to any authenticated admin. */
  permission?: string | string[];
  /** Only rendered for a Super Admin, regardless of `permission` (used for leftover template/demo pages). */
  superOnly?: boolean;
}

// =============================================================================
// MAIN NAVIGATION ITEMS
// =============================================================================

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    icon: "GridIcon",
    name: "Dashboard",
    path: ROUTES.DASHBOARD,
    permission: "analytics.view",
  },
  {
    icon: "ListIcon",
    name: "Categories",
    permission: "categories.view",
    subItems: [
      { name: "Add Category", path: ROUTES.CATEGORIES_ADD, permission: "categories.create" },
      { name: "All Categories", path: ROUTES.CATEGORIES },
    ],
  },
  {
    icon: "BoxIconLine",
    name: "Brands",
    path: ROUTES.BRANDS,
    permission: "brands.view",
  },
  {
    icon: "BoxCubeIcon",
    name: "Products",
    permission: "products.view",
    subItems: [
      { name: "Add Product", path: ROUTES.PRODUCTS_ADD, permission: "products.create" },
      { name: "All Products", path: ROUTES.PRODUCTS },
    ],
  },
  {
    icon: "TaskIcon",
    name: "Orders",
    path: ROUTES.ORDERS,
    permission: "orders.view",
  },
    {
    icon: "HeartIcon",
    name: "Wishlists",
    path: ROUTES.WISHLISTS,
    permission: "wishlist.view",
  },
  {
    icon: "GroupIcon",
    name: "Users",
    path: ROUTES.USERS,
    permission: "customers.view",
  },
  {
    icon: "ChatIcon",
    name: "Reviews",
    path: ROUTES.REVIEWS,
    permission: "reviews.view",
  },
  {
    icon: "DollarLineIcon",
    name: "Coupons",
    permission: "coupons.view",
    subItems: [
      { name: "Add Coupon", path: ROUTES.COUPONS_ADD, permission: "coupons.create" },
      { name: "All Coupons", path: ROUTES.COUPONS },
    ],
  },
  {
    icon: "BoxIconLine",
    name: "Inventory",
    permission: "inventory.view",
    subItems: [
      { name: "Overview", path: ROUTES.INVENTORY },
      { name: "Stock Management", path: ROUTES.INVENTORY_STOCK },
    ],
  },
  {
    icon: "PieChartIcon",
    name: "Reports",
    path: ROUTES.REPORTS,
    permission: "analytics.view",
  },
  {
    icon: "TableIcon",
    name: "POS",
    path: ROUTES.POS,
    permission: "pos.view",
  },
  {
    icon: "PageIcon",
    name: "Banners",
    permission: "banners.view",
    subItems: [
      { name: "Add Banner", path: ROUTES.BANNERS_ADD, permission: "banners.create" },
      { name: "All Banners", path: ROUTES.BANNERS },
    ],
  },
  {
    icon: "LockIcon",
    name: "Settings",
    // Task 21 builds the Admin Access screen; the link is only visible to
    // an admin who could actually use it.
    permission: ["admin_access.view", "audit_log.view"],
    subItems: [
      { name: "Admin Access", path: ROUTES.SETTINGS_ADMIN_ACCESS },
    ],
  },
];

// =============================================================================
// OTHER NAVIGATION ITEMS
// =============================================================================

export const OTHER_NAV_ITEMS: NavItem[] = [
  {
    icon: "UserCircleIcon",
    name: "Profile",
    path: ROUTES.PROFILE,
  },
];

// =============================================================================
// MENU LABELS
// =============================================================================

export const MENU_LABELS = {
  MAIN: "Menu",
  OTHERS: "Others",
} as const;

// =============================================================================
// BREADCRUMB ITEMS
// =============================================================================

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export const BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  [ROUTES.DASHBOARD]: [{ label: "Dashboard" }],
  [ROUTES.CATEGORIES]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "All Categories" },
  ],
  [ROUTES.CATEGORIES_ADD]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Categories", path: ROUTES.CATEGORIES },
    { label: "Add Category" },
  ],
  [ROUTES.BRANDS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Brands" },
  ],
  [ROUTES.PRODUCTS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "All Products" },
  ],
  [ROUTES.PRODUCTS_ADD]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Products", path: ROUTES.PRODUCTS },
    { label: "Add Product" },
  ],
  [ROUTES.ORDERS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Orders" },
  ],
  [ROUTES.USERS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Users" },
  ],
  [ROUTES.REVIEWS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Reviews" },
  ],
  [ROUTES.COUPONS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "All Coupons" },
  ],
  [ROUTES.COUPONS_ADD]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Coupons", path: ROUTES.COUPONS },
    { label: "Add Coupon" },
  ],
  [ROUTES.INVENTORY]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Inventory Overview" },
  ],
  [ROUTES.INVENTORY_STOCK]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Inventory", path: ROUTES.INVENTORY },
    { label: "Stock Management" },
  ],
  [ROUTES.REPORTS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Reports" },
  ],
  [ROUTES.POS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Point of Sale" },
  ],
  [ROUTES.BANNERS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "All Banners" },
  ],
  [ROUTES.BANNERS_ADD]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Banners", path: ROUTES.BANNERS },
    { label: "Add Banner" },
  ],
  [ROUTES.WISHLISTS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Wishlists" },
  ],
  [ROUTES.PROFILE]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Profile" },
  ],
};

// =============================================================================
// PAGE TITLES
// =============================================================================

export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Dashboard",
  [ROUTES.CATEGORIES]: "All Categories",
  [ROUTES.CATEGORIES_ADD]: "Add Category",
  [ROUTES.BRANDS]: "Brands",
  [ROUTES.PRODUCTS]: "All Products",
  [ROUTES.PRODUCTS_ADD]: "Add Product",
  [ROUTES.ORDERS]: "Orders",
  [ROUTES.USERS]: "Users",
  [ROUTES.REVIEWS]: "Reviews",
  [ROUTES.COUPONS]: "All Coupons",
  [ROUTES.COUPONS_ADD]: "Add Coupon",
  [ROUTES.INVENTORY]: "Inventory Overview",
  [ROUTES.INVENTORY_STOCK]: "Stock Management",
  [ROUTES.REPORTS]: "Reports",
  [ROUTES.POS]: "Point of Sale",
  [ROUTES.BANNERS]: "All Banners",
  [ROUTES.BANNERS_ADD]: "Add Banner",
  [ROUTES.WISHLISTS]: "Wishlists",
  [ROUTES.PROFILE]: "Profile",
  [ROUTES.SIGN_IN]: "Sign In",
  [ROUTES.SIGN_UP]: "Sign Up",
  [ROUTES.ERROR_404]: "Page Not Found",
};

// =============================================================================
// SIDEBAR CONFIG
// =============================================================================

export const SIDEBAR_CONFIG = {
  EXPANDED_WIDTH: 260,
  COLLAPSED_WIDTH: 80,
  MOBILE_BREAKPOINT: 768,
  TRANSITION_DURATION: 300,
} as const;

// =============================================================================
// HEADER CONFIG
// =============================================================================

export const HEADER_CONFIG = {
  HEIGHT: 64,
  SEARCH_SHORTCUT: "Cmd+K",
  SEARCH_SHORTCUT_WINDOWS: "Ctrl+K",
} as const;
