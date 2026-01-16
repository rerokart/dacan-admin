"use client";

import { useQuery } from "@tanstack/react-query";
import {
  analyticsService,
  type SalesFilters,
} from "@/services/analytics.service";

// Query keys
export const analyticsKeys = {
  all: ["analytics"] as const,
  dashboard: () => [...analyticsKeys.all, "dashboard"] as const,
  sales: () => [...analyticsKeys.all, "sales"] as const,
  salesReport: (filters: SalesFilters) =>
    [...analyticsKeys.sales(), filters] as const,
};

// Get Analytics Dashboard
export const useAnalyticsDashboard = () => {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => analyticsService.getDashboard(),
  });
};

// Get Sales Analytics
export const useSalesAnalytics = (filters: SalesFilters) => {
  return useQuery({
    queryKey: analyticsKeys.salesReport(filters),
    queryFn: () => analyticsService.getSalesAnalytics(filters),
    enabled: !!filters.start_date && !!filters.end_date,
  });
};
