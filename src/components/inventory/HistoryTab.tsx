"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { usePermissions } from "@/context/AuthContext";
import { useAdmins } from "@/hooks/useAdminAccess";
import { useMovements } from "@/hooks/useInventory";
import { formatDate } from "@/utils/helpers/helperfn";
import Pager from "./Pager";
import VariantPicker from "./VariantPicker";
import { MOVEMENT_REASON_LABELS, SUB_REASON_LABELS } from "./inventoryTabs";

const TH = "px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400";
const FILTER_KEYS = ["variant_id", "reason_type", "date_from", "date_to", "admin_id"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

export default function HistoryTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can } = usePermissions();
  const [pageState, setPageState] = useState({ key: "", page: 1 });
  const [pickedLabel, setPickedLabel] = useState("");

  // Filters live in the URL so a link from the Stock tab (or a shared link) restores them.
  const filters: Record<FilterKey, string> = {
    variant_id: searchParams.get("variant_id") ?? "",
    reason_type: searchParams.get("reason_type") ?? "",
    date_from: searchParams.get("date_from") ?? "",
    date_to: searchParams.get("date_to") ?? "",
    admin_id: searchParams.get("admin_id") ?? "",
  };

  const filterKey = FILTER_KEYS.map((k) => searchParams.get(k) ?? "").join("|");
  // The page belongs to one set of filters; any change (including back or a shared link) starts at page 1.
  const page = pageState.key === filterKey ? pageState.page : 1;
  const setPage = (p: number | ((x: number) => number)) =>
    setPageState({ key: filterKey, page: typeof p === "function" ? p(page) : p });

  const setFilter = (key: FilterKey, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "history");
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/inventory?${params.toString()}`);
  };

  const canPickUser = can("admin_access.view");
  const { data: admins } = useAdmins(canPickUser ? { per_page: 100 } : undefined);

  const { data, isLoading, error } = useMovements({
    variant_id: filters.variant_id || undefined,
    reason_type: filters.reason_type || undefined,
    // Store time (IST) day bounds; the server reads full timestamps.
    date_from: filters.date_from ? `${filters.date_from}T00:00:00+05:30` : undefined,
    date_to: filters.date_to ? `${filters.date_to}T23:59:59.999+05:30` : undefined,
    admin_id: filters.admin_id || undefined,
    page,
    limit: 20,
  });

  const rows = data?.movements ?? [];
  const totalPages = data?.pagination?.total_pages ?? 1;

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <Label htmlFor="hist-variant">Product or variant</Label>
          {filters.variant_id ? (
            <div className="flex h-11 items-center justify-between gap-2 rounded-lg border border-gray-300 px-4 text-sm dark:border-gray-700 dark:text-white/90">
              <span className="truncate">{pickedLabel || "One item"}</span>
              <button
                type="button"
                onClick={() => {
                  setPickedLabel("");
                  setFilter("variant_id", "");
                }}
                className="shrink-0 text-xs font-medium text-brand-500 hover:text-brand-600"
              >
                Clear
              </button>
            </div>
          ) : (
            <VariantPicker
              id="hist-variant"
              value={null}
              onChange={(v) => {
                if (!v) return;
                setPickedLabel(`${v.label} (${v.sku})`);
                setFilter("variant_id", v.variant_id);
              }}
              placeholder="All items (search to filter)"
            />
          )}
        </div>
        <div>
          <Label htmlFor="hist-reason">Reason</Label>
          <Select
            id="hist-reason"
            options={[
              { value: "", label: "All reasons" },
              ...Object.entries(MOVEMENT_REASON_LABELS).map(([value, label]) => ({ value, label })),
            ]}
            value={filters.reason_type}
            onChange={(v) => setFilter("reason_type", v)}
          />
        </div>
        <div>
          <Label htmlFor="hist-from">From</Label>
          <Input id="hist-from" type="date" value={filters.date_from} onChange={(e) => setFilter("date_from", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="hist-to">To</Label>
          <Input id="hist-to" type="date" value={filters.date_to} onChange={(e) => setFilter("date_to", e.target.value)} />
        </div>
        {canPickUser && (
          <div>
            <Label htmlFor="hist-user">User</Label>
            <Select
              id="hist-user"
              options={[
                { value: "", label: "All users" },
                ...(admins?.admins ?? []).map((a) => ({ value: a.id, label: a.full_name })),
              ]}
              value={filters.admin_id}
              onChange={(v) => setFilter("admin_id", v)}
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">Failed to load stock history. Please try again.</div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No stock changes match these filters</div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-200 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className={`${TH} text-left`}>Time</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>SKU</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>Product</TableCell>
                  <TableCell isHeader className={`${TH} text-center`}>Change</TableCell>
                  <TableCell isHeader className={`${TH} text-center`}>Before</TableCell>
                  <TableCell isHeader className={`${TH} text-center`}>After</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>Reason</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>User</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>Order</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>Note</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((m) => (
                  <TableRow key={m.id} className="border-b border-gray-100 dark:border-gray-800">
                    <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(m.created_at, "datetime")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{m.sku ?? "-"}</TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{m.product_name}</p>
                      {m.variant_label && <p className="text-xs text-gray-500">{m.variant_label}</p>}
                    </TableCell>
                    <TableCell
                      className={`px-4 py-3 text-center text-sm font-semibold ${
                        m.quantity_change < 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">{m.quantity_before}</TableCell>
                    <TableCell className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">{m.quantity_after}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {MOVEMENT_REASON_LABELS[m.reason_type] ?? m.reason_type}
                      {m.sub_reason ? ` (${SUB_REASON_LABELS[m.sub_reason] ?? m.sub_reason})` : ""}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{m.admin?.name ?? "System"}</TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {m.order_id ? m.order_id.slice(0, 8) : "-"}
                    </TableCell>
                    <TableCell className="max-w-[220px] px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{m.note ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Pager page={page} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
  );
}
