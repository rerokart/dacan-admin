"use client";

import React, { useState } from "react";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Can from "@/components/auth/Can";
import { usePermissions } from "@/context/AuthContext";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useGstRates, useTaxSettings, useUpdateTaxSettings } from "@/hooks/useTaxSettings";
import type { TaxSettings, UpdateTaxSettingsRequest } from "@/services/taxSettings.service";
import { primaryBtn } from "./styles";

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

function Toggle({
  id,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-brand-500" : "bg-gray-200 dark:bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingRow({
  htmlFor,
  title,
  hint,
  children,
}: {
  htmlFor: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <label htmlFor={htmlFor} className="text-sm font-medium text-gray-800 dark:text-white/90">
          {title}
        </label>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      </div>
      {children}
    </div>
  );
}

export default function TaxGeneralTab() {
  const { data: settings, isLoading, error } = useTaxSettings();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }
  if (error || !settings) {
    return <div className="py-12 text-center text-red-500">Failed to load tax settings. Please try again.</div>;
  }
  // Remount after each save so the form resets to the saved values without effects.
  return <GeneralForm key={settings.updated_at ?? "initial"} settings={settings} />;
}

function GeneralForm({ settings }: { settings: TaxSettings }) {
  const { confirm } = useConfirm();
  const { can } = usePermissions();
  const { data: rates = [] } = useGstRates();
  const { mutate: save, isPending } = useUpdateTaxSettings();

  const [gstin, setGstin] = useState(settings.gstin ?? "");
  const [storeState, setStoreState] = useState(settings.store_state ?? "");
  const [pricesIncludeGst, setPricesIncludeGst] = useState(settings.prices_include_gst);
  const [defaultRate, setDefaultRate] = useState(String(settings.default_gst_rate));
  const [deliveryRate, setDeliveryRate] = useState(String(settings.delivery_gst_rate));
  const [roundTotal, setRoundTotal] = useState(settings.round_total_to_rupee);

  // Active rates, plus a saved rate that has since gone inactive so the select can still show it.
  const rateOptions = (current: number) => {
    const options = rates.filter((r) => r.is_active || r.rate === current);
    return options
      .sort((a, b) => a.rate - b.rate)
      .map((r) => ({ value: String(r.rate), label: `${r.rate}% (${r.label})` }));
  };

  const gstinTrim = gstin.trim();
  const gstinError = gstinTrim && !GSTIN_RE.test(gstinTrim) ? "Enter a valid 15-character GSTIN" : undefined;
  const stateTrim = storeState.trim();
  const stateError =
    stateTrim && (stateTrim.length < 2 || stateTrim.length > 100) ? "State must be 2-100 characters" : undefined;

  // PUT /tax is partial: send only what changed. A blank GSTIN or state clears it.
  const changes: UpdateTaxSettingsRequest = {};
  if (gstinTrim !== (settings.gstin ?? "")) changes.gstin = gstinTrim || null;
  if (stateTrim !== (settings.store_state ?? "")) changes.store_state = stateTrim || null;
  if (pricesIncludeGst !== settings.prices_include_gst) changes.prices_include_gst = pricesIncludeGst;
  if (Number(defaultRate) !== settings.default_gst_rate) changes.default_gst_rate = Number(defaultRate);
  if (Number(deliveryRate) !== settings.delivery_gst_rate) changes.delivery_gst_rate = Number(deliveryRate);
  if (roundTotal !== settings.round_total_to_rupee) changes.round_total_to_rupee = roundTotal;
  const dirty = Object.keys(changes).length > 0;

  const togglePricesIncludeGst = async (next: boolean) => {
    if (!next) {
      const ok = await confirm({
        title: "Turn off \"Prices include GST\"?",
        message:
          "Prices you typed will now have GST added at checkout. Customers will pay more for the same items.",
        variant: "danger",
        confirmText: "Turn off",
      });
      if (!ok) return;
    }
    setPricesIncludeGst(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty || gstinError || stateError) return;
    save(changes);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Read-only for admins without settings.edit */}
      <fieldset disabled={!can("settings.edit")} className="space-y-6">
      <div>
        <Label htmlFor="tax-gstin">GSTIN</Label>
        <Input
          type="text"
          id="tax-gstin"
          value={gstin}
          maxLength={15}
          onChange={(e) => setGstin(e.target.value.toUpperCase())}
          error={!!gstinError}
          placeholder="e.g. 27ABCDE1234F1Z5"
        />
        {gstinError ? (
          <p className="mt-1 text-xs text-error-500">{gstinError}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">15 characters, capital letters and digits. Leave blank to clear.</p>
        )}
      </div>

      <div>
        <Label htmlFor="tax-state">Store state</Label>
        <Input
          type="text"
          id="tax-state"
          value={storeState}
          onChange={(e) => setStoreState(e.target.value)}
          error={!!stateError}
          placeholder="e.g. Maharashtra"
        />
        {stateError && <p className="mt-1 text-xs text-error-500">{stateError}</p>}
      </div>

      <SettingRow
        htmlFor="tax-include"
        title="Prices include GST"
        hint="On: the prices you enter already contain GST. Off: GST is added on top at checkout."
      >
        <Toggle id="tax-include" checked={pricesIncludeGst} onChange={togglePricesIncludeGst} />
      </SettingRow>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="tax-default-rate">Default GST rate</Label>
          <Select
            id="tax-default-rate"
            options={rateOptions(settings.default_gst_rate)}
            value={defaultRate}
            onChange={setDefaultRate}
          />
          <p className="mt-1 text-xs text-gray-500">Used for products with no rate of their own.</p>
        </div>
        <div>
          <Label htmlFor="tax-delivery-rate">Delivery GST rate</Label>
          <Select
            id="tax-delivery-rate"
            options={rateOptions(settings.delivery_gst_rate)}
            value={deliveryRate}
            onChange={setDeliveryRate}
          />
          <p className="mt-1 text-xs text-gray-500">Applied to the delivery charge.</p>
        </div>
      </div>

      <SettingRow
        htmlFor="tax-round"
        title="Round bill total to nearest rupee"
        hint="The order total is rounded; the difference shows as a rounding line."
      >
        <Toggle id="tax-round" checked={roundTotal} onChange={setRoundTotal} />
      </SettingRow>

      </fieldset>

      <Can permission="settings.edit">
        <div className="flex justify-end">
          <button type="submit" disabled={!dirty || isPending || !!gstinError || !!stateError} className={primaryBtn}>
            {isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </Can>
    </form>
  );
}
