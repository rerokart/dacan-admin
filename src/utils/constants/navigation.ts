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
}

export interface NavItem {
  name: string;
  icon: string; // Icon component name from icons index
  path?: string;
  subItems?: NavSubItem[];
}

// =============================================================================
// MAIN NAVIGATION ITEMS
// =============================================================================

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    icon: "GridIcon",
    name: "Dashboard",
    path: ROUTES.DASHBOARD,
  },
  {
    icon: "ListIcon",
    name: "Categories",
    subItems: [
      { name: "Add Category", path: ROUTES.CATEGORIES_ADD },
      { name: "All Categories", path: ROUTES.CATEGORIES },
    ],
  },
  {
    icon: "BoxCubeIcon",
    name: "Products",
    subItems: [
      { name: "Add Product", path: ROUTES.PRODUCTS_ADD },
      { name: "All Products", path: ROUTES.PRODUCTS },
    ],
  },
  {
    icon: "TaskIcon",
    name: "Orders",
    path: ROUTES.ORDERS,
  },
  {
    icon: "GroupIcon",
    name: "Users",
    path: ROUTES.USERS,
  },
  {
    icon: "ChatIcon",
    name: "Reviews",
    path: ROUTES.REVIEWS,
  },
  {
    icon: "DollarLineIcon",
    name: "Coupons",
    subItems: [
      { name: "Add Coupon", path: ROUTES.COUPONS_ADD },
      { name: "All Coupons", path: ROUTES.COUPONS },
    ],
  },
  {
    icon: "BoxIconLine",
    name: "Inventory",
    subItems: [
      { name: "Overview", path: ROUTES.INVENTORY },
      { name: "Stock Management", path: ROUTES.INVENTORY_STOCK },
    ],
  },
  {
    icon: "PieChartIcon",
    name: "Reports",
    path: ROUTES.REPORTS,
  },
  {
    icon: "TableIcon",
    name: "POS",
    path: ROUTES.POS,
  },
  {
    icon: "PageIcon",
    name: "Banners",
    subItems: [
      { name: "Add Banner", path: ROUTES.BANNERS_ADD },
      { name: "All Banners", path: ROUTES.BANNERS },
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
  {
    icon: "PieChartIcon",
    name: "Demo Pages",
    subItems: [
      { name: "Charts", path: ROUTES.DEMO.CHARTS.BAR },
      { name: "Forms", path: ROUTES.DEMO.FORMS },
      { name: "Tables", path: ROUTES.DEMO.TABLES },
      { name: "Calendar", path: ROUTES.DEMO.CALENDAR },
      { name: "UI Elements", path: ROUTES.DEMO.UI_ELEMENTS.BUTTONS },
    ],
  },
  {
    icon: "PlugInIcon",
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: ROUTES.SIGN_IN },
      { name: "Sign Up", path: ROUTES.SIGN_UP },
    ],
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
  [ROUTES.PROFILE]: "Profile",
  [ROUTES.SIGN_IN]: "Sign In",
  [ROUTES.SIGN_UP]: "Sign Up",
  [ROUTES.ERROR_404]: "Page Not Found",
};

// =============================================================================
// SIDEBAR CONFIG
// =============================================================================

export const SIDEBAR_CONFIG = {
  EXPANDED_WIDTH: 290,
  COLLAPSED_WIDTH: 90,
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
