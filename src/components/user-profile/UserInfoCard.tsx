"use client";

import React from "react";
import { usePermissions } from "@/context/AuthContext";
import { formatDate, getRelativeTime } from "@/utils/helpers/helperfn";

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
  archived: "Archived",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-white/90 break-all">{children}</p>
    </div>
  );
}

/** Read-only account details. Email and role are changed only by a Super
 *  Admin (Settings → Admin Access); the name is edited from the header card. */
export default function UserInfoCard() {
  const { admin } = usePermissions();

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
        Account details
      </h4>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:mt-0 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
        <Field label="Full name">{admin?.full_name || "—"}</Field>
        <Field label="Email address">{admin?.email ?? "—"}</Field>
        <Field label="Role">{admin?.role.name ?? "—"}</Field>
        <Field label="Status">{admin ? STATUS_LABEL[admin.status] ?? admin.status : "—"}</Field>
        <Field label="Last login">
          {admin?.last_login_at
            ? `${formatDate(admin.last_login_at)} (${getRelativeTime(admin.last_login_at)})`
            : "—"}
        </Field>
        <Field label="Member since">{admin?.created_at ? formatDate(admin.created_at) : "—"}</Field>
      </div>

      <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        Contact a Super Admin to change your email or role.
      </p>
    </div>
  );
}
