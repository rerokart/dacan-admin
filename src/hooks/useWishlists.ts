"use client";

import { useQuery } from "@tanstack/react-query";
import {
  wishlistService,
  type WishlistItem,
  type WishlistFilters,
} from "@/services/wishlist.service";

// Query keys
export const wishlistKeys = {
  all: ["wishlists"] as const,
  lists: () => [...wishlistKeys.all, "list"] as const,
  list: (filters?: WishlistFilters) => [...wishlistKeys.lists(), filters] as const,
};

// Get Wishlists
export const useWishlists = (filters?: WishlistFilters) => {
  return useQuery({
    queryKey: wishlistKeys.list(filters),
    queryFn: () => wishlistService.getWishlists(filters),
  });
};
