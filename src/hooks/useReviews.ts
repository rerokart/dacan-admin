"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reviewService,
  type ReviewFilters,
} from "@/services/review.service";
import { useToast } from "@/components/ui/toast";
import { productKeys } from "./useProducts";

// Query keys
export const reviewKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewKeys.all, "list"] as const,
  list: (filters?: ReviewFilters) => [...reviewKeys.lists(), filters] as const,
  details: () => [...reviewKeys.all, "detail"] as const,
  detail: (id: string | number) => [...reviewKeys.details(), id] as const,
  productReviews: (productId: string | number) =>
    [...reviewKeys.all, "product", productId] as const,
};

// Get Reviews
export const useReviews = (filters?: ReviewFilters) => {
  return useQuery({
    queryKey: reviewKeys.list(filters),
    queryFn: () => reviewService.getReviews(filters),
  });
};

// Get Review by ID
export const useReview = (id: string | number) => {
  return useQuery({
    queryKey: reviewKeys.detail(id),
    queryFn: () => reviewService.getReviewById(id),
    enabled: !!id,
  });
};

// Get Product Reviews
export const useProductReviews = (
  productId: string | number,
  page?: number,
  limit?: number
) => {
  return useQuery({
    queryKey: reviewKeys.productReviews(productId),
    queryFn: () => reviewService.getProductReviews(productId, page, limit),
    enabled: !!productId,
  });
};

// Approve Review
export const useApproveReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => reviewService.approveReview(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      // Also invalidate product to update its rating
      if (data.product_id) {
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(data.product_id),
        });
      }
      toast.success("Review approved successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to approve review");
    },
  });
};

// Reject Review
export const useRejectReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => reviewService.rejectReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      toast.success("Review rejected successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to reject review");
    },
  });
};

// Delete Review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => reviewService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      toast.success("Review deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to delete review");
    },
  });
};
