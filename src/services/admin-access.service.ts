import { API_ROUTES } from "@/utils/axios/apiEndPoint";
import { defaultAxios } from "@/utils/axios/default.axios";
import type { AdminRole, AdminSession, AdminStatus, AuthAdmin } from "@/services/auth.service";
import type { LoginHistoryEntry } from "@/services/audit.service";

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

/** A session row as returned by GET /api/admin/admins/:id — no `is_current`
 *  (that flag only exists on the caller's own /auth/sessions list). */
export type AdminDetailSession = Omit<AdminSession, "is_current">;

export interface AdminDetailResponse {
  admin: AuthAdmin;
  sessions: AdminDetailSession[];
  /** Same row shape as the Login History tab (admin_login_history). */
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

export interface PermissionCatalogEntry {
  key: string;
  action: string;
  description: string;
}

export interface PermissionCatalogArea {
  area: string;
  permissions: PermissionCatalogEntry[];
}

/** Permission catalog grouped by area, in catalog order (spec §4.5). */
export interface PermissionCatalogResponse {
  areas: PermissionCatalogArea[];
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
      permissions: keys,
    });
  },
};

export default adminAccessService;
