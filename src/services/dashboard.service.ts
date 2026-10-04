import { defaultAxios } from "@/utils/axios/default.axios";
import { inventoryService } from "@/services/inventory.service";
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
  status: "low_stock" | "out_of_stock";
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
    const res = await inventoryService.getStockLevels({
      status: "low_stock,out_of_stock",
      limit: 5,
    });
    return res.inventory.map((item) => ({
      id: `${item.type}-${item.id}`,
      productName: item.variant_info ? `${item.name} - ${item.variant_info}` : item.name,
      sku: item.sku,
      currentStock: item.stock_quantity,
      threshold: item.low_stock_threshold,
      status: item.stock_status === "out_of_stock" ? "out_of_stock" : "low_stock",
    }));
  },
};
