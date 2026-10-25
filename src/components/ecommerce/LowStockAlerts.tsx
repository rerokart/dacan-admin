"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Can from "@/components/auth/Can";
import { useLowStockAlerts } from "@/hooks/useDashboard";
import { ROUTES } from "@/utils/constants/NavigationRoutes";

function LowStockAlertsContent() {
  const { data: lowStockItems, isLoading, isError, error } = useLowStockAlerts();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return "error";
      case "low_stock":
        return "warning";
      default:
        return "light";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return "Out of Stock";
      case "low_stock":
        return "Low Stock";
      default:
        return status;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Low Stock Alerts
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Items at or below their reorder level
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.INVENTORY}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            View All
          </Link>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-red-500">
            {error instanceof Error && error.message
              ? error.message
              : "Failed to load low stock items."}
          </div>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Product
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  SKU
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Current Stock
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Reorder level
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {lowStockItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="py-3">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {item.productName}
                    </p>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {item.sku}
                  </TableCell>
                  <TableCell className="py-3">
                    <span
                      className={`font-medium text-theme-sm ${
                        item.status === "out_of_stock"
                          ? "text-red-600 dark:text-red-400"
                          : item.status === "low_stock"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-800 dark:text-white/90"
                      }`}
                    >
                      {item.currentStock}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {item.threshold}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={getStatusColor(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!isLoading && !isError && (!lowStockItems || lowStockItems.length === 0) && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            All items are well stocked
          </div>
        )}
      </div>
    </div>
  );
}

export default function LowStockAlerts() {
  return (
    <Can permission="inventory.view">
      <LowStockAlertsContent />
    </Can>
  );
}
