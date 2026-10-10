"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  posService,
  type POSProduct,
  type POSCustomer,
  type POSCartItem,
  type CreateOfflineOrderRequest,
  type POSQuoteRequest,
} from "@/services/pos.service";
import { useToast } from "@/components/ui/toast";
import { orderKeys } from "./useOrders";

// Query keys
export const posKeys = {
  all: ["pos"] as const,
  products: (query: string) => [...posKeys.all, "products", query] as const,
  customers: (phone: string) => [...posKeys.all, "customers", phone] as const,
  quote: (request: POSQuoteRequest) => [...posKeys.all, "quote", request] as const,
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

// Server-priced totals for a cart (GST, coupon, round-off). Off for an empty cart.
export const usePOSQuote = (request: POSQuoteRequest, enabled = true) => {
  return useQuery({
    queryKey: posKeys.quote(request),
    queryFn: () => posService.quoteOrder(request),
    enabled: enabled && request.items.length > 0,
    placeholderData: (previous) => previous,
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
  const [couponCode, setCouponCode] = useState("");

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
          image: product.image,
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
    setCouponCode("");
  }, []);

  // Totals come from the server quote, never from a local GST calculation.
  // The request is debounced (300 ms); until the quote for the current cart,
  // customer and coupon has arrived, no total is shown and `canCharge` is false.
  const liveRequest = useMemo<POSQuoteRequest>(
    () => ({
      items: cart.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      })),
      // Walk-in has an empty id: send no customer
      customer_id: selectedCustomer?.id || undefined,
      coupon_code: couponCode.trim() || undefined,
    }),
    [cart, selectedCustomer, couponCode]
  );
  const liveKey = JSON.stringify(liveRequest);
  const [debounced, setDebounced] = useState<{ key: string; request: POSQuoteRequest }>(
    { key: liveKey, request: liveRequest }
  );
  useEffect(() => {
    if (debounced.key === liveKey) return;
    const timer = setTimeout(
      () => setDebounced({ key: liveKey, request: liveRequest }),
      300
    );
    return () => clearTimeout(timer);
  }, [liveKey, liveRequest, debounced.key]);

  const hasCart = cart.length > 0;
  const {
    data: quoteData,
    isFetching,
    isPlaceholderData,
    isError,
  } = usePOSQuote(debounced.request, hasCart);
  const isStale = hasCart && debounced.key !== liveKey;
  // An empty cart must never show the last cart's totals; a placeholder is the
  // previous request's quote and does not count as current.
  const quote = hasCart && !isStale && !isPlaceholderData && !isError ? quoteData : undefined;
  const isQuoting = hasCart && !isError && (isStale || isFetching || isPlaceholderData);
  const lineErrors = (quote?.lines ?? []).filter((line) => line.error);
  const couponError = quote?.summary.coupon_error ?? null;
  const totals = {
    subtotal: quote?.summary.subtotal ?? null,
    discount: quote?.summary.discount_amount ?? 0,
    tax: quote?.summary.tax_amount ?? null,
    total: quote?.summary.total_amount ?? null,
    itemCount: cart.reduce((acc, item) => acc + item.quantity, 0),
    quote,
    isQuoting,
    quoteError: hasCart && isError && !isStale,
    couponError,
    lineErrors,
    // Only a fresh, error-free server quote may be charged.
    canCharge: !!quote && lineErrors.length === 0 && !couponError,
  };

  return {
    cart,
    selectedCustomer,
    setSelectedCustomer,
    couponCode,
    setCouponCode,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totals,
  };
};
