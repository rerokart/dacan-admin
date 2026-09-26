"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  authService,
  LoginRequest,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  AcceptInvitationRequest,
} from "@/services/auth.service";
import { setTokens, setUserData, handleLogout } from "@/utils/helpers/token";
import { AUTH_ME_QUERY_KEY } from "@/context/AuthContext";
import { ROUTES } from "@/utils/constants/NavigationRoutes";
import { useToast } from "@/components/ui/toast";

// =============================================================================
// LOGIN HOOK
// =============================================================================

export const useLogin = () => {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      // Match the cookie lifetime to the server-issued token TTL so the browser
      // drops the cookie at the same time the token stops working.
      const expiresInHours = response.expires_in ? response.expires_in / 3600 : 24;
      setTokens({ accessToken: response.access_token, expiresAt: expiresInHours });
      // Store display-only user data for the header. Role/permissions are
      // never cached here — they come from the seeded `auth.me` query below.
      if (response.admin) {
        setUserData({
          id: response.admin.id,
          email: response.admin.email,
          full_name: response.admin.full_name,
        });
      }
      // Seed the permissions cache from the login response so gating is
      // instant on first render, instead of waiting on a follow-up /auth/me.
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, {
        admin: response.admin,
        permissions: response.permissions,
      });
      toast.success(response.message || "Login successful!");
      router.push(ROUTES.DASHBOARD);
    },
    onError: (error: Error & { message?: string }) => {
      toast.error(error?.message || "Login failed. Please try again.");
    },
  });
};

// =============================================================================
// LOGOUT HOOK
// =============================================================================

export const useLogout = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      handleLogout();
      toast.success("Logged out successfully");
    },
    onError: () => {
      // Even if the API call fails, still log out locally.
      queryClient.clear();
      handleLogout();
    },
  });
};

// =============================================================================
// SESSIONS HOOKS
// =============================================================================

export const sessionsKeys = {
  all: ["auth", "sessions"] as const,
};

/** The signed-in admin's own active sessions (Profile → active sessions). */
export const useMySessions = () => {
  return useQuery({
    queryKey: sessionsKeys.all,
    queryFn: () => authService.listSessions(),
  });
};

export const useRevokeMySession = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authService.revokeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsKeys.all });
      toast.success("Signed out of that session");
    },
    onError: (error: Error & { message?: string }) => {
      toast.error(error?.message || "Failed to sign out of that session");
    },
  });
};

// =============================================================================
// LOGOUT ALL DEVICES HOOK
// =============================================================================

export const useLogoutAll = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logoutAll(),
    onSuccess: () => {
      queryClient.clear();
      handleLogout();
      toast.success("Logged out of all devices");
    },
    onError: (error: Error & { message?: string }) => {
      toast.error(error?.message || "Failed to log out of all devices.");
      // Even if the API call fails, still log out locally — the admin asked
      // to be signed out everywhere, including here.
      queryClient.clear();
      handleLogout();
    },
  });
};

// =============================================================================
// FORGOT PASSWORD HOOK
// =============================================================================

export const useForgotPassword = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authService.forgotPassword(data),
    onSuccess: (response) => {
      toast.success(response?.message || "If this email is registered, a code has been sent");
    },
    onError: (error: Error & { message?: string }) => {
      toast.error(error?.message || "Failed to send reset code. Please try again.");
    },
  });
};

// =============================================================================
// VERIFY OTP HOOK
// =============================================================================

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
  });
};

// =============================================================================
// RESET PASSWORD HOOK
// =============================================================================

export const useResetPassword = () => {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset successful! Please sign in.");
      router.push(ROUTES.SIGN_IN);
    },
    onError: (error: Error & { message?: string }) => {
      toast.error(error?.message || "Failed to reset password. Please try again.");
    },
  });
};

// =============================================================================
// INVITATION HOOKS
// =============================================================================

/** Query key factory so callers can invalidate/refetch a specific token's lookup. */
export const INVITATION_QUERY_KEY = (token: string | null) => ["invitation", token] as const;

/**
 * Loads an invitation by token for the accept-invitation page. Does not
 * retry — a 410 (expired/used/revoked) or 404 is a terminal result, not a
 * transient failure.
 */
export const useInvitation = (token: string | null) => {
  return useQuery({
    queryKey: INVITATION_QUERY_KEY(token),
    queryFn: () => authService.getInvitation(token as string),
    enabled: !!token,
    retry: false,
  });
};

export const useAcceptInvitation = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: AcceptInvitationRequest) => authService.acceptInvitation(data),
    onSuccess: () => {
      toast.success("Account activated. Please sign in.");
    },
    onError: (error: Error & { message?: string }) => {
      toast.error(error?.message || "Failed to accept invitation. Please try again.");
    },
  });
};
