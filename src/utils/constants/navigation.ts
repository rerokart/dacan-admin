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
