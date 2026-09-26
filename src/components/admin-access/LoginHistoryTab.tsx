"use client";

import React, { useMemo, useState } from "react";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useAdmins } from "@/hooks/useAdminAccess";
import { useLoginHistory } from "@/hooks/useAudit";
import type { LoginFailureReason, LoginHistoryListParams } from "@/services/audit.service";
import { formatDate, shortenUserAgent } from "@/utils/helpers/helperfn";

const PER_PAGE = 20;

const RESULT_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Results" },
  { value: "true", label: "Success" },
  { value: "false", label: "Failed" },
];

const FAILURE_REASON_LABELS: Record<Exclude<LoginFailureReason, null>, string> = {
  bad_password: "Bad password",
  unknown_email: "Unknown email",
  locked: "Locked",
  not_active: "Not active",
  rate_limited: "Rate limited",
};

const failureReasonLabel = (reason: LoginFailureReason): string =>
  reason ? FAILURE_REASON_LABELS[reason] ?? reason : "—";

export default function LoginHistoryTab() {
  const [page, setPage] = useState(1);
  const [adminId, setAdminId] = useState("");
  const [result, setResult] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Login attempts can be against an admin who was later archived, so — same
  // as the audit log's actor filter — merge the non-archived and archived
  // admin lists for the filter dropdown.
  const { data: currentAdmins } = useAdmins({ per_page: 100 });
  const { data: archivedAdmins } = useAdmins({ status: "archived", per_page: 100 });

  const adminOptions = useMemo(() => {
    const byId = new Map<string, string>();
    [...(currentAdmins?.admins ?? []), ...(archivedAdmins?.admins ?? [])].forEach((admin) => {
      byId.set(admin.id, `${admin.full_name} (${admin.email})`);
    });
    return [
      { value: "", label: "All Admins" },
      ...Array.from(byId.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, label]) => ({ value, label })),
    ];
  }, [currentAdmins, archivedAdmins]);

  const adminLookup = useMemo(() => {
    const byId = new Map<string, string>();
    [...(currentAdmins?.admins ?? []), ...(archivedAdmins?.admins ?? [])].forEach((admin) => {
      byId.set(admin.id, admin.full_name);
    });
    return byId;
  }, [currentAdmins, archivedAdmins]);

  const filters = useMemo<LoginHistoryListParams>(
    () => ({
      admin_id: adminId || undefined,
      success: result === "" ? undefined : result === "true",
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page,
      per_page: PER_PAGE,
    }),
    [adminId, result, dateFrom, dateTo, page]
  );

  const { data, isLoading, error } = useLoginHistory(filters);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const resetPage = () => setPage(1);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-4 pb-4 lg:flex-row lg:flex-wrap lg:items-center">
        <Select
          options={adminOptions}
          value={adminId}
          onChange={(v) => {
            setAdminId(v);
            resetPage();
          }}
          placeholder="All Admins"
          className="w-full lg:w-56"
        />
        <Select
          options={RESULT_FILTER_OPTIONS}
          value={result}
          onChange={(v) => {
            setResult(v);
            resetPage();
          }}
          placeholder="All Results"
          className="w-full lg:w-44"
        />
        <div className="flex w-full items-center gap-2 lg:w-auto">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              resetPage();
            }}
            className="w-full lg:w-40"
          />
          <span className="text-sm text-gray-400">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              resetPage();
            }}
            className="w-full lg:w-40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">
            Failed to load login history. Please try again.
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No login attempts found.</div>
        ) : (
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Time
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email attempted
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Admin
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  Result
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Reason
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  IP
                </TableCell>
                <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Device
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((entry) => (
                <TableRow key={entry.id} className="border-b border-gray-100 dark:border-gray-800">
                  <TableCell className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(entry.created_at, "datetime")}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {entry.email_attempted}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {entry.admin_id ? adminLookup.get(entry.admin_id) ?? "—" : "—"}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-center">
                    <Badge variant="light" color={entry.success ? "success" : "error"}>
                      {entry.success ? "Success" : "Failed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {failureReasonLabel(entry.failure_reason)}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {entry.ip || "—"}
                  </TableCell>
                  <TableCell className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {shortenUserAgent(entry.user_agent)}
                  </TableCell>
                </TableRow>
              ))}
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
    </div>
  );
}
