import { defaultAxios } from "@/utils/axios/default.axios";
import { inventoryService } from "@/services/inventory.service";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types for Dashboard Data
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  // Backend has no period comparison yet; hidden in the UI when missing.
  ordersChange?: number;
  revenueChange?: number;
  usersChange?: number;
  productsChange?: number;
}

export interface SalesChartData {
  month: string;
  sales: number;
}

export interface OrdersByStatusData {
  status: string;
  count: number;
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "rejected"
  | "cancelled";

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    avatar?: string;
  };
  amount: number;
  status: OrderStatus;
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

// Raw backend payloads
export interface DashboardResponse {
  overview: {
    total_users: number;
    total_products: number;
    total_orders: number;
    total_revenue: number;
  };
  recent_orders: {
    id: string;
    order_number: string;
    total_amount: number;
    order_status: OrderStatus;
    created_at: string;
    customer_name: string | null;
  }[];
  orders_by_status: { status: string; count: number }[];
}

interface SalesResponse {
  revenue_by_period: { period: string; revenue: number; orders: number }[];
}

const pad = (n: number) => String(n).padStart(2, "0");
const toYmd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// "2026-03" -> "Mar 2026"
const formatPeriod = (period: string) => {
  const [year, month] = period.split("-").map(Number);
  if (!year || !month) return period;
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

// API Service
export const dashboardService = {
  // One call feeds stats, recent orders and orders-by-status.
  getDashboard: async (): Promise<DashboardResponse> => {
    return defaultAxios.get(API_ROUTES.DASHBOARD.STATS);
  },

  mapStats: (res: DashboardResponse): DashboardStats => ({
    totalOrders: Number(res.overview.total_orders) || 0,
    totalRevenue: Number(res.overview.total_revenue) || 0,
    totalUsers: Number(res.overview.total_users) || 0,
    totalProducts: Number(res.overview.total_products) || 0,
  }),

  mapRecentOrders: (res: DashboardResponse): RecentOrder[] =>
    (res.recent_orders ?? []).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customer: { name: o.customer_name || "Guest" },
      amount: Number(o.total_amount) || 0,
      status: o.order_status,
      date: o.created_at,
    })),

  mapOrdersByStatus: (res: DashboardResponse): OrdersByStatusData[] =>
    (res.orders_by_status ?? []).map((s) => ({
      status: s.status,
      count: Number(s.count) || 0,
    })),

  getSalesChart: async (): Promise<SalesChartData[]> => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
    const res: SalesResponse = await defaultAxios.get(
      API_ROUTES.DASHBOARD.SALES_CHART,
      {
        params: {
          start_date: toYmd(start),
          end_date: toYmd(end),
          group_by: "month",
        },
      }
    );
    return (res.revenue_by_period ?? []).map((p) => ({
      month: formatPeriod(p.period),
      sales: Number(p.revenue) || 0,
    }));
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
      threshold: item.reorder_level ?? item.low_stock_threshold ?? 0,
      status: item.stock_status === "out_of_stock" ? "out_of_stock" : "low_stock",
    }));
  },
};
