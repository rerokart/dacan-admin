"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Can from "@/components/auth/Can";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useDeleteGstRate, useGstRates, useUpdateGstRate } from "@/hooks/useTaxSettings";
import type { GstRate } from "@/services/taxSettings.service";
import GstRateFormModal from "./GstRateFormModal";
import { dangerIconBtn, formatRate, iconBtn, primaryBtn, th } from "./styles";

export default function GstRatesTab() {
  const { confirm } = useConfirm();
  const { data: rates = [], isLoading, error } = useGstRates();
  const { mutate: updateRate, isPending: isUpdating } = useUpdateGstRate();
  const { mutate: deleteRate } = useDeleteGstRate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GstRate | null>(null);

  const sorted = [...rates].sort((a, b) => a.rate - b.rate);

  const handleDelete = async (rate: GstRate) => {
    const ok = await confirm({
      title: "Delete GST rate",
      message: `Delete ${formatRate(rate.rate)} (${rate.label})? This can't be undone.`,
      variant: "danger",
      confirmText: "Delete",
    });
    if (ok) deleteRate(rate.id); // a 409 "in use" message is shown by the hook's error toast
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          The rates products, HSN codes and the settings can use. A rate&apos;s value can&apos;t be changed.
        </p>
        <Can permission="settings.edit">
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className={primaryBtn}
          >
            Add rate
          </button>
        </Can>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">Failed to load GST rates. Please try again.</div>
      ) : sorted.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No GST rates yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className={`${th} text-left`}>Rate</TableCell>
                <TableCell isHeader className={`${th} text-left`}>Label</TableCell>
                <TableCell isHeader className={`${th} text-center`}>Status</TableCell>
                <TableCell isHeader className={`${th} text-right`}>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((rate) => (
                <TableRow key={rate.id} className="border-b border-gray-100 dark:border-gray-800">
                  <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {formatRate(rate.rate)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">{rate.label}</TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge variant="light" color={rate.is_active ? "success" : "warning"}>
                      {rate.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Can permission="settings.edit">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => updateRate({ id: rate.id, data: { is_active: !rate.is_active } })}
                          disabled={isUpdating}
                          className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          {rate.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => {
                            setEditing(rate);
                            setFormOpen(true);
                          }}
                          className={iconBtn}
                          title="Edit"
                          aria-label="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(rate)} className={dangerIconBtn} title="Delete" aria-label="Delete">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </Can>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <GstRateFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} rate={editing} />
    </div>
  );
}
