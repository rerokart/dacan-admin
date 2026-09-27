"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { useLogout } from "@/hooks/useAuth";

export default function PreferencesCard() {
  const { theme, toggleTheme } = useTheme();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Preferences
      </h4>

      <div className="mt-5 divide-y divide-gray-100 dark:divide-gray-800">
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">Theme</p>
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">
              Currently using {theme === "dark" ? "dark" : "light"} mode.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            Switch to {theme === "dark" ? "light" : "dark"} mode
          </button>
        </div>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">Sign out</p>
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">
              Sign out of this device only.
            </p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-error-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}
