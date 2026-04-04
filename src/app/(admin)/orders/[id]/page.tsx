"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import {
  useOrder,
  useUpdateOrderStatus,
  useCancelOrder,
  useDownloadInvoice,
} from "@/hooks/useOrders";
import {
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
} from "@/services/order.service";
import { formatCurrency } from "@/utils/helpers/helperfn";

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data: order, isLoading, error } = useOrder(orderId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
  const { mutate: downloadInvoice, isPending: isDownloading } = useDownloadInvoice();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const handleStatusUpdate = () => {
    if (newStatus) {
      updateStatus(
        { id: orderId, data: { status: newStatus, notes: statusNotes } },
        { onSuccess: () => setShowStatusModal(false) }
      );
    }
  };

  const handleCancel = () => {
    cancelOrder(
      { id: orderId, reason: cancelReason },
      { onSuccess: () => setShowCancelModal(false) }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-12 text-center text-red-500">
        Failed to load order. Please try again.
      </div>
    );
  }

  const canCancel = ["placed", "confirmed"].includes(order.order_status);

  return (
    <div>
      <PageBreadcrumb pageTitle={`Order ${order.order_number}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {order.order_number}
              </h2>
              <Badge
                variant="light"
                color={ORDER_STATUS_COLORS[order.order_status] as "success" | "warning" | "error" | "info" | "primary"}
              >
                {(order.order_status ?? "").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
              <Badge
                variant="light"
                color={order.source === "online" ? "primary" : "info"}
              >
                {order.source}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => downloadInvoice(orderId)}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isDownloading ? "Downloading..." : "Download Invoice"}
            </button>
            <button
              onClick={() => {
                setNewStatus(order.order_status);
                setStatusNotes("");
                setShowStatusModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Update Status
            </button>
            {canCancel && (
              <button
                onClick={() => {
                  setCancelReason("");
                  setShowCancelModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Order Items ({order.items?.length || 0})
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 dark:border-gray-800"
                  >
                    <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      {item.product_snapshot?.image_url ? (
                        <img
                          src={item.product_snapshot.image_url}
                          alt={item.product_snapshot.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.product_snapshot?.name}
                      </h4>
                      {item.variant_snapshot && (
                        <p className="text-sm text-gray-500">
                          {item.variant_snapshot.variant_type}: {item.variant_snapshot.variant_name}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        SKU: {item.product_snapshot?.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.unit_price)} x {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(order.subtotal)}
                    </span>
                  </div>
                  {(order.discount_amount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Discount {order.coupon_code && `(${order.coupon_code})`}
                      </span>
                      <span className="text-green-600">
                        -{formatCurrency(order.discount_amount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(order.delivery_charge)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">GST (18%)</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(order.tax_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-800">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Customer
              </h3>
              {order.user ? (
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.user.full_name}
                  </p>
                  <p className="text-sm text-gray-500">{order.user.email}</p>
                  <p className="text-sm text-gray-500">{order.user.mobile}</p>
                </div>
              ) : (
                <p className="text-gray-500">Walk-in Customer</p>
              )}
            </div>

            {/* Delivery Address */}
            {order.address_snapshot && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Delivery Address
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.address_snapshot.full_name}
                  </p>
                  <p>{order.address_snapshot.address_line1}</p>
                  {order.address_snapshot.address_line2 && (
                    <p>{order.address_snapshot.address_line2}</p>
                  )}
                  <p>
                    {order.address_snapshot.city}, {order.address_snapshot.state} -{" "}
                    {order.address_snapshot.pincode}
                  </p>
                  <p className="mt-2">Phone: {order.address_snapshot.mobile}</p>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Payment
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium text-gray-900 dark:text-white uppercase">
                    {order.payment_method}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <Badge
                    variant="light"
                    color={PAYMENT_STATUS_COLORS[order.payment_status] as "success" | "warning" | "error" | "info"}
                  >
                    {order.payment_status}
                  </Badge>
                </div>
                {order.razorpay_payment_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {order.razorpay_payment_id}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Status History */}
            {order.status_history && order.status_history.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Status History
                </h3>
                <div className="space-y-4">
                  {order.status_history.map((history, index) => (
                    <div
                      key={history.id}
                      className="flex gap-3 text-sm"
                    >
                      <div className="relative">
                        <div className="h-2 w-2 rounded-full bg-brand-500 mt-2"></div>
                        {index < order.status_history!.length - 1 && (
                          <div className="absolute left-1/2 top-4 h-full w-px -translate-x-1/2 bg-gray-200 dark:bg-gray-700"></div>
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {(history.status ?? "").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "—"}
                        </p>
                        {history.notes && (
                          <p className="text-gray-500">{history.notes}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(history.created_at)}
                          {history.created_by_name && ` by ${history.created_by_name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Update Order Status
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Add any notes about this status change..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cancel Order
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter reason for cancellation..."
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
