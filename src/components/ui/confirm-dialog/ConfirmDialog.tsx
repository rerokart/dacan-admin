"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export type ConfirmDialogVariant = "default" | "danger";

export interface ConfirmOptions {
  title: string;
  message: string;
  variant?: ConfirmDialogVariant;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  isLoading: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

interface ConfirmProviderProps {
  children: React.ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    isLoading: false,
    title: "",
    message: "",
    variant: "default",
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  // Use ref to store resolve function to avoid stale closure issues
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        isOpen: true,
        isLoading: false,
        title: options.title,
        message: options.message,
        variant: options.variant || "default",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    // Small delay for visual feedback
    setTimeout(() => {
      resolveRef.current?.(true);
      resolveRef.current = null;
      setState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    }, 150);
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter" && !state.isLoading) {
      handleConfirm();
    }
  };

  const isDanger = state.variant === "danger";

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Backdrop */}
      {state.isOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/50 transition-opacity"
          onClick={handleCancel}
        />
      )}

      {/* Dialog */}
      {state.isOpen && (
        <div
          className="fixed left-1/2 top-1/2 z-[9999] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-message"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Icon */}
          <div
            className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
              isDanger
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-blue-100 dark:bg-blue-900/30"
            }`}
          >
            {isDanger ? (
              <svg
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          {/* Title */}
          <h3
            id="confirm-title"
            className="mb-2 text-center text-lg font-semibold text-gray-900 dark:text-white"
          >
            {state.title}
          </h3>

          {/* Message */}
          <p
            id="confirm-message"
            className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            {state.message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={state.isLoading}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {state.cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={state.isLoading}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                isDanger
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-brand-500 hover:bg-brand-600"
              }`}
            >
              {state.isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading...
                </span>
              ) : (
                state.confirmText
              )}
            </button>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;
