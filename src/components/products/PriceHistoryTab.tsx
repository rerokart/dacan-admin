"use client";

import React, { useState } from "react";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { percent, rupees } from "@/utils/productFormat";
import type { PriceHistoryEntry, PriceHistoryField } from "@/services/product.service";

const FIELD_LABELS: Record<PriceHistoryField, string> = {
  price: "Selling price",
  mrp: "MRP",
  min_selling_price: "Minimum price",
  cost_price: "Cost price",
  gst_rate: "GST rate",
};

const th = "px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400";
const td = "px-3 py-3 text-sm text-gray-700 dark:text-gray-300";
const pageButton =
  "rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-40 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-white/[0.03]";

const valueText = (field: PriceHistoryField, value: number | null) => {
  if (value === null || value === undefined) return "None";
  return field === "gst_rate" ? percent(Number(value)) : rupees(Number(value));
};

const when = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

const variantText = (row: PriceHistoryEntry) => {
  if (row.variant_name) return row.variant_name;
  // The product's own rows (GST rate) apply to every variant.
  return row.variant_id === null ? "All" : "-";
};

/** Price changes of one product, newest first, paged by the server. */
export default function PriceHistoryTab({ productId }: { productId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = usePriceHistory(productId, page);
  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Couldn&apos;t load the price history.{" "}
        <button type="button" onClick={() => refetch()} className="text-brand-500 hover:underline">
          Try again
        </button>
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        No price changes yet.
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className={th}>Date and time</th>
              <th className={th}>Variant</th>
              <th className={th}>Field</th>
              <th className={th}>Old → New</th>
              <th className={th}>Reason</th>
              <th className={th}>Admin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 align-top dark:border-gray-800">
                <td className={`${td} whitespace-nowrap`}>{when(row.created_at)}</td>
                <td className={td}>{variantText(row)}</td>
                <td className={`${td} whitespace-nowrap`}>{FIELD_LABELS[row.field] ?? row.field}</td>
                <td className={`${td} whitespace-nowrap tabular-nums`}>
                  {valueText(row.field, row.old_value)} → {valueText(row.field, row.new_value)}
                </td>
                <td className={`${td} max-w-xs break-words`}>{row.reason}</td>
                <td className={td}>{row.changed_by_name ?? (row.actor === "system" ? "System" : "-")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pagination.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.page} of {pagination.total_pages} · {pagination.total} changes
          </p>
          <div className="flex gap-2">
            <button type="button" className={pageButton} disabled={!pagination.has_prev} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <button type="button" className={pageButton} disabled={!pagination.has_next} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
