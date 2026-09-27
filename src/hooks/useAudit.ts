"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  auditService,
  type AuditLogListParams,
  type LoginHistoryListParams,
} from "@/services/audit.service";
import { useToast } from "@/components/ui/toast";

// =============================================================================
// QUERY KEYS
// =============================================================================

export const auditLogKeys = {
  all: ["audit-log"] as const,
  list: (params?: AuditLogListParams) => [...auditLogKeys.all, "list", params] as const,
};

export const loginHistoryKeys = {
  all: ["login-history"] as const,
  list: (params?: LoginHistoryListParams) => [...loginHistoryKeys.all, "list", params] as const,
};

// =============================================================================
// QUERIES
// =============================================================================

export const useAuditLog = (params?: AuditLogListParams) => {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => auditService.list(params),
  });
};

export const useLoginHistory = (params?: LoginHistoryListParams) => {
  return useQuery({
    queryKey: loginHistoryKeys.list(params),
    queryFn: () => auditService.loginHistory(params),
  });
};

// =============================================================================
// MUTATIONS
// =============================================================================

export const useVerifyAudit = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => auditService.verify(),
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to verify audit log integrity");
    },
  });
};

export const useExportAudit = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params?: AuditLogListParams) => auditService.exportCsv(params),
    onSuccess: () => {
      // The export itself writes a new `audit_log.exported` security row —
      // refresh the list/count so it shows up without a manual reload.
      queryClient.invalidateQueries({ queryKey: auditLogKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to export audit log");
    },
  });
};
