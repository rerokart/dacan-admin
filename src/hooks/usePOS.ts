"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  posService,
  type POSProduct,
  type POSCustomer,
  type POSCartItem,
  type CreateOfflineOrderRequest,
  calculateCartTotals,
} from "@/services/pos.service";
import { useToast } from "@/components/ui/toast";
import { orderKeys } from "./useOrders";

// Query keys
export const posKeys = {
  all: ["pos"] as const,
  products: (query: string) => [...posKeys.all, "products", query] as const,
  customers: (phone: string) => [...posKeys.all, "customers", phone] as const,
};

// Search Products for POS
export const usePOSProductSearch = (query: string, enabled = true) => {
  return useQuery({
    queryKey: posKeys.products(query),
    queryFn: () => posService.searchProducts(query),
    enabled: enabled && query.length >= 2,
  });
};

// Search Customers
export const usePOSCustomerSearch = (phone: string, enabled = true) => {
  return useQuery({
    queryKey: posKeys.customers(phone),
    queryFn: () => posService.searchCustomers(phone),
    enabled: enabled && phone.length >= 3,
  });
};

// Create Customer
export const useCreatePOSCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { full_name: string; mobile: string; email?: string }) =>
      posService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: posKeys.all });
      toast.success("Customer created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create customer");
    },
  });
};

// Create Offline Order
export const useCreatePOSOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateOfflineOrderRequest) =>
      posService.createOfflineOrder(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success(`Order ${data.order_number} created successfully!`);
      return data;
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create order");
    },
  });
};

// POS Cart Hook
export const usePOSCart = () => {
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<POSCustomer | null>(
    null
  );

  const addToCart = useCallback(
    (product: POSProduct, variantId?: string) => {
      setCart((prev) => {
        const variant = variantId
          ? product.variants?.find((v) => v.id === variantId)
          : null;

        const itemKey = variantId
          ? `${product.id}-${variantId}`
          : product.id;

        const existingIndex = prev.findIndex(
          (item) =>
            item.product_id === product.id &&
            item.variant_id === variantId
        );

        if (existingIndex >= 0) {
          // Update quantity
          const newCart = [...prev];
          const maxStock = variant
            ? variant.stock_quantity
            : product.stock_quantity;
          if (newCart[existingIndex].quantity < maxStock) {
            newCart[existingIndex].quantity += 1;
          }
          return newCart;
        }

        // Add new item
        const newItem: POSCartItem = {
          product_id: product.id,
          variant_id: variantId,
          name: product.name,
          variant_name: variant?.variant_name,
          sku: variant?.sku || product.sku,
          price: variant?.price || product.price,
          quantity: 1,
          stock_quantity: variant?.stock_quantity || product.stock_quantity,
          image_url: product.image_url,
        };

        return [...prev, newItem];
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, variantId: string | undefined, quantity: number) => {
      setCart((prev) =>
        prev.map((item) => {
          if (
            item.product_id === productId &&
            item.variant_id === variantId
          ) {
            const newQuantity = Math.max(
              0,
              Math.min(quantity, item.stock_quantity)
            );
            return { ...item, quantity: newQuantity };
          }
          return item;
        }).filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: string, variantId?: string) => {
      setCart((prev) =>
        prev.filter(
          (item) =>
            !(item.product_id === productId && item.variant_id === variantId)
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
  }, []);

  const totals = calculateCartTotals(cart);

  return {
    cart,
    selectedCustomer,
    setSelectedCustomer,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totals,
  };
};
