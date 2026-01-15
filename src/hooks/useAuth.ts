"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService, LoginRequest, RegisterRequest, ForgotPasswordRequest } from "@/services/auth.service";
import { setTokens, handleLogout } from "@/utils/helpers/token";
import { ROUTES } from "@/utils/constants/NavigationRoutes";
import { useToast } from "@/components/ui/toast";

// =============================================================================
// LOGIN HOOK
// =============================================================================

export const useLogin = () => {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      debugger;
      setTokens({ accessToken: response.access_token });
      toast.success(response.message || "Login successful!");
      router.push(ROUTES.DASHBOARD);
    },
    onError: (error: Error & { message?: string }) => {
      toast.error(error?.message || "Login failed. Please try again.");
    },
  });
};

// =============================================================================
// REGISTER HOOK
// =============================================================================

export const useRegister = () => {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      toast.success("Registration successful! Please sign in.");
      router.push(ROUTES.SIGN_IN);
    },
    onError: (error: Error & { message?: string }) => {
      toast.error(error?.message || "Registration failed. Please try again.");
    },
  });
};

// =============================================================================
// LOGOUT HOOK
// =============================================================================

export const useLogout = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      handleLogout();
      toast.success("Logged out successfully");
    },
    onError: () => {
      // Even if API fails, still log out locally
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
    onSuccess: () => {
      toast.success("Password reset email sent. Please check your inbox.");
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
    mutationFn: (data: { token: string; password: string }) =>
      authService.resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset successful! Please sign in.");
      router.push(ROUTES.SIGN_IN);
    },
    onError: (error: Error & { message?: string }) => {
      toast.error(error?.message || "Failed to reset password. Please try again.");
    },
  });
};
