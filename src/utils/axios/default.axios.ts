import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getToken, handleLogout } from '@/utils/helpers/token';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Public auth endpoints answer 401 for "wrong password / account locked /
// wrong or expired code / expired reset link". Those are form errors, not an
// expired session, so they must never trigger a logout.
const PUBLIC_AUTH_PATH =
  /(^|\/)auth\/(login|forgot-password|verify-otp|reset-password|invitations(\/[^/]*)?)\/?$/;

function isPublicAuthRequest(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.split(/[?#]/)[0];
  return PUBLIC_AUTH_PATH.test(path);
}

function requestCarriedToken(config: InternalAxiosRequestConfig | undefined): boolean {
  const header = config?.headers?.Authorization ?? config?.headers?.get?.('Authorization');
  return typeof header === 'string' && header.startsWith('Bearer ');
}

export const defaultAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token to all requests
defaultAxios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If data is FormData, let axios set the Content-Type automatically (with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle success and errors
defaultAxios.interceptors.response.use(
  (response) => {
    // Blob responses (e.g., PDF invoice download) don't have status field
    if (response.config?.responseType === 'blob') return response.data;
    if (response.data?.status === 1) return response.data;
    return Promise.reject(response.data);
  },
  (error) => {
    const { response } = error;

    // Handle 401 Unauthorized on an authenticated call - token expired,
    // revoked or invalid. A 401 from a public auth endpoint (or from a call
    // made without a token) falls through to the generic error below so the
    // form can show the backend's message.
    if (response?.status === 401 && requestCarriedToken(error.config) && !isPublicAuthRequest(error.config?.url)) {
      handleLogout();
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle 403 Forbidden - authenticated but not permitted. Do NOT log out;
    // let the calling hook's onError toast the message, and tell AuthContext
    // to refetch permissions in case the admin's role just changed.
    if (response?.status === 403) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:forbidden'));
      }
      const forbiddenMessage = response?.data?.error || response?.data?.message || "You don't have permission to do that.";
      return Promise.reject(new Error(typeof forbiddenMessage === 'string' ? forbiddenMessage : "You don't have permission to do that."));
    }

    // Backend convention is { error, status: 0 }; fall back to `message` for
    // any responses that don't follow it.
    const message = response?.data?.error || response?.data?.message || response?.data || 'Something went wrong';
    const rejectedError = new Error(typeof message === 'string' ? message : 'Something went wrong') as Error & {
      status?: number;
    };
    // Attach the HTTP status so callers that need to branch on it (e.g. a
    // 410 expired/used invitation link) don't have to parse the message.
    rejectedError.status = response?.status;
    return Promise.reject(rejectedError);
  }
);
