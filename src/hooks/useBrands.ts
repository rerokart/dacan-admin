"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  brandService,
  type BrandFilters,
  type CreateBrandRequest,
  type UpdateBrandRequest,
} from "@/services/brand.service";
import { productKeys } from "@/hooks/useProducts";
import { useToast } from "@/components/ui/toast";

export const brandKeys = {
  all: ["brands"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
  list: (filters?: BrandFilters) => [...brandKeys.lists(), filters] as const,
  details: () => [...brandKeys.all, "detail"] as const,
  detail: (id: string | number) => [...brandKeys.details(), id] as const,
};

export const useBrands = (filters?: BrandFilters) => {
  return useQuery({
    queryKey: brandKeys.list(filters),
    queryFn: () => brandService.getBrands(filters),
  });
};

export const useBrand = (id: string | number) => {
  return useQuery({
    queryKey: brandKeys.detail(id),
    queryFn: () => brandService.getBrandById(id),
    enabled: !!id,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateBrandRequest) => brandService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      toast.success("Brand created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create brand");
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateBrandRequest }) =>
      brandService.updateBrand(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(variables.id) });
      // Product rows and details show the brand name and logo
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Brand updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update brand");
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => brandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
      toast.success("Brand deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to delete brand");
    },
  });
};

// Standalone upload: returns logo_url to put on the brand form
export const useUploadBrandLogo = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: FormData) => brandService.uploadLogo(file),
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to upload logo");
    },
  });
};
