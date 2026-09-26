"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  authService,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
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
    onSuccess: () => {
      toast.success("If an account exists for that email, a reset code has been sent.");
    },
    onError: (error: Error & { message?: string }) => {
      toast.error(error?.message || "Failed to send reset email. Please try again.");
    },
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
