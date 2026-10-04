"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState } from "react";
import Select from "@/components/form/Select";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useBanners, useDeleteBanner, useReorderBanners } from "@/hooks/useBanners";
import type { BannerFilters } from "@/services/banner.service";
import PermissionGuard from "@/components/auth/PermissionGuard";
import Can from "@/components/auth/Can";

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getBannerStatus = (banner: {
  is_active: boolean;
  active_from?: string;
  active_to?: string;
}) => {
  if (!banner.is_active) {
    return { label: "Inactive", color: "error" };
  }
  const now = new Date();
  if (banner.active_from && new Date(banner.active_from) > now) {
    return { label: "Scheduled", color: "info" };
  }
  if (banner.active_to && new Date(banner.active_to) < now) {
    return { label: "Expired", color: "warning" };
  }
  return { label: "Active", color: "success" };
};

function BannersPageContent() {
  const [filters, setFilters] = useState<BannerFilters>({
    page: 1,
    limit: 10,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: bannersData, isLoading, error } = useBanners(filters);
  const { mutate: deleteBanner, isPending: isDeleting } = useDeleteBanner();

  const { mutate: reorderBanners, isPending: isReordering } = useReorderBanners();

  // Sort by display_order (stable, so ties keep the server's order).
  const banners = [...(bannersData?.data || [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );
  const totalPages = bannersData?.total_pages || 1;

  const handleFilterChange = (key: keyof BannerFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value === "true",
      page: 1,
    }));
  };

  // Swap a banner with its neighbour (-1 = up, +1 = down) in the displayed list.
  const handleMove = (index: number, direction: -1 | 1) => {
    const current = banners[index];
    const neighbour = banners[index + direction];
    if (!current || !neighbour) return;

    let currentOrder = neighbour.display_order;
    let neighbourOrder = current.display_order;
    if (currentOrder === neighbourOrder) {
      // Equal values: swapping does nothing, so force a distinct order.
      const base = current.display_order ?? 0;
      if (direction === -1) {
        currentOrder = base;
        neighbourOrder = base + 1;
      } else {
        neighbourOrder = base;
        currentOrder = base + 1;
      }
    }

    reorderBanners({
      banners: [
        { id: String(current.id), display_order: currentOrder },
        { id: String(neighbour.id), display_order: neighbourOrder },
      ],
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteBanner(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Banners" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              All Banners
            </h3>
            <Can permission="banners.create">
              <Link
                href="/banners/add"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Banner
              </Link>
            </Can>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                options={[
                  { value: "", label: "All Status" },
                  { value: "true", label: "Active" },
                  { value: "false", label: "Inactive" },
                ]}
                value={filters.is_active === undefined ? "" : String(filters.is_active)}
                onChange={(val) => handleFilterChange("is_active", val)}
                placeholder="All Status"
                className="w-full lg:w-44"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-red-500">
                Failed to load banners. Please try again.
              </div>
            ) : banners.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No banners found.
              </div>
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-200 dark:border-gray-800">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Banner
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Title
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Order
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Active Period
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner, index) => {
                    const status = getBannerStatus(banner);
                    return (
                      <TableRow
                        key={banner.id}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="h-16 w-28 rounded-lg bg-gray-100 overflow-hidden">
                            <img
                              src={banner.image_url}
                              alt={banner.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {banner.title}
                            </p>
                            {banner.link_url && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {banner.link_url}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                          {banner.display_order}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          <p>{formatDate(banner.active_from)}</p>
                          <p>to {formatDate(banner.active_to)}</p>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <Badge
                            variant="light"
                            color={status.color as "success" | "warning" | "error" | "info"}
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Can permission="banners.edit">
                              {index > 0 && (
                                <button
                                  onClick={() => handleMove(index, -1)}
                                  disabled={isReordering}
                                  title="Move up"
                                  aria-label="Move up"
                                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                              )}
                              {index < banners.length - 1 && (
                                <button
                                  onClick={() => handleMove(index, 1)}
                                  disabled={isReordering}
                                  title="Move down"
                                  aria-label="Move down"
                                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              )}
                            </Can>
                            <Can permission="banners.edit">
                              <Link
                                href={`/banners/${banner.id}/edit`}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </Link>
                            </Can>
                            <Can permission="banners.delete">
                              <button
                                onClick={() => setDeleteId(banner.id)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500">
                Page {filters.page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
                  }
                  disabled={(filters.page || 1) <= 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                  }
                  disabled={(filters.page || 1) >= totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Banner
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this banner? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

export default function BannersPage() {
  return (
    <PermissionGuard permission="banners.view">
      <BannersPageContent />
    </PermissionGuard>
  );
}
