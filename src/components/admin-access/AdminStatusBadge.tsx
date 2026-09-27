import Badge from "@/components/ui/badge/Badge";
import type { AdminStatus } from "@/services/admin-access.service";

const STATUS_CONFIG: Record<AdminStatus, { label: string; color: "warning" | "success" | "error" | "light" }> = {
  invited: { label: "Invited", color: "warning" },
  active: { label: "Active", color: "success" },
  suspended: { label: "Suspended", color: "error" },
  archived: { label: "Archived", color: "light" },
};

interface AdminStatusBadgeProps {
  status: AdminStatus;
}

export default function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant="light" color={config.color}>
      {config.label}
    </Badge>
  );
}
