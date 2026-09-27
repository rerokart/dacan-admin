"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePermissions } from "@/context/AuthContext";
import { useRoles, usePermissionCatalog, useUpdateRolePermissions } from "@/hooks/useAdminAccess";
import ConfirmActionDialog from "@/components/admin-access/ConfirmActionDialog";
import { LockIcon } from "@/icons";
import type { Role } from "@/services/admin-access.service";

interface RolesMatrixTabProps {
  /** Reported whenever any role column has unsaved draft changes, so the
   * page shell can guard tab switches. */
  onDirtyChange?: (dirty: boolean) => void;
}

const formatLabel = (value: string): string =>
  value
    .split("_")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");

const sameKeys = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((key) => setB.has(key));
};

export default function RolesMatrixTab({ onDirtyChange }: RolesMatrixTabProps) {
  const { can } = usePermissions();
  const canManage = can("admin_access.manage");

  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useRoles();
  const {
    data: catalogData,
    isLoading: catalogLoading,
    error: catalogError,
  } = usePermissionCatalog();
  const updateRolePermissions = useUpdateRolePermissions();

  const roles = useMemo(() => rolesData?.roles ?? [], [rolesData]);
  const areas = useMemo(() => catalogData?.areas ?? [], [catalogData]);

  // Local edits, per role id -> the full list of permission keys that role
  // *would* have if saved right now. Only roles the admin has actually
  // touched (toggled a checkbox, or just saved) get an entry here — anyone
  // else falls straight through to the server value (`role.permissions`),
  // so there's no props-to-state sync effect and no risk of a refetch
  // (triggered by saving a different column) clobbering an in-progress edit.
  const [overrides, setOverrides] = useState<Record<string, string[]>>({});

  const effectiveKeys = (role: Role): string[] => overrides[role.id] ?? role.permissions;

  const dirtyRoleIds = useMemo(() => {
    const dirty = new Set<string>();
    for (const role of roles) {
      const override = overrides[role.id];
      if (override && !sameKeys(override, role.permissions)) dirty.add(role.id);
    }
    return dirty;
  }, [roles, overrides]);

  useEffect(() => {
    onDirtyChange?.(dirtyRoleIds.size > 0);
  }, [dirtyRoleIds, onDirtyChange]);

  // Warn on browser/tab close while a draft is unsaved. Tab-switch-within-app
  // is guarded by the page shell via `onDirtyChange`.
  useEffect(() => {
    if (dirtyRoleIds.size === 0) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirtyRoleIds]);

  const [confirmRoleId, setConfirmRoleId] = useState<string | null>(null);

  const toggle = (role: Role, key: string) => {
    if (!canManage || role.is_super) return;
    setOverrides((prev) => {
      const current = new Set(prev[role.id] ?? role.permissions);
      if (current.has(key)) current.delete(key);
      else current.add(key);
      return { ...prev, [role.id]: Array.from(current) };
    });
  };

  const discard = (roleId: string) => {
    setOverrides((prev) => {
      if (!(roleId in prev)) return prev;
      const next = { ...prev };
      delete next[roleId];
      return next;
    });
  };

  const confirmRole = confirmRoleId ? (roles.find((r) => r.id === confirmRoleId) ?? null) : null;
  const confirmDraft = confirmRole ? effectiveKeys(confirmRole) : [];
  const confirmOriginal = confirmRole?.permissions ?? [];
  const added = confirmDraft.filter((key) => !confirmOriginal.includes(key));
  const removed = confirmOriginal.filter((key) => !confirmDraft.includes(key));

  const closeConfirm = () => setConfirmRoleId(null);

  const handleSave = () => {
    if (!confirmRoleId || !confirmRole) return;
    const roleId = confirmRoleId;
    updateRolePermissions.mutate(
      { roleId, keys: effectiveKeys(confirmRole) },
      {
        onSuccess: (response) => {
          setOverrides((prev) => ({ ...prev, [roleId]: response.role.permissions }));
          closeConfirm();
        },
      }
    );
  };

  if (rolesLoading || catalogLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (rolesError || catalogError) {
    return (
      <div className="py-12 text-center text-red-500">
        Failed to load roles and permissions. Please try again.
      </div>
    );
  }

  return (
    <div>
      {!canManage && (
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          View only — you don&apos;t have permission to edit role permissions.
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="sticky left-0 z-10 min-w-[220px] bg-white px-4 py-3 text-left text-sm font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                Permission
              </th>
              {roles.map((role) => {
                const isDirty = dirtyRoleIds.has(role.id);
                return (
                  <th
                    key={role.id}
                    className="min-w-[160px] px-4 py-3 text-center align-top text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex items-center gap-1">
                        {role.name}
                        {role.is_super && (
                          <span
                            title="Super Admin always has every permission"
                            className="inline-flex text-gray-400"
                          >
                            <LockIcon className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </span>
                      <span className="text-xs font-normal text-gray-400">
                        {role.admin_count} admin{role.admin_count === 1 ? "" : "s"}
                      </span>
                      {canManage && !role.is_super && isDirty && (
                        <div className="mt-1 flex flex-col items-center gap-1">
                          <span className="rounded-full bg-warning-50 px-2 py-0.5 text-[10px] font-medium text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
                            Unsaved
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => discard(role.id)}
                              className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              Discard
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmRoleId(role.id)}
                              className="text-xs font-medium text-brand-500 hover:text-brand-600 hover:underline"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {areas.map((area) => (
              <React.Fragment key={area.area}>
                <tr className="bg-gray-50 dark:bg-white/[0.03]">
                  <td
                    colSpan={roles.length + 1}
                    className="sticky left-0 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-white/[0.03] dark:text-gray-400"
                  >
                    {formatLabel(area.area)}
                  </td>
                </tr>
                {area.permissions.map((perm) => (
                  <tr
                    key={perm.key}
                    className="border-b border-gray-100 last:border-b-0 dark:border-gray-800"
                  >
                    <td className="sticky left-0 z-10 bg-white px-4 py-2.5 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                      <span title={perm.description}>{formatLabel(perm.action)}</span>
                    </td>
                    {roles.map((role) => {
                      const checked = role.is_super || effectiveKeys(role).includes(perm.key);
                      return (
                        <td key={role.id} className="px-4 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!canManage || role.is_super}
                            onChange={() => toggle(role, perm.key)}
                            aria-label={`${perm.key} for ${role.name}`}
                            title={role.is_super ? "Super Admin always has every permission" : perm.description}
                            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-brand-500 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {confirmRole && (
        <ConfirmActionDialog
          isOpen={!!confirmRoleId}
          onClose={closeConfirm}
          onConfirm={handleSave}
          title={`Save permissions for ${confirmRole.name}`}
          confirmLabel="Save"
          isLoading={updateRolePermissions.isPending}
          description={
            <div>
              {added.length === 0 && removed.length === 0 ? (
                <p>No changes.</p>
              ) : (
                <ul className="space-y-1 font-mono text-xs">
                  {added.map((key) => (
                    <li key={`added-${key}`} className="text-success-600 dark:text-success-400">
                      + {key}
                    </li>
                  ))}
                  {removed.map((key) => (
                    <li key={`removed-${key}`} className="text-error-500">
                      − {key}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Admins with this role get the change on their next action.
              </p>
            </div>
          }
        />
      )}
    </div>
  );
}
