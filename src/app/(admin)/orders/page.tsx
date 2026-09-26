"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useOrders } from "@/hooks/useOrders";
import type { OrderFilters } from "@/services/order.service";
import {
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
} from "@/services/order.service";
import { formatCurrency } from "@/utils/helpers/helperfn";
import Select from "@/components/form/Select";
import PermissionGuard from "@/components/auth/PermissionGuard";

const PAYMENT_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Payment" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const PAYMENT_METHOD_FILTER_OPTIONS = [
  { value: "", label: "All Methods" },
  { value: "cod", label: "COD" },
  { value: "online", label: "Online" },
];

const SOURCE_FILTER_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline (POS)" },
];

const getStatusBadge = (status: string | undefined, colorMap: Record<string, string>) => {
  const s = status ?? "";
  const color = colorMap[s] || "default";
  return (
    <Badge variant="light" color={color as "success" | "warning" | "error" | "info" | "primary"}>
      {s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "—"}
    </Badge>
  );
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function OrdersPageContent() {
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");

  const { data: ordersData, isLoading, error } = useOrders(filters);

  const orders = ordersData?.data || [];
  const totalPages = ordersData?.total_pages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (key: keyof OrderFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Orders" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              All Orders
            </h3>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by order number or customer..."
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

              {/* Order Status Filter */}
              <Select
                options={[{ value: "", label: "All Status" }, ...ORDER_STATUS_OPTIONS]}
                value={filters.status || ""}
                onChange={(val) => handleFilterChange("status", val)}
                placeholder="All Status"
                className="w-full lg:w-44"
              />

              {/* Payment Status Filter */}
              <Select
                options={PAYMENT_STATUS_FILTER_OPTIONS}
                value={filters.payment_status || ""}
                onChange={(val) => handleFilterChange("payment_status", val)}
                placeholder="All Payment"
                className="w-full lg:w-44"
              />

              {/* Payment Method Filter */}
              <Select
                options={PAYMENT_METHOD_FILTER_OPTIONS}
                value={filters.payment_method || ""}
                onChange={(val) => handleFilterChange("payment_method", val)}
                placeholder="All Methods"
                className="w-full lg:w-44"
              />

              {/* Source Filter */}
              <Select
                options={SOURCE_FILTER_OPTIONS}
                value={filters.source || ""}
                onChange={(val) => handleFilterChange("source", val)}
                placeholder="All Sources"
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
                Failed to load orders. Please try again.
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No orders found.
              </div>
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-200 dark:border-gray-800">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Order #
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Customer
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Total
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Payment
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Source
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
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <TableCell className="px-6 py-4">
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {order.order_number}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white/90">
                            {order.user?.full_name || order.address_snapshot?.full_name || "Walk-in"}
                          </p>
                          {order.user?.email && (
                            <p className="text-sm text-gray-500">{order.user.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right font-medium text-gray-800 dark:text-white/90">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {getStatusBadge(order.payment_status, PAYMENT_STATUS_COLORS)}
                          <span className="text-xs text-gray-500 uppercase">
                            {order.payment_method ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        {getStatusBadge(order.order_status, ORDER_STATUS_COLORS)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <Badge
                          variant="light"
                          color={order.source === "online" ? "primary" : "info"}
                        >
                          {order.source ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                        >
                          View
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
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
    </div>
  );
}

export default function OrdersPage() {
  return (
    <PermissionGuard permission="orders.view">
      <OrdersPageContent />
    </PermissionGuard>
  );
}
