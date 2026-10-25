import type { ProductFilters } from "@/services/product.service";
import type {
  StockFilters,
  MovementFilters,
  ArrivalFilters,
} from "@/services/inventory.service";
import type { BrandFilters } from "@/services/brand.service";
import type { HsnFilters } from "@/services/taxSettings.service";
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

export const taxKeys = {
  all: ["tax-settings"] as const,
  settings: () => [...taxKeys.all, "settings"] as const,
  rates: () => [...taxKeys.all, "gst-rates"] as const,
  hsnCodes: () => [...taxKeys.all, "hsn-codes"] as const,
  hsnList: (filters?: HsnFilters) => [...taxKeys.hsnCodes(), "list", filters] as const,
  hsnLookup: (code: string) => [...taxKeys.hsnCodes(), "lookup", code] as const,
};

export const priceHistoryKeys = {
  all: ["price-history"] as const,
  product: (productId: string | number, page?: number) =>
    [...priceHistoryKeys.all, productId, page] as const,
  forProduct: (productId: string | number) =>
    [...priceHistoryKeys.all, productId] as const,
};

export const inventoryKeys = {
  all: ["inventory"] as const,
  overview: () => [...inventoryKeys.all, "overview"] as const,
  stockLevels: () => [...inventoryKeys.all, "stock"] as const,
  stockLevel: (filters?: StockFilters) =>
    [...inventoryKeys.stockLevels(), filters] as const,
  movements: () => [...inventoryKeys.all, "movements"] as const,
  movementList: (filters?: MovementFilters) =>
    [...inventoryKeys.movements(), filters] as const,
  arrivals: () => [...inventoryKeys.all, "arrivals"] as const,
  arrivalList: (filters?: ArrivalFilters) =>
    [...inventoryKeys.arrivals(), filters] as const,
  expiring: (days?: number, page?: number) =>
    [...inventoryKeys.all, "expiring", days, page] as const,
  reports: () => [...inventoryKeys.all, "reports"] as const,
  settings: () => [...inventoryKeys.all, "settings"] as const,
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
