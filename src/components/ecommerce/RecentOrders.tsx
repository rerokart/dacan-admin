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
import { useRecentOrders } from "@/hooks/useDashboard";
import { ROUTES } from "@/utils/constants/NavigationRoutes";
import { formatCurrency } from "@/utils/helpers/helperfn";

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "success";
    case "shipped":
      return "info";
    case "out_for_delivery":
      return "info";
    case "confirmed":
      return "warning";
    case "placed":
      return "light";
    case "cancelled":
    case "rejected":
      return "error";
    default:
      return "light";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (status: string) => {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

function RecentOrdersContent() {
  const { data: orders, isLoading, isError, error } = useRecentOrders();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.ORDERS}
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
              : "Failed to load recent orders."}
          </div>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Order
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Customer
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
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
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="py-3">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {order.orderNumber}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-gray-700 text-theme-sm dark:text-gray-300">
                      {order.customer.name}
                    </p>
                  </TableCell>
                  <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-gray-300">
                    {formatCurrency(order.amount)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatDate(order.date)}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={getStatusColor(order.status)}>
                      {formatStatus(order.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!isLoading && !isError && (!orders || orders.length === 0) && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No recent orders
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecentOrders() {
  return (
    <Can permission="analytics.view">
      <RecentOrdersContent />
    </Can>
  );
}
