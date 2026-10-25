"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  inventoryService,
  type ArrivalFilters,
  type CreateArrivalRequest,
} from "@/services/inventory.service";
import { invalidateCatalog } from "./catalogInvalidation";
import { inventoryKeys } from "./queryKeys";
import { useToast } from "@/components/ui/toast";

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
