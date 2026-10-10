"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { priceHistoryKeys } from "./queryKeys";

export const usePriceHistory = (
  productId: string | number,
  page = 1,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: priceHistoryKeys.product(productId, page),
    queryFn: () => productService.getPriceHistory(productId, page),
    enabled: !!productId && (options?.enabled ?? true),
  });
