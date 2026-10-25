"use client";

import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Can from "@/components/auth/Can";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { usePermissions } from "@/context/AuthContext";
import { useArrivals } from "@/hooks/useArrivals";
import { formatCurrency, formatDate } from "@/utils/helpers/helperfn";
import ArrivalFormModal from "./ArrivalFormModal";
import Pager from "./Pager";

const TH = "px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400";
const TD = "px-4 py-3 text-sm text-gray-600 dark:text-gray-400";

export default function ArrivalsTab() {
  const { can } = usePermissions();
  const showCost = can("products.view_cost");
  const [page, setPage] = useState(1);
  const [supplier, setSupplier] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState(false);

  const { data, isLoading, error } = useArrivals({
    supplier: supplier.trim() || undefined,
    date_from: from || undefined,
    date_to: to || undefined,
    page,
    limit: 20,
  });
  const rows = data?.arrivals ?? [];

  const changeFilter = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] lg:flex-row lg:items-end">
        <div className="flex-1">
          <Label htmlFor="arr-f-supplier">Supplier</Label>
          <Input id="arr-f-supplier" type="text" value={supplier} onChange={(e) => changeFilter(() => setSupplier(e.target.value))} placeholder="Search supplier" />
        </div>
        <div>
          <Label htmlFor="arr-f-from">From</Label>
          <Input id="arr-f-from" type="date" value={from} onChange={(e) => changeFilter(() => setFrom(e.target.value))} />
        </div>
        <div>
          <Label htmlFor="arr-f-to">To</Label>
          <Input id="arr-f-to" type="date" value={to} onChange={(e) => changeFilter(() => setTo(e.target.value))} />
        </div>
        {/* Recording an arrival carries cost, so it needs both permissions. */}
        <Can permission="inventory.create">
          <Can permission="products.view_cost">
            <button
              onClick={() => setOpen(true)}
              className="h-11 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
            >
              Record arrival
            </button>
          </Can>
        </Can>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">Failed to load arrivals. Please try again.</div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No stock arrivals found.</div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-200 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className={`${TH} text-left`}>Received</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>Product</TableCell>
                  <TableCell isHeader className={`${TH} text-center`}>Quantity</TableCell>
                  {showCost && (
                    <>
                      <TableCell isHeader className={`${TH} text-right`}>Cost (without GST)</TableCell>
                      <TableCell isHeader className={`${TH} text-center`}>GST</TableCell>
                      <TableCell isHeader className={`${TH} text-right`}>Cost with GST</TableCell>
                    </>
                  )}
                  <TableCell isHeader className={`${TH} text-left`}>Supplier</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>Batch</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>Expiry</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>By</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id} className="border-b border-gray-100 dark:border-gray-800">
                    <TableCell className={`${TD} whitespace-nowrap`}>{formatDate(a.received_on)}</TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{a.product_name}</p>
                      <p className="text-xs text-gray-500">
                        {a.variant_label ? `${a.variant_label} · ` : ""}
                        {a.sku}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">{a.quantity}</TableCell>
                    {showCost && (
                      <>
                        <TableCell className={`${TD} text-right tabular-nums`}>
                          {a.unit_cost != null ? formatCurrency(a.unit_cost) : "-"}
                        </TableCell>
                        <TableCell className={`${TD} text-center`}>
                          {a.purchase_gst_rate != null ? `${a.purchase_gst_rate}%` : "-"}
                        </TableCell>
                        <TableCell className={`${TD} text-right tabular-nums`}>
                          {a.cost_with_gst != null ? formatCurrency(a.cost_with_gst) : "-"}
                        </TableCell>
                      </>
                    )}
                    <TableCell className={TD}>{a.supplier_name ?? "-"}</TableCell>
                    <TableCell className={TD}>{a.batch_no ?? "-"}</TableCell>
                    <TableCell className={`${TD} whitespace-nowrap`}>{a.expires_on ? formatDate(a.expires_on) : "-"}</TableCell>
                    <TableCell className={TD}>{a.created_by?.name ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <Pager page={page} totalPages={data?.pagination?.total_pages ?? 1} onPage={setPage} />
      </div>

      <ArrivalFormModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
