import { API_ROUTES } from "@/utils/axios/apiEndPoint";
import { defaultAxios } from "@/utils/axios/default.axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  admin: AuthUser;
  message: string;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}


export const authService = {
  /**
   * Login user with email and password
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return defaultAxios.post(API_ROUTES.AUTH.LOGIN, data);
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await defaultAxios.post(API_ROUTES.AUTH.REGISTER, data);
    return response.data;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    await defaultAxios.post(API_ROUTES.AUTH.LOGOUT);
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await defaultAxios.post(API_ROUTES.AUTH.FORGOT_PASSWORD, data);
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await defaultAxios.post(API_ROUTES.AUTH.RESET_PASSWORD, data);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await defaultAxios.post(API_ROUTES.AUTH.REFRESH);
    return response.data;
  },
};

export default authService;
