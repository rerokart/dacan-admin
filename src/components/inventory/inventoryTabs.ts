export const INVENTORY_TABS = [
  { key: "stock", label: "Stock", permission: "inventory.view" },
  { key: "history", label: "History", permission: "inventory.view" },
  { key: "arrivals", label: "Arrivals", permission: "inventory.view" },
  { key: "expiring", label: "Expiring", permission: "inventory.view" },
  { key: "reports", label: "Reports", permission: "inventory.export" },
] as const;

export type InventoryTabKey = (typeof INVENTORY_TABS)[number]["key"];

export const CORRECTION_REASONS = [
  { value: "damaged", label: "Damaged" },
  { value: "lost", label: "Lost" },
  { value: "count_correction", label: "Count correction" },
  { value: "other", label: "Other" },
] as const;

export const MOVEMENT_REASON_LABELS: Record<string, string> = {
  order: "Order",
  cancel: "Order cancelled",
  pos_sale: "POS sale",
  return_good: "Return (good stock)",
  arrival: "Stock arrival",
  correction: "Correction",
  initial_stock: "Initial stock",
  product_edit: "Product edit",
  payment_hold_release: "Payment hold released",
  unspecified: "Not specified",
};

export const SUB_REASON_LABELS: Record<string, string> = {
  damaged: "Damaged",
  lost: "Lost",
  count_correction: "Count correction",
  other: "Other",
};
