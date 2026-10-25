"use client";

import React, { useState } from "react";
import Link from "next/link";
import Select from "@/components/form/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Can from "@/components/auth/Can";
import { useInventoryOverview, useStockLevels } from "@/hooks/useInventory";
import type { StockFilters } from "@/services/inventory.service";
import { formatCurrency } from "@/utils/helpers/helperfn";
import CorrectionModal, { type CorrectionTarget } from "./CorrectionModal";
import StockStatusBadge from "./StockStatusBadge";

const TH = "px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400";

export default function StockTab({ canViewHistory }: { canViewHistory: boolean }) {
  const [filters, setFilters] = useState<StockFilters>({ page: 1, limit: 10 });
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<CorrectionTarget | null>(null);

  const { data: overview } = useInventoryOverview();
  const { data: stockData, isLoading, error } = useStockLevels(filters);

  const items = stockData?.inventory || [];
  const totalPages = stockData?.pagination?.total_pages || 1;

  const statCards = [
    { label: "Total Items", value: overview?.total_items || 0, color: "text-gray-900" },
    { label: "In Stock", value: overview?.in_stock || 0, color: "text-green-600" },
    { label: "Low Stock", value: overview?.low_stock || 0, color: "text-yellow-600" },
    { label: "Out of Stock", value: overview?.out_of_stock || 0, color: "text-red-600" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${stat.color} dark:text-white`}>
              {stat.value.toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>

      {overview?.total_value !== undefined && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500">Stock value at selling price</p>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-1">
            {formatCurrency(overview.total_value)}
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <input
                type="text"
                placeholder="Search by product or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </form>
            <Select
              options={[
                { value: "", label: "All Stock Status" },
                { value: "in_stock", label: "In Stock" },
                { value: "low_stock", label: "Low Stock (at or below reorder level)" },
                { value: "out_of_stock", label: "Out of Stock" },
              ]}
              value={filters.status || ""}
              onChange={(val) => setFilters((prev) => ({ ...prev, status: val || undefined, page: 1 }))}
              placeholder="All Stock Status"
              className="w-full lg:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">Failed to load stock data. Please try again.</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No stock items found.</div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-200 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className={`${TH} text-left`}>Product</TableCell>
                  <TableCell isHeader className={`${TH} text-left`}>SKU</TableCell>
                  <TableCell isHeader className={`${TH} text-center`}>Current Stock</TableCell>
                  <TableCell isHeader className={`${TH} text-center`}>Reorder level</TableCell>
                  <TableCell isHeader className={`${TH} text-center`}>Status</TableCell>
                  <TableCell isHeader className={`${TH} text-right`}>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const label = `${item.name}${item.variant_info ? ` - ${item.variant_info}` : ""}`;
                  const variantId = item.variant_id ?? item.id;
                  return (
                    <TableRow key={`${item.type}-${item.id}`} className="border-b border-gray-100 dark:border-gray-800">
                      <TableCell className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        {item.variant_info && <p className="text-sm text-gray-500">{item.variant_info}</p>}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.sku}</TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <span
                          className={`font-semibold ${
                            item.stock_status === "out_of_stock"
                              ? "text-red-600"
                              : item.stock_status === "low_stock"
                              ? "text-yellow-600"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {item.stock_quantity}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                        {item.reorder_level ?? item.low_stock_threshold}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <StockStatusBadge status={item.stock_status} />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {canViewHistory && (
                            <Link
                              href={`/inventory?tab=history&variant_id=${variantId}`}
                              className="text-sm font-medium text-brand-500 hover:text-brand-600"
                            >
                              View history
                            </Link>
                          )}
                          <Can permission="inventory.edit">
                            <button
                              onClick={() =>
                                setTarget({
                                  product_id: item.product_id,
                                  variant_id: item.variant_id,
                                  name: label,
                                  current_stock: item.stock_quantity,
                                })
                              }
                              className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
                            >
                              Correct stock
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500">
              Page {filters.page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                disabled={(filters.page || 1) <= 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={(filters.page || 1) >= totalPages}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CorrectionModal target={target} onClose={() => setTarget(null)} />
    </div>
  );
}
