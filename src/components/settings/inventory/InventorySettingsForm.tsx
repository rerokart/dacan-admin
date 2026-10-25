"use client";

import React, { useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { usePermissions } from "@/context/AuthContext";
import { useInventorySettings, useUpdateInventorySettings } from "@/hooks/useInventorySettings";
import type { InventorySettings } from "@/services/inventorySettings.service";
import { primaryBtn, secondaryBtn } from "../tax/styles";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAILS = 10;

export default function InventorySettingsForm() {
  const { data: settings, isLoading, error } = useInventorySettings();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }
  if (error || !settings) {
    return <div className="py-12 text-center text-red-500">Failed to load inventory settings. Please try again.</div>;
  }
  // Remount after each save so the form resets to the saved values without effects.
  return <Form key={`${settings.expiry_warning_days}|${settings.low_stock_alert_emails.join(",")}`} settings={settings} />;
}

function Form({ settings }: { settings: InventorySettings }) {
  const { can } = usePermissions();
  const canEdit = can("settings.edit");
  const { mutate: save, isPending } = useUpdateInventorySettings();

  const [days, setDays] = useState(String(settings.expiry_warning_days));
  const [emails, setEmails] = useState<string[]>(settings.low_stock_alert_emails);
  const [draft, setDraft] = useState("");

  const daysNum = Number(days);
  const daysError =
    !/^\d+$/.test(days.trim()) || daysNum < 1 || daysNum > 365
      ? "Enter a whole number from 1 to 365"
      : undefined;

  const draftTrim = draft.trim().toLowerCase();
  const draftError = !draftTrim
    ? undefined
    : !EMAIL_RE.test(draftTrim)
    ? "Enter a valid email address"
    : emails.includes(draftTrim)
    ? "This address is already in the list"
    : emails.length >= MAX_EMAILS
    ? `You can add up to ${MAX_EMAILS} addresses`
    : undefined;

  const addEmail = () => {
    if (!draftTrim || draftError) return;
    setEmails((prev) => [...prev, draftTrim]);
    setDraft("");
  };

  const changes: Partial<InventorySettings> = {};
  if (!daysError && daysNum !== settings.expiry_warning_days) changes.expiry_warning_days = daysNum;
  if (emails.join(",") !== settings.low_stock_alert_emails.join(",")) changes.low_stock_alert_emails = emails;
  const dirty = Object.keys(changes).length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty || daysError || draftError) return;
    save(changes);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <fieldset disabled={!canEdit} className="space-y-6">
        <div>
          <Label htmlFor="inv-expiry-days">Warn about expiry (days before)</Label>
          <Input
            id="inv-expiry-days"
            type="text"
            inputMode="numeric"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            error={!!daysError}
            className="max-w-[10rem]"
          />
          {daysError ? (
            <p className="mt-1 text-xs text-error-500">{daysError}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The Expiring tab lists stock that expires within this many days.
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="inv-email">Extra addresses for low-stock emails</Label>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Super Admins and roles with the low-stock alert permission always get these emails. Add other addresses here (up to {MAX_EMAILS}).
          </p>
          {emails.length > 0 && (
            <ul className="mb-3 flex flex-wrap gap-2">
              {emails.map((email) => (
                <li
                  key={email}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-white/10 dark:text-gray-200"
                >
                  {email}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setEmails((prev) => prev.filter((x) => x !== email))}
                      aria-label={`Remove ${email}`}
                      className="text-gray-500 hover:text-red-600"
                    >
                      &times;
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-3">
            <Input
              id="inv-email"
              type="email"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEmail();
                }
              }}
              error={!!draftError}
              placeholder="name@example.com"
            />
            <button type="button" onClick={addEmail} disabled={!draftTrim || !!draftError} className={secondaryBtn}>
              Add
            </button>
          </div>
          {draftError && <p className="mt-1 text-xs text-error-500">{draftError}</p>}
        </div>
      </fieldset>

      {canEdit ? (
        <button type="submit" disabled={!dirty || isPending || !!daysError || !!draftError} className={primaryBtn}>
          {isPending ? "Saving..." : "Save settings"}
        </button>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400">You can view these settings but not change them.</p>
      )}
    </form>
  );
}
