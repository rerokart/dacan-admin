"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
  DollarLineIcon,
  BoxCubeIcon,
} from "@/icons";
import Can from "@/components/auth/Can";
import { useDashboardStats } from "@/hooks/useDashboard";

function EcommerceMetricsContent() {
  const { data: stats, isLoading, isError, error } = useDashboardStats();

  const metrics = [
    {
      title: "Total Orders",
      value: stats ? stats.totalOrders.toLocaleString() : "—",
      change: stats?.ordersChange,
      icon: <BoxIconLine className="text-gray-800 dark:text-white/90" />,
    },
    {
      title: "Total Revenue",
      value: stats ? `₹${stats.totalRevenue.toLocaleString()}` : "—",
      change: stats?.revenueChange,
      icon: <DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />,
    },
    {
      title: "Total Users",
      value: stats ? stats.totalUsers.toLocaleString() : "—",
      change: stats?.usersChange,
      icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
    },
    {
      title: "Total Products",
      value: stats ? stats.totalProducts.toLocaleString() : "—",
      change: stats?.productsChange,
      icon: <BoxCubeIcon className="text-gray-800 size-6 dark:text-white/90" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700" />
            <div className="mt-5 space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded dark:bg-gray-700" />
              <div className="h-6 w-16 bg-gray-200 rounded dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-red-500 dark:border-gray-800 dark:bg-white/[0.03]">
        {error instanceof Error && error.message
          ? error.message
          : "Failed to load dashboard stats."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.title}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {metric.icon}
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {metric.title}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {metric.value}
              </h4>
            </div>
            {metric.change !== undefined && (
              <Badge color={metric.change >= 0 ? "success" : "error"}>
                {metric.change >= 0 ? (
                  <ArrowUpIcon />
                ) : (
                  <ArrowDownIcon className="text-error-500" />
                )}
                {Math.abs(metric.change).toFixed(1)}%
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export const EcommerceMetrics = () => (
  <Can permission="analytics.view">
    <EcommerceMetricsContent />
  </Can>
);
