"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inventoryService,
  type StockFilters,
  type UpdateStockRequest,
} from "@/services/inventory.service";
import { useToast } from "@/components/ui/toast";

// Query keys
export const inventoryKeys = {
  all: ["inventory"] as const,
  overview: () => [...inventoryKeys.all, "overview"] as const,
  stockLevels: () => [...inventoryKeys.all, "stock"] as const,
  stockLevel: (filters?: StockFilters) =>
    [...inventoryKeys.stockLevels(), filters] as const,
  history: () => [...inventoryKeys.all, "history"] as const,
  productHistory: (productId?: string, variantId?: string) =>
    [...inventoryKeys.history(), productId, variantId] as const,
};

// Get Inventory Overview
export const useInventoryOverview = () => {
  return useQuery({
    queryKey: inventoryKeys.overview(),
    queryFn: () => inventoryService.getOverview(),
  });
};

// Get Stock Levels
export const useStockLevels = (filters?: StockFilters) => {
  return useQuery({
    queryKey: inventoryKeys.stockLevel(filters),
    queryFn: () => inventoryService.getStockLevels(filters),
  });
};

// Get Stock History
export const useStockHistory = (
  productId?: string,
  variantId?: string,
  page?: number,
  limit?: number
) => {
  return useQuery({
    queryKey: inventoryKeys.productHistory(productId, variantId),
    queryFn: () =>
      inventoryService.getStockHistory(productId, variantId, page, limit),
  });
};

// Update Stock
export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateStockRequest) => inventoryService.updateStock(data),
    onSuccess: () => {
      // inventoryKeys.all covers both the list and the overview cards.
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "lowStock"] });
      toast.success("Stock updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update stock");
    },
  });
};
