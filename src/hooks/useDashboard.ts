import { useQuery } from "@tanstack/react-query";
import {
  dashboardService,
  type DashboardStats,
  type SalesChartData,
  type OrdersByStatusData,
  type RecentOrder,
} from "@/services/dashboard.service";

// Dummy data for development/fallback
const DUMMY_STATS: DashboardStats = {
  totalOrders: 1248,
  totalRevenue: 245890,
  totalUsers: 3456,
  totalProducts: 892,
  ordersChange: 12.5,
  revenueChange: 8.2,
  usersChange: 15.3,
  productsChange: -2.1,
};

const DUMMY_SALES_CHART: SalesChartData[] = [
  { month: "Jan", sales: 45000 },
  { month: "Feb", sales: 52000 },
  { month: "Mar", sales: 48000 },
  { month: "Apr", sales: 61000 },
  { month: "May", sales: 55000 },
  { month: "Jun", sales: 67000 },
  { month: "Jul", sales: 72000 },
  { month: "Aug", sales: 69000 },
  { month: "Sep", sales: 78000 },
  { month: "Oct", sales: 82000 },
  { month: "Nov", sales: 91000 },
  { month: "Dec", sales: 98000 },
];

const DUMMY_ORDERS_BY_STATUS: OrdersByStatusData[] = [
  { status: "Pending", count: 45 },
  { status: "Processing", count: 78 },
  { status: "Shipped", count: 156 },
  { status: "Delivered", count: 892 },
  { status: "Cancelled", count: 23 },
];

const DUMMY_RECENT_ORDERS: RecentOrder[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customer: { name: "Rahul Sharma" },
    amount: 2499,
    status: "delivered",
    date: "2024-01-15",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customer: { name: "Priya Patel" },
    amount: 1899,
    status: "shipped",
    date: "2024-01-15",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customer: { name: "Amit Kumar" },
    amount: 3299,
    status: "processing",
    date: "2024-01-14",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customer: { name: "Sneha Reddy" },
    amount: 4599,
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    customer: { name: "Vikram Singh" },
    amount: 999,
    status: "delivered",
    date: "2024-01-13",
  },
];

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  salesChart: () => [...dashboardKeys.all, "salesChart"] as const,
  ordersByStatus: () => [...dashboardKeys.all, "ordersByStatus"] as const,
  recentOrders: () => [...dashboardKeys.all, "recentOrders"] as const,
  lowStock: () => [...dashboardKeys.all, "lowStock"] as const,
};

// Hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      try {
        const data = await dashboardService.getStats();
        return data;
      } catch {
        // Return dummy data if API fails
        return DUMMY_STATS;
      }
    },
    placeholderData: DUMMY_STATS,
  });
};

export const useSalesChart = () => {
  return useQuery({
    queryKey: dashboardKeys.salesChart(),
    queryFn: async () => {
      try {
        const data = await dashboardService.getSalesChart();
        return data;
      } catch {
        return DUMMY_SALES_CHART;
      }
    },
    placeholderData: DUMMY_SALES_CHART,
  });
};

export const useOrdersByStatus = () => {
  return useQuery({
    queryKey: dashboardKeys.ordersByStatus(),
    queryFn: async () => {
      try {
        const data = await dashboardService.getOrdersByStatus();
        return data;
      } catch {
        return DUMMY_ORDERS_BY_STATUS;
      }
    },
    placeholderData: DUMMY_ORDERS_BY_STATUS,
  });
};

export const useRecentOrders = () => {
  return useQuery({
    queryKey: dashboardKeys.recentOrders(),
    queryFn: async () => {
      try {
        const data = await dashboardService.getRecentOrders();
        return data;
      } catch {
        return DUMMY_RECENT_ORDERS;
      }
    },
    placeholderData: DUMMY_RECENT_ORDERS,
  });
};

export const useLowStockAlerts = () => {
  return useQuery({
    queryKey: dashboardKeys.lowStock(),
    queryFn: () => dashboardService.getLowStockAlerts(),
  });
};
