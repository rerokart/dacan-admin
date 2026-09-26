"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSalesAnalytics } from "@/hooks/useAnalytics";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  getDateRangePresets,
  type SalesFilters,
} from "@/services/analytics.service";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import PermissionGuard from "@/components/auth/PermissionGuard";

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

type DatePreset = "week" | "month" | "year" | "custom";

function ReportsPageContent() {
  const presets = useMemo(() => getDateRangePresets(), []);

  const [datePreset, setDatePreset] = useState<DatePreset>("month");
  const [customRange, setCustomRange] = useState({
    start: presets.month.start,
    end: presets.month.end,
  });

  const filters: SalesFilters = useMemo(() => {
    const range = datePreset === "custom"
      ? customRange
      : presets[datePreset === "week" ? "week" : datePreset === "year" ? "year" : "month"];

    return {
      start_date: range.start,
      end_date: range.end,
      group_by: datePreset === "year" ? "month" : datePreset === "month" ? "week" : "day",
    };
  }, [datePreset, customRange, presets]);

  const { data: analytics, isLoading, error } = useSalesAnalytics(filters);

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== "custom") {
      const range = presets[preset === "week" ? "week" : preset === "year" ? "year" : "month"];
      setCustomRange({ start: range.start, end: range.end });
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Reports & Analytics" />
      <div className="space-y-6">
        {/* Date Range Selector */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Sales Report
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {(["week", "month", "year", "custom"] as DatePreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetChange(preset)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    datePreset === preset
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {preset === "week" ? "This Week" : preset === "month" ? "This Month" : preset === "year" ? "This Year" : "Custom"}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {datePreset === "custom" && (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-red-500">Failed to load analytics. Please try again.</p>
          </div>
        ) : analytics ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Total Revenue"
                value={formatCurrency(analytics.summary.total_revenue)}
                change={analytics.summary.revenue_change}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="purple"
              />
              <SummaryCard
                title="Total Orders"
                value={formatNumber(analytics.summary.total_orders)}
                change={analytics.summary.orders_change}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                }
                color="cyan"
              />
              <SummaryCard
                title="Avg Order Value"
                value={formatCurrency(analytics.summary.average_order_value)}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                }
                color="green"
              />
              <SummaryCard
                title="Conversion Rate"
                value="3.2%"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                color="amber"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Sales Trend Chart */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                  Revenue Trend
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.sales_by_period}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="label"
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        formatter={(value) => [formatCurrency(Number(value) || 0), "Revenue"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: "#8b5cf6", strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders Trend Chart */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                  Orders Trend
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.sales_by_period}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="label"
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        formatter={(value) => [formatNumber(Number(value) || 0), "Orders"]}
                      />
                      <Bar
                        dataKey="orders"
                        fill="#06b6d4"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Sales by Category */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                  Sales by Category
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.sales_by_category as unknown as Record<string, unknown>[]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="revenue"
                        nameKey="category_name"
                      >
                        {analytics.sales_by_category.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        formatter={(value) => formatCurrency(Number(value) || 0)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analytics.sales_by_category.slice(0, 5).map((cat, index) => (
                    <div key={cat.category_id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-600 dark:text-gray-400">{cat.category_name}</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Top Selling Products
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-b border-gray-200 dark:border-gray-800">
                      <TableRow>
                        <TableCell isHeader className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          Product
                        </TableCell>
                        <TableCell isHeader className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          Qty Sold
                        </TableCell>
                        <TableCell isHeader className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                          Revenue
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.top_products.map((product, index) => (
                        <TableRow key={product.product_id} className="border-b border-gray-100 dark:border-gray-800">
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {index + 1}
                              </span>
                              <div className="flex items-center gap-3">
                                {product.image_url && (
                                  <img
                                    src={product.image_url}
                                    alt={product.product_name}
                                    className="h-10 w-10 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {product.product_name}
                                  </p>
                                  <p className="text-sm text-gray-500">{product.sku}</p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                            {formatNumber(product.quantity_sold)}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(product.revenue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <PermissionGuard permission="analytics.view">
      <ReportsPageContent />
    </PermissionGuard>
  );
}

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: "purple" | "cyan" | "green" | "amber";
}

function SummaryCard({ title, value, change, icon, color }: SummaryCardProps) {
  const colorClasses = {
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    cyan: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={`text-sm font-medium ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatPercentage(change)}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
