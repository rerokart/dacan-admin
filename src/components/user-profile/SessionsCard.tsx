"use client";

import React from "react";
import { useMySessions, useRevokeMySession, useLogoutAll } from "@/hooks/useAuth";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { formatDate, getRelativeTime, shortenUserAgent } from "@/utils/helpers/helperfn";

export default function SessionsCard() {
  const { data, isLoading, error } = useMySessions();
  const revokeSession = useRevokeMySession();
  const logoutAll = useLogoutAll();
  const { confirm } = useConfirm();

  const sessions = data?.sessions ?? [];

  const handleLogoutAll = async () => {
    const confirmed = await confirm({
      title: "Log out all devices",
      message: "This signs you out everywhere, including here.",
      variant: "danger",
      confirmText: "Log out all devices",
    });
    if (!confirmed) return;
    logoutAll.mutate();
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Active sessions
        </h4>
        <button
          type="button"
          onClick={handleLogoutAll}
          disabled={logoutAll.isPending}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-error-500 px-4 py-2.5 text-sm font-medium text-error-500 transition hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-error-500/10"
        >
          {logoutAll.isPending ? "Logging out..." : "Log out all devices"}
        </button>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-red-500">
            Failed to load active sessions. Please try again.
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">No active sessions.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {shortenUserAgent(session.user_agent)}
                    </span>
                    {session.is_current && (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                        This device
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {session.ip} · Signed in {formatDate(session.created_at, "datetime")} · Last
                    active {getRelativeTime(session.last_seen_at)}
                  </p>
                </div>
                {!session.is_current && (
                  <button
                    type="button"
                    onClick={() => revokeSession.mutate(session.id)}
                    disabled={revokeSession.isPending}
                    className="self-start rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03] sm:self-auto"
                  >
                    Sign out
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
