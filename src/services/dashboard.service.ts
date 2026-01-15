import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types for Dashboard Data
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  ordersChange: number;
  revenueChange: number;
  usersChange: number;
  productsChange: number;
}

export interface SalesChartData {
  month: string;
  sales: number;
}

export interface OrdersByStatusData {
  status: string;
  count: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    avatar?: string;
  };
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
}

export interface LowStockItem {
  id: string;
  productName: string;
  sku: string;
  currentStock: number;
  threshold: number;
  status: "low" | "critical" | "out_of_stock";
}

// API Service
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    return defaultAxios.get(API_ROUTES.DASHBOARD.STATS);
  },

  getSalesChart: async (): Promise<SalesChartData[]> => {
    return defaultAxios.get(API_ROUTES.DASHBOARD.SALES_CHART);
  },

  getOrdersByStatus: async (): Promise<OrdersByStatusData[]> => {
    return defaultAxios.get(API_ROUTES.DASHBOARD.ORDERS_BY_STATUS);
  },

  getRecentOrders: async (): Promise<RecentOrder[]> => {
    return defaultAxios.get(API_ROUTES.DASHBOARD.RECENT_ORDERS);
  },

  getLowStockAlerts: async (): Promise<LowStockItem[]> => {
    return defaultAxios.get(API_ROUTES.DASHBOARD.LOW_STOCK);
  },
};
