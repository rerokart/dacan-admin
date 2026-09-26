"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select from "@/components/form/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { useModal } from "@/hooks/useModal";
import { usePermissions } from "@/context/AuthContext";
import Can from "@/components/auth/Can";
import AdminStatusBadge from "@/components/admin-access/AdminStatusBadge";
import InviteAdminModal from "@/components/admin-access/InviteAdminModal";
import EditAdminModal from "@/components/admin-access/EditAdminModal";
import ConfirmActionDialog from "@/components/admin-access/ConfirmActionDialog";
import {
  useAdmins,
  useRoles,
  useResendInvite,
  useRevokeInvite,
  useSuspendAdmin,
  useReactivateAdmin,
  useArchiveAdmin,
  useRevokeSessions,
} from "@/hooks/useAdminAccess";
import type { AdminListItem, AdminStatus } from "@/services/admin-access.service";
import { getRelativeTime } from "@/utils/helpers/helperfn";

const PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "invited", label: "Invited" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "archived", label: "Archived" },
];

const DANGER_DROPDOWN_ITEM_CLASS =
  "block w-full text-left px-4 py-2 text-sm text-error-500 hover:bg-gray-100 hover:text-error-600 dark:hover:bg-gray-800";

type PendingAction =
  | { type: "suspend"; admin: AdminListItem }
  | { type: "archive"; admin: AdminListItem }
  | { type: "revoke-invite"; admin: AdminListItem }
  | { type: "revoke-sessions"; admin: AdminListItem };

const getConfirmCopy = (action: PendingAction) => {
  const { admin } = action;
  switch (action.type) {
    case "suspend":
      return {
        title: "Suspend admin",
        description: `Suspend ${admin.full_name}? They will be signed out of all devices immediately.`,
        confirmLabel: "Suspend",
      };
    case "archive":
      return {
        title: "Archive admin",
        description: `Archive ${admin.full_name}? Their account is disabled and the email is freed for a future invite.`,
        confirmLabel: "Archive",
      };
    case "revoke-invite":
      return {
        title: "Revoke invitation",
        description: `Revoke the invitation for ${admin.full_name} (${admin.email})? This cannot be undone.`,
        confirmLabel: "Revoke invite",
      };
    case "revoke-sessions":
      return {
        title: "Revoke sessions",
        description: `Sign ${admin.full_name} out of all devices now?`,
        confirmLabel: "Revoke sessions",
      };
  }
};

export default function AdminsTab() {
  const { admin: currentAdmin } = usePermissions();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AdminStatus | "">("");
  const [roleId, setRoleId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Debounce the free-text search box so we don't re-fetch on every
  // keystroke; resets to page 1 whenever the effective query changes.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filters = useMemo(
    () => ({
      status: status || undefined,
      role_id: roleId || undefined,
      search: search || undefined,
      page,
      per_page: PER_PAGE,
    }),
    [status, roleId, search, page]
  );

  const { data, isLoading, error } = useAdmins(filters);
  const { data: rolesData } = useRoles();

  const admins = data?.admins ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const roleFilterOptions = useMemo(
    () => [
      { value: "", label: "All Roles" },
      ...(rolesData?.roles ?? []).map((role) => ({ value: role.id, label: role.name })),
    ],
    [rolesData]
  );

  const inviteModal = useModal();
  const editModal = useModal();
  const confirmModal = useModal();

  const [editingAdmin, setEditingAdmin] = useState<AdminListItem | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const resendInvite = useResendInvite();
  const revokeInvite = useRevokeInvite();
  const suspendAdmin = useSuspendAdmin();
  const reactivateAdmin = useReactivateAdmin();
  const archiveAdmin = useArchiveAdmin();
  const revokeSessions = useRevokeSessions();

  const isConfirmLoading =
    suspendAdmin.isPending ||
    archiveAdmin.isPending ||
    revokeInvite.isPending ||
    revokeSessions.isPending;

  const handleStatusChange = (value: string) => {
    setStatus((value || "") as AdminStatus | "");
    setPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRoleId(value);
    setPage(1);
  };

  const openEdit = (admin: AdminListItem) => {
    setOpenMenuId(null);
    setEditingAdmin(admin);
    editModal.openModal();
  };

  const openConfirm = (action: PendingAction) => {
    setOpenMenuId(null);
    setPendingAction(action);
    confirmModal.openModal();
  };

  const closeConfirm = () => {
    confirmModal.closeModal();
    setPendingAction(null);
  };

  const runPendingAction = () => {
    if (!pendingAction) return;
    const { type, admin } = pendingAction;
    const onSuccess = { onSuccess: closeConfirm };
    if (type === "suspend") suspendAdmin.mutate(admin.id, onSuccess);
    else if (type === "archive") archiveAdmin.mutate(admin.id, onSuccess);
    else if (type === "revoke-invite") revokeInvite.mutate(admin.id, onSuccess);
    else if (type === "revoke-sessions") revokeSessions.mutate(admin.id, onSuccess);
  };

  const confirmCopy = pendingAction ? getConfirmCopy(pendingAction) : null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:w-64"
            />
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Select
            options={STATUS_FILTER_OPTIONS}
            value={status}
            onChange={handleStatusChange}
            placeholder="All Statuses"
            className="w-full sm:w-44"
          />
          <Select
            options={roleFilterOptions}
            value={roleId}
            onChange={handleRoleChange}
            placeholder="All Roles"
            className="w-full sm:w-48"
          />
        </div>

        <Can permission="admin_access.manage">
          <button
            type="button"
            onClick={inviteModal.openModal}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
          >
            Invite admin
          </button>
        </Can>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">
            Failed to load admins. Please try again.
          </div>
        ) : admins.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No admins found.</div>
        ) : (
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Role
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last login
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  Sessions
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => {
                const isSelf = admin.id === currentAdmin?.id;
                return (
                  <TableRow key={admin.id} className="border-b border-gray-100 dark:border-gray-800">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {admin.full_name}
                        </span>
                        {isSelf && (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                            You
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {admin.email}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {admin.role.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <AdminStatusBadge status={admin.status} />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {admin.last_login_at ? getRelativeTime(admin.last_login_at) : "Never"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                      {admin.active_sessions}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Can permission="admin_access.manage">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            className="dropdown-toggle rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId((prev) => (prev === admin.id ? null : admin.id));
                            }}
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01"
                              />
                            </svg>
                          </button>
                          <Dropdown
                            isOpen={openMenuId === admin.id}
                            onClose={() => setOpenMenuId(null)}
                            className="w-48"
                          >
                            {admin.status === "invited" && (
                              <>
                                <DropdownItem onItemClick={() => resendInvite.mutate(admin.id)}>
                                  Resend invite
                                </DropdownItem>
                                <DropdownItem
                                  onItemClick={() => openConfirm({ type: "revoke-invite", admin })}
                                  baseClassName={DANGER_DROPDOWN_ITEM_CLASS}
                                >
                                  Revoke invite
                                </DropdownItem>
                              </>
                            )}
                            {admin.status === "active" && (
                              <>
                                <DropdownItem onItemClick={() => openEdit(admin)}>Edit</DropdownItem>
                                {!isSelf && (
                                  <DropdownItem
                                    onItemClick={() => openConfirm({ type: "suspend", admin })}
                                  >
                                    Suspend
                                  </DropdownItem>
                                )}
                                <DropdownItem
                                  onItemClick={() => openConfirm({ type: "revoke-sessions", admin })}
                                >
                                  Revoke sessions
                                </DropdownItem>
                                {!isSelf && (
                                  <DropdownItem
                                    onItemClick={() => openConfirm({ type: "archive", admin })}
                                    baseClassName={DANGER_DROPDOWN_ITEM_CLASS}
                                  >
                                    Archive
                                  </DropdownItem>
                                )}
                              </>
                            )}
                            {admin.status === "suspended" && (
                              <>
                                <DropdownItem onItemClick={() => reactivateAdmin.mutate(admin.id)}>
                                  Reactivate
                                </DropdownItem>
                                <DropdownItem onItemClick={() => openEdit(admin)}>Edit</DropdownItem>
                                {!isSelf && (
                                  <DropdownItem
                                    onItemClick={() => openConfirm({ type: "archive", admin })}
                                    baseClassName={DANGER_DROPDOWN_ITEM_CLASS}
                                  >
                                    Archive
                                  </DropdownItem>
                                )}
                              </>
                            )}
                          </Dropdown>
                        </div>
                      </Can>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Can permission="admin_access.manage">
        <InviteAdminModal isOpen={inviteModal.isOpen} onClose={inviteModal.closeModal} />
        <EditAdminModal
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.closeModal();
            setEditingAdmin(null);
          }}
          admin={editingAdmin}
        />
        {confirmCopy && (
          <ConfirmActionDialog
            isOpen={confirmModal.isOpen}
            onClose={closeConfirm}
            onConfirm={runPendingAction}
            title={confirmCopy.title}
            description={confirmCopy.description}
            confirmLabel={confirmCopy.confirmLabel}
            isLoading={isConfirmLoading}
            danger
          />
        )}
      </Can>
    </div>
  );
}
