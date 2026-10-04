import { useQuery } from "@tanstack/react-query";
import {
  dashboardService,
  type DashboardStats,
  type SalesChartData,
  type OrdersByStatusData,
  type RecentOrder,
  type DashboardResponse,
} from "@/services/dashboard.service";

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: () => [...dashboardKeys.all, "overview"] as const,
  salesChart: () => [...dashboardKeys.all, "salesChart"] as const,
  lowStock: () => [...dashboardKeys.all, "lowStock"] as const,
};

// Hooks
// stats, recent orders and orders-by-status share one query (analytics/dashboard).
const useDashboardOverview = <T,>(select: (res: DashboardResponse) => T) =>
  useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: () => dashboardService.getDashboard(),
    select,
  });

export const useDashboardStats = () =>
  useDashboardOverview<DashboardStats>(dashboardService.mapStats);

export const useRecentOrders = () =>
  useDashboardOverview<RecentOrder[]>(dashboardService.mapRecentOrders);

export const useOrdersByStatus = () =>
  useDashboardOverview<OrdersByStatusData[]>(dashboardService.mapOrdersByStatus);

export const useSalesChart = () =>
  useQuery({
    queryKey: dashboardKeys.salesChart(),
    queryFn: () => dashboardService.getSalesChart(),
  });

export const useLowStockAlerts = () => {
  return useQuery({
    queryKey: dashboardKeys.lowStock(),
    queryFn: () => dashboardService.getLowStockAlerts(),
  });
};
