import type { ProductFilters } from "@/services/product.service";
import type { StockFilters } from "@/services/inventory.service";
import type { BrandFilters } from "@/services/brand.service";
import type { CategoryFilters } from "@/services/category.service";

// Every TanStack Query key factory lives here so hooks (and catalogInvalidation)
// can share them without importing each other.

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string | number) => [...productKeys.details(), id] as const,
  variants: (productId: string | number) =>
    [...productKeys.all, "variants", productId] as const,
};

export const inventoryKeys = {
  all: ["inventory"] as const,
  overview: () => [...inventoryKeys.all, "overview"] as const,
  stockLevels: () => [...inventoryKeys.all, "stock"] as const,
  stockLevel: (filters?: StockFilters) =>
    [...inventoryKeys.stockLevels(), filters] as const,
  history: () => [...inventoryKeys.all, "history"] as const,
  productHistory: (productId?: string, variantId?: string) =>
    [...inventoryKeys.history(), productId, variantId] as const,
};

export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: () => [...dashboardKeys.all, "overview"] as const,
  salesChart: () => [...dashboardKeys.all, "salesChart"] as const,
  lowStock: () => [...dashboardKeys.all, "lowStock"] as const,
};

export const brandKeys = {
  all: ["brands"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
  list: (filters?: BrandFilters) => [...brandKeys.lists(), filters] as const,
  details: () => [...brandKeys.all, "detail"] as const,
  detail: (id: string | number) => [...brandKeys.details(), id] as const,
};

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: CategoryFilters) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string | number) => [...categoryKeys.details(), id] as const,
};
