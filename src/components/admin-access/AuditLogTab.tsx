"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Badge from "@/components/ui/badge/Badge";
import Can from "@/components/auth/Can";
import { ChevronDownIcon, ChevronUpIcon, DownloadIcon } from "@/icons";
import { usePermissions } from "@/context/AuthContext";
import { useAdmins, usePermissionCatalog } from "@/hooks/useAdminAccess";
import { useAuditLog, useExportAudit, useVerifyAudit } from "@/hooks/useAudit";
import type { AuditCategory, AuditLogListParams } from "@/services/audit.service";
import { downloadBlob, formatDate, shortenUserAgent } from "@/utils/helpers/helperfn";

const PER_PAGE = 20;
const ACTION_DEBOUNCE_MS = 300;

const formatLabel = (value: string): string =>
  value
    .split("_")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");

const CATEGORY_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "data", label: "Data" },
  { value: "security", label: "Security" },
];

const prettyJson = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export default function AuditLogTab() {
  const { isSuper } = usePermissions();

  const [page, setPage] = useState(1);
  const [actorId, setActorId] = useState("");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState<AuditCategory | "">("");
  const [actionInput, setActionInput] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setAction(actionInput.trim());
      setPage(1);
    }, ACTION_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [actionInput]);

  // The actor filter needs to reach admins whose account was later archived
  // (an archived admin's past actions still show up in the log), so the
  // active/invited/suspended list and the archived list are fetched
  // separately and merged — the backend only returns archived rows when
  // `status=archived` is passed explicitly.
  // 100 is the backend's MAX_PER_PAGE — good enough for a filter dropdown at
  // this app's scale; a busier install would need a searchable async select.
  const { data: currentAdmins } = useAdmins({ per_page: 100 });
  const { data: archivedAdmins } = useAdmins({ status: "archived", per_page: 100 });
  const { data: catalogData } = usePermissionCatalog();

  const actorOptions = useMemo(() => {
    const byId = new Map<string, string>();
    [...(currentAdmins?.admins ?? []), ...(archivedAdmins?.admins ?? [])].forEach((admin) => {
      byId.set(admin.id, `${admin.full_name} (${admin.email})`);
    });
    return [
      { value: "", label: "All Actors" },
      ...Array.from(byId.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, label]) => ({ value, label })),
    ];
  }, [currentAdmins, archivedAdmins]);

  const areaOptions = useMemo(
    () => [
      { value: "", label: "All Areas" },
      ...(catalogData?.areas ?? []).map((a) => ({ value: a.area, label: formatLabel(a.area) })),
    ],
    [catalogData]
  );

  const filters = useMemo<AuditLogListParams>(
    () => ({
      actor_admin_id: actorId || undefined,
      area: area || undefined,
      category: category || undefined,
      action: action || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page,
      per_page: PER_PAGE,
    }),
    [actorId, area, category, action, dateFrom, dateTo, page]
  );

  const { data, isLoading, error } = useAuditLog(filters);
  const exportAudit = useExportAudit();
  const verifyAudit = useVerifyAudit();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const resetPage = () => setPage(1);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = () => {
    // Export the full filtered set (no page/per_page — the export endpoint
    // ignores pagination and returns every matching row, up to the server's
    // 10,000-row cap).
    const exportFilters: AuditLogListParams = {
      actor_admin_id: actorId || undefined,
      area: area || undefined,
      category: category || undefined,
      action: action || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    };
    exportAudit.mutate(exportFilters, {
      onSuccess: (blob) => {
        const filename = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
        downloadBlob(blob, filename);
      },
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-4 pb-4 lg:flex-row lg:flex-wrap lg:items-center">
        <Select
          options={actorOptions}
          value={actorId}
          onChange={(v) => {
            setActorId(v);
            resetPage();
          }}
          placeholder="All Actors"
          className="w-full lg:w-56"
        />
        <Select
          options={areaOptions}
          value={area}
          onChange={(v) => {
            setArea(v);
            resetPage();
          }}
          placeholder="All Areas"
          className="w-full lg:w-48"
        />
        <Select
          options={CATEGORY_FILTER_OPTIONS}
          value={category}
          onChange={(v) => {
            setCategory((v || "") as AuditCategory | "");
            resetPage();
          }}
          placeholder="All Categories"
          className="w-full lg:w-44"
        />
        <Input
          type="text"
          placeholder="Action (e.g. products.edit)"
          value={actionInput}
          onChange={(e) => setActionInput(e.target.value)}
          className="w-full lg:w-56"
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

        <div className="flex flex-1 items-center justify-end gap-2">
          {isSuper && (
            <button
              type="button"
              onClick={() => verifyAudit.mutate()}
              disabled={verifyAudit.isPending}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              {verifyAudit.isPending ? "Verifying..." : "Verify integrity"}
            </button>
          )}
          <Can permission="audit_log.export">
            <button
              type="button"
              onClick={handleExport}
              disabled={exportAudit.isPending}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <DownloadIcon className="h-4 w-4" />
              {exportAudit.isPending ? "Exporting..." : "Export CSV"}
            </button>
          </Can>
        </div>
      </div>

      {/* Verify integrity result banner */}
      {verifyAudit.data && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
            verifyAudit.data.ok
              ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
              : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
          }`}
        >
          {verifyAudit.data.ok
            ? `Audit log intact — ${verifyAudit.data.checked} entries checked`
            : `Integrity check failed at entry #${verifyAudit.data.broken_id}`}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">
            Failed to load audit log. Please try again.
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No audit entries found.</div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Actor
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Record
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400" />
              </tr>
            </thead>
            <tbody>
              {items.map((entry) => {
                const id = String(entry.id);
                const isExpanded = expandedIds.has(id);
                return (
                  <React.Fragment key={id}>
                    <tr
                      className="cursor-pointer border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]"
                      onClick={() => toggleExpanded(id)}
                    >
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(entry.created_at, "datetime")}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {entry.actor ? entry.actor.full_name : "System"}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Badge
                          variant="light"
                          color={entry.category === "security" ? "error" : "light"}
                        >
                          {formatLabel(entry.category)}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm font-mono text-gray-700 dark:text-gray-300">
                        {entry.action}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {formatLabel(entry.area)}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {entry.record_id ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {isExpanded ? (
                          <ChevronUpIcon className="ml-auto h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="ml-auto h-4 w-4 text-gray-400" />
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
                            <div>
                              <p className="mb-1 font-semibold text-gray-500 dark:text-gray-400">
                                Before
                              </p>
                              <pre className="max-h-64 overflow-auto rounded-lg bg-white p-3 font-mono text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                                {prettyJson(entry.before)}
                              </pre>
                            </div>
                            <div>
                              <p className="mb-1 font-semibold text-gray-500 dark:text-gray-400">
                                After
                              </p>
                              <pre className="max-h-64 overflow-auto rounded-lg bg-white p-3 font-mono text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                                {prettyJson(entry.after)}
                              </pre>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>IP: {entry.ip || "—"}</span>
                            <span>Device: {shortenUserAgent(entry.user_agent)}</span>
                            {entry.actor && <span>Actor email: {entry.actor.email}</span>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
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
