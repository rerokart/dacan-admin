"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService, type AuthAdmin } from "@/services/auth.service";
import { isAuthenticated, cleanupStoredUserRole } from "@/utils/helpers/token";

/**
 * Query key for the server-driven "who am I / what can I do" query.
 * Exported so `useLogin` can seed it directly on login success and other
 * hooks can invalidate it (e.g. after a 403).
 */
export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;

interface PermissionsContextValue {
  admin: AuthAdmin | null;
  permissions: Set<string>;
  isSuper: boolean;
  /** array = any-of; always true for a Super Admin */
  can: (key: string | string[]) => boolean;
  isLoading: boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  // One-time cleanup: older builds cached a `role` string on `admin_user`.
  // Role/permissions are now server-driven only — never trust localStorage
  // for anything security-relevant — so scrub any stale entry on mount.
  useEffect(() => {
    cleanupStoredUserRole();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: authService.me,
    enabled: isAuthenticated(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // A 403 from any API call means the admin's permissions may have changed
  // (role edited, suspended, etc). Refetch so the panel reflects reality;
  // the toast itself is shown by the calling hook's onError.
  useEffect(() => {
    const handleForbidden = () => {
      queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
    };
    window.addEventListener("auth:forbidden", handleForbidden);
    return () => window.removeEventListener("auth:forbidden", handleForbidden);
  }, [queryClient]);

  const admin = data?.admin ?? null;
  const permissions = new Set(data?.permissions ?? []);
  const isSuper = admin?.role?.is_super ?? false;

  const can = (key: string | string[]): boolean => {
    if (isSuper) return true;
    if (Array.isArray(key)) return key.some((k) => permissions.has(k));
    return permissions.has(key);
  };

  const value: PermissionsContextValue = {
    admin,
    permissions,
    isSuper,
    can,
    isLoading,
  };

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export const usePermissions = (): PermissionsContextValue => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
