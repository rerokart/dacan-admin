import { API_ROUTES } from "@/utils/axios/apiEndPoint";
import { defaultAxios } from "@/utils/axios/default.axios";

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  reset_token: string;
  password: string;
}

export interface UpdateMeRequest {
  full_name: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
  full_name?: string;
}

export interface AdminRole {
  key: string;
  name: string;
  is_super: boolean;
}

export type AdminStatus = "invited" | "active" | "suspended" | "archived";

export interface AuthAdmin {
  id: string;
  email: string;
  full_name: string;
  status: AdminStatus;
  role: AdminRole;
  last_login_at: string | null;
  created_at: string;
}

export interface LoginResponse {
  message: string;
  admin: AuthAdmin;
  permissions: string[];
  access_token: string;
  expires_in: number;
}

export interface MeResponse {
  admin: AuthAdmin;
  permissions: string[];
}

export interface AdminSession {
  id: string;
  ip: string;
  user_agent: string;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  is_current: boolean;
}

export interface InvitationResponse {
  email: string;
  full_name: string;
  role: Pick<AdminRole, "key" | "name">;
  expires_at: string;
}

export const authService = {
  /**
   * Login user with email and password
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return defaultAxios.post(API_ROUTES.AUTH.LOGIN, data);
  },

  /**
   * Logout current session
   */
  logout: async (): Promise<{ message: string }> => {
    return defaultAxios.post(API_ROUTES.AUTH.LOGOUT);
  },

  /**
   * Logout all sessions for the current admin
   */
  logoutAll: async (): Promise<{ message: string; revoked: number }> => {
    return defaultAxios.post(API_ROUTES.AUTH.LOGOUT_ALL);
  },

  /**
   * Fetch the current admin + their permission set
   */
  me: async (): Promise<MeResponse> => {
    return defaultAxios.get(API_ROUTES.AUTH.ME);
  },

  /**
   * Edit the current admin's own name (the only self-editable field)
   */
  updateMe: async (data: UpdateMeRequest): Promise<MeResponse> => {
    return defaultAxios.put(API_ROUTES.AUTH.ME, data);
  },

  /**
   * Change the current admin's password. This session stays signed in;
   * every other session is revoked.
   */
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<{ message: string; revoked: number }> => {
    return defaultAxios.post(API_ROUTES.AUTH.CHANGE_PASSWORD, data);
  },

  /**
   * List active sessions for the current admin
   */
  listSessions: async (): Promise<{ sessions: AdminSession[] }> => {
    return defaultAxios.get(API_ROUTES.AUTH.SESSIONS);
  },

  /**
   * Revoke a single session by id
   */
  revokeSession: async (id: string): Promise<{ message: string }> => {
    return defaultAxios.delete(API_ROUTES.AUTH.SESSION(id));
  },

  /**
   * Request password reset OTP
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    return defaultAxios.post(API_ROUTES.AUTH.FORGOT_PASSWORD, data);
  },

  /**
   * Verify OTP sent for password reset
   */
  verifyOtp: async (data: VerifyOtpRequest): Promise<{ reset_token: string }> => {
    return defaultAxios.post(API_ROUTES.AUTH.VERIFY_OTP, data);
  },

  /**
   * Reset password with a verified reset token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    return defaultAxios.post(API_ROUTES.AUTH.RESET_PASSWORD, data);
  },

  /**
   * Look up an invitation by token (for the accept-invitation page)
   */
  getInvitation: async (token: string): Promise<InvitationResponse> => {
    return defaultAxios.get(API_ROUTES.AUTH.INVITATION(token));
  },

  /**
   * Accept an invitation, setting the admin's password (and optionally name)
   */
  acceptInvitation: async (data: AcceptInvitationRequest): Promise<{ message: string }> => {
    return defaultAxios.post(API_ROUTES.AUTH.ACCEPT_INVITATION, data);
  },
};

export default authService;
