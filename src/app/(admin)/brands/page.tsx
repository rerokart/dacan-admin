"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useBrands, useDeleteBrand } from "@/hooks/useBrands";
import type { Brand, BrandStatus } from "@/services/brand.service";
import PermissionGuard from "@/components/auth/PermissionGuard";
import Can from "@/components/auth/Can";
import BrandFormModal from "@/components/brands/BrandFormModal";

const PAGE_SIZE = 20;

const iconBtn =
  "rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200";
const th = "px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400";

function BrandsPageContent() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | BrandStatus>("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, error } = useBrands({
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
  });
  const { mutate: deleteBrand, isPending: isDeleting } = useDeleteBrand();

  const brands = data?.data ?? [];
  const pagination = data?.pagination;
  // After deleting the last row of the final page, step back a page (adjust during render).
  if (pagination && page > 1 && page > pagination.total_pages) {
    setPage(Math.max(1, pagination.total_pages));
  }


  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (b: Brand) => {
    setEditing(b);
    setFormOpen(true);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Brands" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">All Brands</h3>
          <Can permission="brands.create">
            <button
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Add brand
            </button>
          </Can>
        </div>

        <div className="flex flex-col gap-4 p-6 border-b border-gray-200 dark:border-gray-800 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "" | BrandStatus);
              setPage(1);
            }}
            aria-label="Filter by status"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">Failed to load brands. Please try again.</div>
          ) : brands.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {search || status ? "No brands match your filters." : "No brands yet."}
            </div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-200 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className={`${th} text-left`}>Brand</TableCell>
                  <TableCell isHeader className={`${th} text-center`}>Status</TableCell>
                  <TableCell isHeader className={`${th} text-center`}>Products</TableCell>
                  <TableCell isHeader className={`${th} text-right`}>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => {
                  const count = brand.product_count ?? 0;
                  return (
                    <TableRow key={brand.id} className="border-b border-gray-100 dark:border-gray-800">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {brand.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={brand.logo_url} alt={brand.name} className="h-10 w-10 rounded-lg object-contain" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{brand.name}</p>
                            <p className="text-sm text-gray-500">{brand.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <Badge variant="light" color={brand.status === "active" ? "success" : "warning"}>
                          {brand.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                        {count}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Can permission="brands.edit">
                            <button onClick={() => openEdit(brand)} className={iconBtn} title="Edit" aria-label="Edit">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </Can>
                          <Can permission="brands.delete">
                            <button
                              onClick={() => setDeleteTarget(brand)}
                              disabled={count > 0}
                              aria-label="Delete"
                              title={
                                count > 0
                                  ? `${count} ${count === 1 ? "product uses" : "products use"} this brand. Set it to Inactive instead`
                                  : "Delete"
                              }
                              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </Can>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.total_pages} ({pagination.total} brands)
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
      </div>

      <BrandFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        brand={editing}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete brand</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Delete &quot;{deleteTarget.name}&quot; permanently? This can&apos;t be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteBrand(deleteTarget.id, { onSettled: () => setDeleteTarget(null) })}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrandsPage() {
  return (
    <PermissionGuard permission="brands.view">
      <BrandsPageContent />
    </PermissionGuard>
  );
}
