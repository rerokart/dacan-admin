"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bannerService,
  type Banner,
  type BannerFilters,
  type CreateBannerRequest,
  type ReorderRequest,
} from "@/services/banner.service";
import { useToast } from "@/components/ui/toast";

// Query keys
export const bannerKeys = {
  all: ["banners"] as const,
  lists: () => [...bannerKeys.all, "list"] as const,
  list: (filters?: BannerFilters) => [...bannerKeys.lists(), filters] as const,
  details: () => [...bannerKeys.all, "detail"] as const,
  detail: (id: string | number) => [...bannerKeys.details(), id] as const,
  active: () => [...bannerKeys.all, "active"] as const,
};

// Get Banners
export const useBanners = (filters?: BannerFilters) => {
  return useQuery({
    queryKey: bannerKeys.list(filters),
    queryFn: () => bannerService.getBanners(filters),
  });
};

// Get Active Banners
export const useActiveBanners = () => {
  return useQuery({
    queryKey: bannerKeys.active(),
    queryFn: () => bannerService.getActiveBanners(),
  });
};

// Get Banner by ID
export const useBanner = (id: string | number) => {
  return useQuery({
    queryKey: bannerKeys.detail(id),
    queryFn: () => bannerService.getBannerById(id),
    enabled: !!id,
  });
};

// Create Banner
export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateBannerRequest) => bannerService.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
      toast.success("Banner created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create banner");
    },
  });
};

// Update Banner
export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<CreateBannerRequest>;
    }) => bannerService.updateBanner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: bannerKeys.detail(variables.id),
      });
      toast.success("Banner updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update banner");
    },
  });
};

// Delete Banner
export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => bannerService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
      toast.success("Banner deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to delete banner");
    },
  });
};

// Reorder Banners
export const useReorderBanners = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ReorderRequest) => bannerService.reorderBanners(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
      toast.success("Banners reordered successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to reorder banners");
    },
  });
};
