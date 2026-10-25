"use client";

import React, { useState } from "react";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useExpiring } from "@/hooks/useArrivals";
import { formatDate } from "@/utils/helpers/helperfn";
import Pager from "./Pager";

const TH = "px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400";
const TD = "px-4 py-3 text-sm text-gray-600 dark:text-gray-400";

const DAY_OPTIONS = [
  { value: "", label: "Store setting" },
  { value: "7", label: "7 days" },
  { value: "15", label: "15 days" },
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "180 days" },
];

export default function ExpiringTab() {
  const [days, setDays] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useExpiring(days === "" ? undefined : Number(days), page);
  const rows = data?.expiring ?? [];

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-end justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="w-full sm:w-56">
          <Label htmlFor="exp-days">Expiring within</Label>
          <Select
            id="exp-days"
            options={DAY_OPTIONS}
            value={days}
            onChange={(v) => {
              setDays(v);
              setPage(1);
            }}
          />
        </div>
        {data && <p className="text-sm text-gray-500">Showing items that expire within {data.days} days, and any already expired.</p>}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">Failed to load expiring stock. Please try again.</div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No stock is close to expiry.</div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-200 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className={`${TH} text-left`}>Product</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>Batch</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>Supplier</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>Expires on</TableCell>
                  <TableCell isHeader className={`${TH} text-center`}>Days left</TableCell>
                  <TableCell isHeader className={`${TH} text-center`}>Remaining</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const expired = r.days_left < 0;
                  return (
                    <TableRow key={r.arrival_id} className="border-b border-gray-100 dark:border-gray-800">
                      <TableCell className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{r.product_name}</p>
                        <p className="text-xs text-gray-500">
                          {r.variant_label ? `${r.variant_label} · ` : ""}
                          {r.sku}
                        </p>
                      </TableCell>
                      <TableCell className={TD}>{r.batch_no ?? "-"}</TableCell>
                      <TableCell className={TD}>{r.supplier_name ?? "-"}</TableCell>
                      <TableCell className={`${TD} whitespace-nowrap ${expired ? "text-red-600 dark:text-red-400" : ""}`}>
                        {formatDate(r.expires_on)}
                      </TableCell>
                      <TableCell
                        className={`px-4 py-3 text-center text-sm font-semibold ${
                          expired ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {expired ? `Expired ${Math.abs(r.days_left)} days ago` : r.days_left}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                        {r.remaining_quantity}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        <Pager page={page} totalPages={data?.pagination?.total_pages ?? 1} onPage={setPage} />
      </div>
    </div>
  );
}
