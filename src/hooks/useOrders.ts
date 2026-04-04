"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  orderService,
  type Order,
  type OrderFilters,
  type UpdateOrderStatusRequest,
} from "@/services/order.service";
import { useToast } from "@/components/ui/toast";

// Query keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters?: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string | number) => [...orderKeys.details(), id] as const,
};

// Get Orders
export const useOrders = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => orderService.getOrders(filters),
  });
};

// Get Order by ID
export const useOrder = (id: string | number) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
  });
};

// Update Order Status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: UpdateOrderStatusRequest;
    }) => orderService.updateOrderStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      toast.success("Order status updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update order status");
    },
  });
};

// Update Payment Status
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payment_status,
    }: {
      id: string | number;
      payment_status: string;
    }) => orderService.updatePaymentStatus(id, payment_status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      toast.success("Payment status updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update payment status");
    },
  });
};

// Cancel Order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string | number; reason?: string }) =>
      orderService.cancelOrder(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
      toast.success("Order cancelled successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to cancel order");
    },
  });
};

// Download Invoice
export const useDownloadInvoice = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string | number) => orderService.getOrderInvoice(id),
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to download invoice");
    },
  });
};

// Create Offline Order (POS)
export const useCreateOfflineOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: {
      items: { product_id: string; variant_id?: string; quantity: number }[];
      customer_id?: string;
      payment_method: string;
      amount_paid?: number;
      notes?: string;
    }) => orderService.createOfflineOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success("Order created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create order");
    },
  });
};
