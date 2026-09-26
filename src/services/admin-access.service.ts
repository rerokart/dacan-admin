import { API_ROUTES } from "@/utils/axios/apiEndPoint";
import { defaultAxios } from "@/utils/axios/default.axios";
import type { AdminRole, AdminSession, AdminStatus, AuthAdmin } from "@/services/auth.service";

export type { AdminRole, AdminSession, AdminStatus, AuthAdmin };

// =============================================================================
// ADMINS
// =============================================================================

export interface AdminListItem extends AuthAdmin {
  active_sessions: number;
}

export interface AdminListParams {
  status?: AdminStatus;
  role_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface AdminListResponse {
  admins: AdminListItem[];
  total: number;
  page: number;
  per_page: number;
}

export interface LoginHistoryEntry {
  id: string;
  success: boolean;
  ip: string;
  user_agent: string;
  created_at: string;
  reason?: string | null;
}

export interface AdminDetailResponse {
  admin: AuthAdmin;
  sessions: AdminSession[];
  login_history: LoginHistoryEntry[];
}

export interface InviteAdminRequest {
  email: string;
  full_name: string;
  role_id: string;
}

export interface InviteAdminResponse {
  admin: AuthAdmin;
  message: string;
}

export interface UpdateAdminRequest {
  full_name?: string;
  role_id?: string;
}

export interface MessageResponse {
  message: string;
}

export interface RevokeSessionsResponse {
  revoked: number;
}

// =============================================================================
// ROLES & PERMISSIONS
// =============================================================================

export interface Role {
  id: string;
  key: string;
  name: string;
  description: string;
  is_super: boolean;
  permissions_version: number;
  admin_count: number;
  permissions: string[];
}

export interface RolesResponse {
  roles: Role[];
}

/** Permission catalog grouped by area, e.g. `{ products: ["view", "create", ...] }`. */
export interface PermissionCatalogResponse {
  permissions: Record<string, string[]>;
}

const buildQueryString = <T extends object>(params?: T): string => {
  if (!params) return "";
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

export const adminAccessService = {
  /**
   * List admins. The backend excludes archived admins unless
   * `status: "archived"` is passed explicitly.
   */
  listAdmins: async (params?: AdminListParams): Promise<AdminListResponse> => {
    const url = `${API_ROUTES.ADMINS.LIST}${buildQueryString(params)}`;
    return defaultAxios.get(url);
  },

  getAdmin: async (id: string): Promise<AdminDetailResponse> => {
    return defaultAxios.get(API_ROUTES.ADMINS.GET(id));
  },

  invite: async (body: InviteAdminRequest): Promise<InviteAdminResponse> => {
    return defaultAxios.post(API_ROUTES.ADMINS.INVITE, body);
  },

  resendInvite: async (id: string): Promise<MessageResponse> => {
    return defaultAxios.post(API_ROUTES.ADMINS.RESEND(id));
  },

  revokeInvite: async (id: string): Promise<MessageResponse> => {
    return defaultAxios.delete(API_ROUTES.ADMINS.REVOKE_INVITE(id));
  },

  updateAdmin: async (id: string, body: UpdateAdminRequest): Promise<{ admin: AuthAdmin }> => {
    return defaultAxios.put(API_ROUTES.ADMINS.UPDATE(id), body);
  },

  suspend: async (id: string): Promise<{ admin: AuthAdmin }> => {
    return defaultAxios.put(API_ROUTES.ADMINS.SUSPEND(id));
  },

  reactivate: async (id: string): Promise<{ admin: AuthAdmin }> => {
    return defaultAxios.put(API_ROUTES.ADMINS.REACTIVATE(id));
  },

  archive: async (id: string): Promise<{ admin: AuthAdmin }> => {
    return defaultAxios.put(API_ROUTES.ADMINS.ARCHIVE(id));
  },

  revokeSessions: async (id: string): Promise<RevokeSessionsResponse> => {
    return defaultAxios.delete(API_ROUTES.ADMINS.REVOKE_SESSIONS(id));
  },

  listRoles: async (): Promise<RolesResponse> => {
    return defaultAxios.get(API_ROUTES.ROLES.LIST);
  },

  listPermissions: async (): Promise<PermissionCatalogResponse> => {
    return defaultAxios.get(API_ROUTES.ROLES.PERMISSIONS);
  },

  updateRolePermissions: async (roleId: string, keys: string[]): Promise<{ role: Role }> => {
    return defaultAxios.put(API_ROUTES.ROLES.UPDATE_PERMISSIONS(roleId), {
      permission_keys: keys,
    });
  },
};

export default adminAccessService;
