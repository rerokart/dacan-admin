import type { QueryClient } from "@tanstack/react-query";

// Stock, price and SKU mirrors live on products, variants and inventory views at once,
// so any change to one of them refreshes all three (plus the dashboard low-stock widget).
export const invalidateCatalog = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["products"] });
  queryClient.invalidateQueries({ queryKey: ["inventory"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard", "lowStock"] });
};
