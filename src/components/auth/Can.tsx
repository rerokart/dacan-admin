"use client";

import React from "react";
import { usePermissions } from "@/context/AuthContext";

interface CanProps {
  /** array = any-of; a Super Admin always passes */
  permission: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Renders `children` only if the current admin holds `permission`
 * (any-of when an array is passed). Used to hide/show buttons and
 * other in-page controls — never the sole guard for a route; that's
 * `PermissionGuard`.
 */
export default function Can({ permission, fallback = null, children }: CanProps) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
