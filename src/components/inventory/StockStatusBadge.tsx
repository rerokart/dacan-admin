import Badge from "@/components/ui/badge/Badge";
import type { StockStatus } from "@/services/inventory.service";

const CONFIG: Record<StockStatus, { label: string; color: "success" | "warning" | "error" }> = {
  in_stock: { label: "In Stock", color: "success" },
  low_stock: { label: "Low Stock", color: "warning" },
  out_of_stock: { label: "Out of Stock", color: "error" },
};

export default function StockStatusBadge({
  status,
  size = "md",
}: {
  status: StockStatus;
  size?: "sm" | "md";
}) {
  const cfg = CONFIG[status];
  if (!cfg) return null;
  return (
    <Badge variant="light" color={cfg.color} size={size}>
      {cfg.label}
    </Badge>
  );
}
