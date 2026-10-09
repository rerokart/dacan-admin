"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  taxSettingsService,
  type HsnFilters,
  type UpdateTaxSettingsRequest,
  type CreateGstRateRequest,
  type UpdateGstRateRequest,
  type CreateHsnCodeRequest,
  type UpdateHsnCodeRequest,
} from "@/services/taxSettings.service";
import { taxKeys, productKeys } from "./queryKeys";
import { useToast } from "@/components/ui/toast";

type Enabled = { enabled?: boolean };

export const useTaxSettings = (options?: Enabled) =>
  useQuery({
    queryKey: taxKeys.settings(),
    queryFn: () => taxSettingsService.getSettings(),
    enabled: options?.enabled ?? true,
  });

export const useGstRates = (options?: Enabled) =>
  useQuery({
    queryKey: taxKeys.rates(),
    queryFn: () => taxSettingsService.getGstRates(),
    enabled: options?.enabled ?? true,
  });

export const useHsnCodes = (filters?: HsnFilters, options?: Enabled) =>
  useQuery({
    queryKey: taxKeys.hsnList(filters),
    queryFn: () => taxSettingsService.getHsnCodes(filters),
    enabled: options?.enabled ?? true,
  });

/** Exact-then-prefix rate for an HSN code; only runs for a code of 4 digits or more. */
export const useHsnLookup = (code: string, options?: Enabled) =>
  useQuery({
    queryKey: taxKeys.hsnLookup(code),
    queryFn: () => taxSettingsService.lookupHsn(code),
    enabled: /^[0-9]{4,8}$/.test(code) && (options?.enabled ?? true),
  });

/**
 * Settings, rates and HSN rows depend on each other (a rate in use, a default
 * rate, an HSN rate), so every write refreshes all three.
 */
const useRefreshTax = () => {
  const queryClient = useQueryClient();
  return (alsoProducts = false) => {
    queryClient.invalidateQueries({ queryKey: taxKeys.all });
    if (alsoProducts) queryClient.invalidateQueries({ queryKey: productKeys.all });
  };
};

export const useUpdateTaxSettings = () => {
  const refresh = useRefreshTax();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: UpdateTaxSettingsRequest) => taxSettingsService.updateSettings(data),
    onSuccess: () => {
      // Product margins depend on the "prices include GST" setting
      refresh(true);
      toast.success("Tax settings saved");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to save tax settings"),
  });
};

export const useCreateGstRate = () => {
  const refresh = useRefreshTax();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateGstRateRequest) => taxSettingsService.createGstRate(data),
    onSuccess: () => {
      refresh();
      toast.success("GST rate added");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to add GST rate"),
  });
};

export const useUpdateGstRate = () => {
  const refresh = useRefreshTax();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGstRateRequest }) =>
      taxSettingsService.updateGstRate(id, data),
    onSuccess: () => {
      refresh();
      toast.success("GST rate updated");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to update GST rate"),
  });
};

export const useDeleteGstRate = () => {
  const refresh = useRefreshTax();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => taxSettingsService.deleteGstRate(id),
    onSuccess: () => {
      refresh();
      toast.success("GST rate deleted");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to delete GST rate"),
  });
};

export const useCreateHsnCode = () => {
  const refresh = useRefreshTax();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateHsnCodeRequest) => taxSettingsService.createHsnCode(data),
    onSuccess: () => {
      refresh();
      toast.success("HSN code added");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to add HSN code"),
  });
};

export const useUpdateHsnCode = () => {
  const refresh = useRefreshTax();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: UpdateHsnCodeRequest }) =>
      taxSettingsService.updateHsnCode(code, data),
    onSuccess: () => {
      refresh();
      toast.success("HSN code updated");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to update HSN code"),
  });
};

export const useDeleteHsnCode = () => {
  const refresh = useRefreshTax();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (code: string) => taxSettingsService.deleteHsnCode(code),
    onSuccess: () => {
      refresh();
      toast.success("HSN code deleted");
    },
    onError: (error: Error) => toast.error(error?.message || "Failed to delete HSN code"),
  });
};
