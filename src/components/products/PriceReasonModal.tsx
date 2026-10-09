"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import { PRICE_REASON_MAX, PRICE_REASON_MIN } from "@/utils/productRules";

interface PriceReasonModalProps {
  /** Mount only while asking, so the reason starts empty each time. */
  onConfirm: (reason: string) => void;
  /** Leaves the form unsaved */
  onCancel: () => void;
  busy?: boolean;
}

/**
 * Asks why a price changed before a product or variant edit is saved
 * (the server needs price_change_reason, 3-500 characters, and keeps it in the price history).
 * Render it outside any other <form>: it has its own.
 */
export default function PriceReasonModal({ onConfirm, onCancel, busy = false }: PriceReasonModalProps) {
  const [reason, setReason] = useState("");
  const [showError, setShowError] = useState(false);
  const tooShort = reason.trim().length < PRICE_REASON_MIN;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (tooShort) {
      setShowError(true);
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <Modal isOpen onClose={onCancel} className="max-w-lg p-6 sm:p-8">
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Reason for the price change</h3>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">It is saved in the price history.</p>
      <form onSubmit={handleSubmit} noValidate>
        <Label htmlFor="price-change-reason">Reason</Label>
        <textarea
          id="price-change-reason"
          rows={3}
          autoFocus
          value={reason}
          maxLength={PRICE_REASON_MAX}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Supplier price went up"
          className={`w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${
            showError && tooShort
              ? "border-error-300 focus:ring-error-500/10 dark:border-error-800"
              : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700"
          }`}
        />
        <div className="mt-1 flex justify-between gap-3 text-xs">
          <span className={showError && tooShort ? "text-error-500" : "text-gray-500"}>
            {showError && tooShort ? "Add a reason for the price change" : `${PRICE_REASON_MIN} to ${PRICE_REASON_MAX} characters`}
          </span>
          <span className="text-gray-400">
            {reason.length}/{PRICE_REASON_MAX}
          </span>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-50"
          >
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
