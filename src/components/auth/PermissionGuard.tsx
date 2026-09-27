"use client";

import React from "react";
import Link from "next/link";
import { usePermissions } from "@/context/AuthContext";
import { ROUTES } from "@/utils/constants/NavigationRoutes";

interface PermissionGuardProps {
  /** array = any-of; a Super Admin always passes */
  permission: string | string[];
  children: React.ReactNode;
}

/**
 * Page-level route guard. While permissions are still loading it shows a
 * spinner and renders nothing else — `children` (and any data queries they
 * fire) are not mounted until we know the admin is allowed on this page.
 * If the admin lacks the permission it shows an in-page 403 panel instead
 * of the page content.
 */
export default function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const { can, isLoading, permissions, isSuper } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!can(permission)) {
    const canSeeDashboard = isSuper || permissions.has("analytics.view");

    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-24 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Access denied
        </h2>
        <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          You don&apos;t have access to this page. Ask a Super Admin if you need it.
        </p>
        <Link
          href={canSeeDashboard ? ROUTES.DASHBOARD : ROUTES.PROFILE}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          {canSeeDashboard ? "Go to Dashboard" : "Go to Profile"}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
