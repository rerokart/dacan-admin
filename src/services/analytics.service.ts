import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export interface AnalyticsDashboard {
  orders: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  revenue: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  total_users: number;
  total_products: number;
  low_stock_count: number;
  pending_orders: number;
  orders_change: number;
  revenue_change: number;
  users_change: number;
}

export interface SalesDataPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface SalesByCategory {
  category_id: string;
  category_name: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  sku: string;
  quantity_sold: number;
  revenue: number;
  image_url?: string;
}

export interface SalesAnalytics {
  summary: {
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
    revenue_change: number;
    orders_change: number;
  };
  sales_by_period: SalesDataPoint[];
  sales_by_category: SalesByCategory[];
  top_products: TopProduct[];
}

export interface SalesFilters {
  start_date: string;
  end_date: string;
  group_by?: "day" | "week" | "month";
}

// Service
export const analyticsService = {
  getDashboard: async (): Promise<AnalyticsDashboard> => {
    return defaultAxios.get(API_ROUTES.ANALYTICS.DASHBOARD);
  },

  getSalesAnalytics: async (filters: SalesFilters): Promise<SalesAnalytics> => {
    const params = new URLSearchParams();
    params.append("start_date", filters.start_date);
    params.append("end_date", filters.end_date);
    if (filters.group_by) params.append("group_by", filters.group_by);
    return defaultAxios.get(`${API_ROUTES.ANALYTICS.SALES}?${params.toString()}`);
  },
};

// Re-export shared helpers
export { formatCurrency } from "@/utils/helpers/helperfn";

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-IN").format(num);
};

export const formatPercentage = (num: number): string => {
  return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
};

export const getDateRangePresets = () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  return {
    today: {
      start: today.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    },
    week: {
      start: startOfWeek.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    },
    month: {
      start: startOfMonth.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    },
    year: {
      start: startOfYear.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    },
  };
};

export default analyticsService;
