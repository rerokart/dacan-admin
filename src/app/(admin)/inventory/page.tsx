"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import {
  useInventoryOverview,
  useStockLevels,
  useUpdateStock,
} from "@/hooks/useInventory";
import type { StockFilters, UpdateStockRequest } from "@/services/inventory.service";

const getStockStatusBadge = (status: string) => {
  switch (status) {
    case "in_stock":
      return (
        <Badge variant="light" color="success">
          In Stock
        </Badge>
      );
    case "low_stock":
      return (
        <Badge variant="light" color="warning">
          Low Stock
        </Badge>
      );
    case "out_of_stock":
      return (
        <Badge variant="light" color="error">
          Out of Stock
        </Badge>
      );
    default:
      return null;
  }
};

export default function InventoryPage() {
  const [filters, setFilters] = useState<StockFilters>({
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [updateModal, setUpdateModal] = useState<{
    product_id: string;
    variant_id?: string;
    product_name: string;
    current_stock: number;
  } | null>(null);
  const [stockChange, setStockChange] = useState<number>(0);
  const [stockReason, setStockReason] = useState("");

  const { data: overview, isLoading: overviewLoading } = useInventoryOverview();
  const { data: stockData, isLoading: stockLoading, error } = useStockLevels(filters);
  const { mutate: updateStock, isPending: isUpdating } = useUpdateStock();

  const stockItems = stockData?.data || [];
  const totalPages = stockData?.total_pages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (key: keyof StockFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handleUpdateStock = () => {
    if (updateModal && stockReason) {
      const data: UpdateStockRequest = {
        product_id: updateModal.product_id,
        variant_id: updateModal.variant_id,
        quantity_change: stockChange,
        reason: stockReason,
      };
      updateStock(data, {
        onSuccess: () => {
          setUpdateModal(null);
          setStockChange(0);
          setStockReason("");
        },
      });
    }
  };

  const statCards = [
    {
      label: "Total Products",
      value: overview?.totalProducts || 0,
      color: "text-gray-900",
    },
    {
      label: "In Stock",
      value: overview?.inStock || 0,
      color: "text-green-600",
    },
    {
      label: "Low Stock",
      value: overview?.lowStock || 0,
      color: "text-yellow-600",
    },
    {
      label: "Out of Stock",
      value: overview?.outOfStock || 0,
      color: "text-red-600",
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Inventory" />
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-semibold mt-1 ${stat.color} dark:text-white`}>
                {stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Inventory Value Card */}
        {overview?.totalValue !== undefined && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500">Total Inventory Value</p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-1">
              ₹{overview.totalValue.toLocaleString()}
            </p>
          </div>
        )}

        {/* Stock Management Table */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Stock Management
            </h3>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by product or SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  <svg
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </form>

              <select
                value={filters.status || ""}
                onChange={(e) =>
                  handleFilterChange("status", e.target.value as StockFilters["status"])
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Stock Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {stockLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-red-500">
                Failed to load stock data. Please try again.
              </div>
            ) : stockItems.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No stock items found.
              </div>
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-200 dark:border-gray-800">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Product
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      SKU
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Current Stock
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Threshold
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
                  {stockItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <TableCell className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.product_name}
                          </p>
                          {item.variant_name && (
                            <p className="text-sm text-gray-500">
                              {item.variant_name}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {item.sku}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <span
                          className={`font-semibold ${
                            item.current_stock === 0
                              ? "text-red-600"
                              : item.current_stock <= item.low_stock_threshold
                              ? "text-yellow-600"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {item.current_stock}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                        {item.low_stock_threshold}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        {getStockStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            setUpdateModal({
                              product_id: item.product_id,
                              variant_id: item.variant_id,
                              product_name: `${item.product_name}${
                                item.variant_name ? ` - ${item.variant_name}` : ""
                              }`,
                              current_stock: item.current_stock,
                            })
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
                        >
                          Update Stock
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
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

      {/* Update Stock Modal */}
      {updateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Update Stock
            </h3>
            <p className="mt-1 text-sm text-gray-500">{updateModal.product_name}</p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Stock</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {updateModal.current_stock}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock Change
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStockChange((prev) => prev - 1)}
                    className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 dark:border-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={stockChange}
                    onChange={(e) => setStockChange(parseInt(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-lg font-semibold focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => setStockChange((prev) => prev + 1)}
                    className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 dark:border-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  New stock will be:{" "}
                  <span className="font-semibold">
                    {updateModal.current_stock + stockChange}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason *
                </label>
                <select
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">Select reason</option>
                  <option value="Restock">Restock</option>
                  <option value="Adjustment">Adjustment</option>
                  <option value="Return">Return</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setUpdateModal(null);
                  setStockChange(0);
                  setStockReason("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                disabled={isUpdating || !stockReason}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
