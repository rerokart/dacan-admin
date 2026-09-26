import { API_ROUTES } from "@/utils/axios/apiEndPoint";
import { defaultAxios } from "@/utils/axios/default.axios";

// =============================================================================
// AUDIT LOG
// =============================================================================

export type AuditCategory = "data" | "security";

export interface AuditActor {
  id: string;
  full_name: string;
  email: string;
}

export interface AuditLogEntry {
  id: string | number;
  created_at: string;
  actor: AuditActor | null;
  category: AuditCategory;
  action: string;
  area: string;
  record_id: string | number | null;
  before: unknown;
  after: unknown;
  ip: string;
  user_agent: string;
}

export interface AuditLogListParams {
  actor_admin_id?: string;
  area?: string;
  action?: string;
  category?: AuditCategory;
  /** YYYY-MM-DD */
  date_from?: string;
  /** YYYY-MM-DD */
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface AuditLogListResponse {
  items: AuditLogEntry[];
  total: number;
  page: number;
  per_page: number;
}

export interface AuditVerifyResponse {
  ok: boolean;
  checked: number;
  broken_id: string | number | null;
}

// =============================================================================
// LOGIN HISTORY
// =============================================================================

export type LoginFailureReason =
  | "bad_password"
  | "unknown_email"
  | "locked"
  | "not_active"
  | "rate_limited"
  | null;

export interface LoginHistoryEntry {
  id: string | number;
  admin_id: string | null;
  email_attempted: string;
  success: boolean;
  failure_reason: LoginFailureReason;
  ip: string;
  user_agent: string;
  created_at: string;
}

export interface LoginHistoryListParams {
  admin_id?: string;
  success?: boolean;
  /** YYYY-MM-DD */
  date_from?: string;
  /** YYYY-MM-DD */
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface LoginHistoryListResponse {
  items: LoginHistoryEntry[];
  total: number;
  page: number;
  per_page: number;
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

export const auditService = {
  /**
   * Filterable, paginated audit log (data + security events).
   */
  list: async (params?: AuditLogListParams): Promise<AuditLogListResponse> => {
    const url = `${API_ROUTES.AUDIT.LIST}${buildQueryString(params)}`;
    return defaultAxios.get(url);
  },

  /**
   * CSV export (same filters as `list`, max 10,000 rows server-side).
   * Requires `audit_log.export`; the export itself is audited.
   *
   * The response interceptor passes blob responses through as the blob
   * itself (headers aren't reachable from there), so callers can't read
   * `Content-Disposition` — use a client-generated fallback filename.
   */
  exportCsv: async (params?: AuditLogListParams): Promise<Blob> => {
    const url = `${API_ROUTES.AUDIT.EXPORT}${buildQueryString(params)}`;
    return defaultAxios.get(url, { responseType: "blob" });
  },

  /**
   * Walks the hash chain server-side. Super Admin only.
   */
  verify: async (): Promise<AuditVerifyResponse> => {
    return defaultAxios.get(API_ROUTES.AUDIT.VERIFY);
  },

  /**
   * Filterable, paginated login attempt history (successes + failures).
   */
  loginHistory: async (params?: LoginHistoryListParams): Promise<LoginHistoryListResponse> => {
    const url = `${API_ROUTES.AUDIT.LOGIN_HISTORY}${buildQueryString(params)}`;
    return defaultAxios.get(url);
  },
};

export default auditService;
