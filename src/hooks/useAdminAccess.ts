"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminAccessService,
  type AdminListParams,
  type InviteAdminRequest,
  type UpdateAdminRequest,
} from "@/services/admin-access.service";
import { useToast } from "@/components/ui/toast";

// =============================================================================
// QUERY KEYS
// =============================================================================

export const adminAccessKeys = {
  all: ["admins"] as const,
  lists: () => [...adminAccessKeys.all, "list"] as const,
  list: (params?: AdminListParams) => [...adminAccessKeys.lists(), params] as const,
  details: () => [...adminAccessKeys.all, "detail"] as const,
  detail: (id: string) => [...adminAccessKeys.details(), id] as const,
};

export const rolesKeys = {
  all: ["roles"] as const,
  list: () => [...rolesKeys.all, "list"] as const,
};

export const permissionsKeys = {
  all: ["permissions"] as const,
};

// =============================================================================
// QUERIES
// =============================================================================

export const useAdmins = (params?: AdminListParams) => {
  return useQuery({
    queryKey: adminAccessKeys.list(params),
    queryFn: () => adminAccessService.listAdmins(params),
  });
};

export const useAdmin = (id: string | undefined) => {
  return useQuery({
    queryKey: adminAccessKeys.detail(id ?? ""),
    queryFn: () => adminAccessService.getAdmin(id as string),
    enabled: !!id,
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: rolesKeys.list(),
    queryFn: () => adminAccessService.listRoles(),
  });
};

export const usePermissionCatalog = () => {
  return useQuery({
    queryKey: permissionsKeys.all,
    queryFn: () => adminAccessService.listPermissions(),
  });
};

// =============================================================================
// MUTATIONS — admins
// =============================================================================

export const useInviteAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (body: InviteAdminRequest) => adminAccessService.invite(body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminAccessKeys.all });
      // A newly invited admin counts against their role's admin_count.
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      toast.success(`Invitation sent to ${variables.email}`);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to send invitation");
    },
  });
};

export const useResendInvite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => adminAccessService.resendInvite(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminAccessKeys.all });
      toast.success(data?.message || "Invitation resent");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to resend invitation");
    },
  });
};

export const useRevokeInvite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => adminAccessService.revokeInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAccessKeys.all });
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      toast.success("Invitation revoked");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to revoke invitation");
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAdminRequest }) =>
      adminAccessService.updateAdmin(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminAccessKeys.all });
      queryClient.invalidateQueries({ queryKey: adminAccessKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      toast.success("Admin updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update admin");
    },
  });
};

export const useSuspendAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => adminAccessService.suspend(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: adminAccessKeys.all });
      queryClient.invalidateQueries({ queryKey: adminAccessKeys.detail(id) });
      toast.success("Admin suspended");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to suspend admin");
    },
  });
};

export const useReactivateAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => adminAccessService.reactivate(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: adminAccessKeys.all });
      queryClient.invalidateQueries({ queryKey: adminAccessKeys.detail(id) });
      toast.success("Admin reactivated");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to reactivate admin");
    },
  });
};

export const useArchiveAdmin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => adminAccessService.archive(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: adminAccessKeys.all });
      queryClient.invalidateQueries({ queryKey: adminAccessKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      toast.success("Admin archived");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to archive admin");
    },
  });
};

export const useRevokeSessions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => adminAccessService.revokeSessions(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: adminAccessKeys.all });
      queryClient.invalidateQueries({ queryKey: adminAccessKeys.detail(id) });
      toast.success(
        typeof data?.revoked === "number"
          ? `Signed out of ${data.revoked} session${data.revoked === 1 ? "" : "s"}`
          : "Sessions revoked"
      );
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to revoke sessions");
    },
  });
};

// =============================================================================
// MUTATIONS — roles & permissions
// =============================================================================

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ roleId, keys }: { roleId: string; keys: string[] }) =>
      adminAccessService.updateRolePermissions(roleId, keys),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      toast.success("Role permissions updated");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update role permissions");
    },
  });
};
