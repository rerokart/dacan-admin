"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  inventoryService,
  type ArrivalFilters,
  type CorrectStockRequest,
  type CreateArrivalRequest,
  type MovementFilters,
  type StockFilters,
} from "@/services/inventory.service";
import { invalidateCatalog } from "./catalogInvalidation";
import { inventoryKeys } from "./queryKeys";
import { useToast } from "@/components/ui/toast";

// Get Inventory Overview
export const useInventoryOverview = () => {
  return useQuery({
    queryKey: inventoryKeys.overview(),
    queryFn: () => inventoryService.getOverview(),
  });
};

// Get Stock Levels
export const useStockLevels = (
  filters?: StockFilters,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: inventoryKeys.stockLevel(filters),
    queryFn: () => inventoryService.getStockLevels(filters),
    enabled: options?.enabled ?? true,
  });
};

// Stock history (every logged stock change)
export const useMovements = (filters?: MovementFilters) => {
  return useQuery({
    queryKey: inventoryKeys.movementList(filters),
    queryFn: () => inventoryService.getMovements(filters),
    placeholderData: keepPreviousData,
  });
};

// Correct stock with a fixed reason
export const useCorrectStock = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CorrectStockRequest) => inventoryService.correctStock(data),
    onSuccess: () => {
      // Products, variants, inventory and low-stock all mirror stock.
      invalidateCatalog(queryClient);
      toast.success("Stock corrected");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to correct stock");
    },
  });
};

export const useArrivals = (filters?: ArrivalFilters) => {
  return useQuery({
    queryKey: inventoryKeys.arrivalList(filters),
    queryFn: () => inventoryService.getArrivals(filters),
    placeholderData: keepPreviousData,
  });
};

export const useExpiring = (days?: number, page?: number, enabled = true) => {
  return useQuery({
    queryKey: inventoryKeys.expiring(days, page),
    queryFn: () => inventoryService.getExpiring(days, page, 20),
    enabled,
    placeholderData: keepPreviousData,
  });
};

// Record a stock arrival. Cost may change, so products refresh too.
export const useCreateArrival = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateArrivalRequest) => inventoryService.createArrival(data),
    onSuccess: (res) => {
      invalidateCatalog(queryClient);
      toast.success(
        res.cost_updated
          ? "Arrival recorded. The product cost was updated."
          : "Arrival recorded. The product cost was not changed."
      );
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to record arrival");
    },
  });
};
