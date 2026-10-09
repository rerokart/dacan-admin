import type { QueryClient } from "@tanstack/react-query";
import { dashboardKeys, inventoryKeys, productKeys } from "./queryKeys";

// Stock, price and SKU mirrors live on products, variants and inventory views at once,
// so any change to one of them refreshes all three (plus the dashboard low-stock widget).
export const invalidateCatalog = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: productKeys.all });
  queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
  queryClient.invalidateQueries({ queryKey: dashboardKeys.lowStock() });
};
