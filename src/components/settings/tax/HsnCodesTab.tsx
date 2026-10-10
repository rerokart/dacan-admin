"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Can from "@/components/auth/Can";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useDeleteHsnCode, useHsnCodes } from "@/hooks/useTaxSettings";
import type { HsnCode } from "@/services/taxSettings.service";
import HsnFormModal from "./HsnFormModal";
import { dangerIconBtn, formatRate, iconBtn, primaryBtn, th } from "./styles";

const PAGE_SIZE = 20;

export default function HsnCodesTab() {
  const { confirm } = useConfirm();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HsnCode | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, error } = useHsnCodes({ page, limit: PAGE_SIZE, ...(search ? { search } : {}) });
  const { mutate: deleteHsn } = useDeleteHsnCode();

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  // After deleting the last row of the final page, step back a page.
  if (pagination && page > 1 && page > pagination.total_pages) {
    setPage(Math.max(1, pagination.total_pages));
  }

  const handleDelete = async (hsn: HsnCode) => {
    const ok = await confirm({
      title: "Delete HSN code",
      message: `Delete ${hsn.code}? This can't be undone.`,
      variant: "danger",
      confirmText: "Delete",
    });
    if (ok) deleteHsn(hsn.code);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by code or description..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search HSN codes"
          className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        <Can permission="settings.edit">
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className={primaryBtn}
          >
            Add HSN code
          </button>
        </Can>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">Failed to load HSN codes. Please try again.</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          {search ? "No HSN codes match your search." : "No HSN codes yet."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className={`${th} text-left`}>Code</TableCell>
                <TableCell isHeader className={`${th} text-left`}>Description</TableCell>
                <TableCell isHeader className={`${th} text-center`}>GST rate</TableCell>
                <TableCell isHeader className={`${th} text-right`}>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((hsn) => (
                <TableRow key={hsn.code} className="border-b border-gray-100 dark:border-gray-800">
                  <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-white">{hsn.code}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">{hsn.description || "-"}</TableCell>
                  <TableCell className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                    {formatRate(hsn.gst_rate)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Can permission="settings.edit">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditing(hsn);
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
                        <button onClick={() => handleDelete(hsn)} className={dangerIconBtn} title="Delete" aria-label="Delete">
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

      {pagination && pagination.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.total_pages} ({pagination.total} codes)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.has_prev}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.has_next}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <HsnFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} hsn={editing} />
    </div>
  );
}
