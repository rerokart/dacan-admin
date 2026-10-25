"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  inventorySettingsService,
  type InventorySettings,
} from "@/services/inventorySettings.service";
import { inventoryKeys } from "./queryKeys";
import { useToast } from "@/components/ui/toast";

export const useInventorySettings = () =>
  useQuery({
    queryKey: inventoryKeys.settings(),
    queryFn: () => inventorySettingsService.getSettings(),
  });

export const useUpdateInventorySettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<InventorySettings>) =>
      inventorySettingsService.updateSettings(data),
    onSuccess: () => {
      // The expiring list defaults to the saved warning days.
      queryClient.invalidateQueries({ queryKey: inventoryKeys.settings() });
      queryClient.invalidateQueries({ queryKey: [...inventoryKeys.all, "expiring"] });
      toast.success("Inventory settings saved");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to save inventory settings");
    },
  });
};
