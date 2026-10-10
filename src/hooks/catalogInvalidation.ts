import type { QueryClient } from "@tanstack/react-query";
import {
  brandKeys,
  categoryKeys,
  dashboardKeys,
  inventoryKeys,
  priceHistoryKeys,
  productKeys,
} from "./queryKeys";

// Stock, price and SKU mirrors live on products, variants and inventory views at once,
// so any change to one of them refreshes all three (plus the dashboard low-stock widget).
// Brand rows (product counts, Delete state) and category counts and details count
// products, so a product change refreshes them too.
export const invalidateCatalog = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: productKeys.all });
  queryClient.invalidateQueries({ queryKey: priceHistoryKeys.all });
  queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
  queryClient.invalidateQueries({ queryKey: dashboardKeys.lowStock() });
  queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
  queryClient.invalidateQueries({ queryKey: categoryKeys.all });
};
