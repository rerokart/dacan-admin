"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  couponService,
  type Coupon,
  type CouponFilters,
  type CreateCouponRequest,
} from "@/services/coupon.service";
import { useToast } from "@/components/ui/toast";

// Query keys
export const couponKeys = {
  all: ["coupons"] as const,
  lists: () => [...couponKeys.all, "list"] as const,
  list: (filters?: CouponFilters) => [...couponKeys.lists(), filters] as const,
  details: () => [...couponKeys.all, "detail"] as const,
  detail: (id: string | number) => [...couponKeys.details(), id] as const,
};

// Get Coupons
export const useCoupons = (filters?: CouponFilters) => {
  return useQuery({
    queryKey: couponKeys.list(filters),
    queryFn: () => couponService.getCoupons(filters),
  });
};

// Get Coupon by ID
export const useCoupon = (id: string | number) => {
  return useQuery({
    queryKey: couponKeys.detail(id),
    queryFn: () => couponService.getCouponById(id),
    enabled: !!id,
  });
};

// Create Coupon
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateCouponRequest) => couponService.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      toast.success("Coupon created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create coupon");
    },
  });
};

// Update Coupon
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<CreateCouponRequest>;
    }) => couponService.updateCoupon(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: couponKeys.detail(variables.id),
      });
      toast.success("Coupon updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update coupon");
    },
  });
};

// Delete Coupon
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      toast.success("Coupon deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to delete coupon");
    },
  });
};

// Validate Coupon
export const useValidateCoupon = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ code, orderTotal }: { code: string; orderTotal: number }) =>
      couponService.validateCoupon({ code, order_total: orderTotal }),
    onSuccess: (data) => {
      if (data.valid) {
        toast.success(`Coupon applied! Discount: ₹${data.discount_amount}`);
      } else {
        toast.error(data.message || "Invalid coupon");
      }
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to validate coupon");
    },
  });
};
