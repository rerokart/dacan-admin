"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";

interface ConfirmActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  /** Destructive actions (suspend, archive, revoke, ...) use the red button style. */
  danger?: boolean;
}

/**
 * Generic "are you sure" dialog for the Admin Access screen's row actions.
 * The caller supplies the exact confirmation text (naming the target admin)
 * per the spec — this component only owns the chrome and button styling.
 */
export default function ConfirmActionDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  danger = false,
}: ConfirmActionDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md m-4">
      <div className="p-6">
        <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h4>
        <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">{description}</div>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              danger ? "bg-error-500 hover:bg-error-600" : "bg-brand-500 hover:bg-brand-600"
            }`}
          >
            {isLoading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
