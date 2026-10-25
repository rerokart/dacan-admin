"use client";

import React, { useMemo, useState } from "react";
import Select from "@/components/form/Select";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Can from "@/components/auth/Can";
import { usePermissions } from "@/context/AuthContext";
import { useAddVariant, useUpdateVariant } from "@/hooks/useProducts";
import { useGstRates, useTaxSettings } from "@/hooks/useTaxSettings";
import { MEASURES, buildCostRateOptions, numText, percent } from "@/utils/productFormat";
import { priceLabels } from "@/utils/priceLabels";
import { PRICE_CHANGE_FIELDS } from "@/utils/productRules";
import type {
  CreateVariantRequest,
  ProductOption,
  ProductVariant,
} from "@/services/product.service";
import { type Errors, type FormState, toFormState, toRequest, validate } from "./variant-modal/variantForm";
import MarginReadout from "./product-form/fields/MarginReadout";
import { TAX_READ_PERMISSIONS } from "./product-form/tabs/PricingTab";
import PriceReasonModal from "./PriceReasonModal";

// VariantGrid imports combinationKey from here.
export { combinationKey } from "./variant-modal/variantForm";

interface VariantModalProps {
  /** Mount only while open, with a key per variant, so the form starts fresh. */
  onClose: () => void;
  productId: string;
  productSku: string;
  options: ProductOption[];
  /** Option value ids of every existing variant (sorted, comma joined) */
  takenCombinations: Set<string>;
  /** null = add a new combination */
  variant: ProductVariant | null;
  /** The product's GST rate (variants inherit it), for the margin readout */
  gstRate?: number | null;
}

const sameValue = (a: unknown, b: unknown) => (a ?? null) === (b ?? null);

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-error-500">{message}</p> : null;
}

const selectClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export const VariantModal: React.FC<VariantModalProps> = ({
  onClose,
  productId,
  productSku,
  options,
  takenCombinations,
  variant,
  gstRate = null,
}) => {
  const isEdit = !!variant;
  const [form, setForm] = useState<FormState>(() => toFormState(variant));
  const [showErrors, setShowErrors] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // An edit that changes a price waits here for its reason.
  const [pendingUpdate, setPendingUpdate] = useState<Partial<CreateVariantRequest> | null>(null);

  const { can } = usePermissions();
  const canViewCost = can("products.view_cost");
  const canReadTax = can(TAX_READ_PERMISSIONS);
  const { data: settings } = useTaxSettings({ enabled: canReadTax });
  const { data: rates } = useGstRates({ enabled: canViewCost && canReadTax });
  const labels = priceLabels(settings?.prices_include_gst ?? false);

  // "Same as product" plus the active rates (and a saved inactive one).
  const costRateOptions = useMemo(() => buildCostRateOptions(rates, form.cost_gst_rate), [rates, form.cost_gst_rate]);

  const { mutate: addVariant, isPending: isAdding } = useAddVariant({ silentError: true });
  const { mutate: updateVariant, isPending: isUpdating } = useUpdateVariant({ silentError: true });
  const isPending = isAdding || isUpdating;
  const skuLocked = !!variant?.sku_locked;

  const errors = validate(form, options, isEdit, takenCombinations, variant?.sku ?? "", isEdit ? toFormState(variant) : undefined);
  const shown: Errors = showErrors ? errors : {};

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setServerError(null);
  };

  const done = { onSuccess: onClose, onError: (error: Error) => setServerError(error.message) };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (Object.keys(errors).length) return;

    const data = toRequest(form, options, isEdit, variant?.sku ?? "", canViewCost);

    if (isEdit && variant) {
      // Send only what changed; option values and stock never change here.
      const before = toRequest(toFormState(variant), options, true, variant?.sku ?? "", canViewCost);
      const changed = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => !sameValue(value, before[key as keyof CreateVariantRequest]))
      ) as Partial<CreateVariantRequest>;
      if (Object.keys(changed).length === 0) {
        onClose();
        return;
      }
      if (PRICE_CHANGE_FIELDS.some((key) => key in changed)) {
        setPendingUpdate(changed);
        return;
      }
      saveUpdate(changed);
    } else {
      addVariant({ productId, data }, done);
    }
  };

  const saveUpdate = (changed: Partial<CreateVariantRequest>) => {
    if (variant) updateVariant({ productId, variantId: variant.id, data: changed }, done);
  };

  return (
    <>
      {/* While the reason is asked, Escape or the backdrop only closes the reason prompt */}
      <Modal isOpen onClose={pendingUpdate ? () => undefined : onClose} className="max-w-2xl p-6 sm:p-8">
        <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          {isEdit ? "Edit variant" : "Add variant"}
        </h3>

        <form onSubmit={handleSubmit} noValidate>
          <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
            {/* Option values: chosen on add, fixed afterwards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {options.map((option) => (
                <div key={option.id}>
                  <Label htmlFor={`value-${option.id}`}>{option.name}</Label>
                  {isEdit ? (
                    <Input
                      id={`value-${option.id}`}
                      value={variant?.option_values?.find((v) => v.option_id === option.id)?.value ?? "-"}
                      disabled
                    />
                  ) : (
                    <select
                      id={`value-${option.id}`}
                      value={form.values[option.id] ?? ""}
                      onChange={(e) => set("values", { ...form.values, [option.id]: e.target.value })}
                      className={selectClass}
                    >
                      <option value="">Choose…</option>
                      {option.values.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.value}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
            {isEdit ? (
              <p className="text-xs text-gray-500">
                Option values can&apos;t be changed. Delete this variant and add the combination again.
              </p>
            ) : (
              <FieldError message={shown.values} />
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="variant-sku">SKU</Label>
                <Input
                  id="variant-sku"
                  value={form.sku}
                  disabled={skuLocked}
                  error={!!shown.sku}
                  onChange={(e) => set("sku", e.target.value.toUpperCase())}
                  placeholder={isEdit ? "" : `Auto: ${productSku}-NN`}
                />
                <p className={`mt-1 text-xs ${shown.sku ? "text-error-500" : "text-gray-500"}`}>
                  {shown.sku ??
                    (skuLocked
                      ? "Used by orders or stock history, so it can't be changed"
                      : isEdit
                        ? "A-Z, 0-9 and hyphens"
                        : "Leave empty to generate one")}
                </p>
              </div>
              <div>
                <Label htmlFor="variant-barcode">Barcode</Label>
                <Input
                  id="variant-barcode"
                  value={form.barcode}
                  error={!!shown.barcode}
                  onChange={(e) => set("barcode", e.target.value.toUpperCase())}
                />
                <FieldError message={shown.barcode} />
              </div>
              <div>
                <Label htmlFor="variant-gtin">GTIN</Label>
                <Input
                  id="variant-gtin"
                  value={form.gtin}
                  error={!!shown.gtin}
                  inputMode="numeric"
                  onChange={(e) => set("gtin", e.target.value)}
                />
                <FieldError message={shown.gtin} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="variant-price">{labels.price} *</Label>
                <Input
                  type="number"
                  id="variant-price"
                  value={form.price}
                  error={!!shown.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="0.00"
                />
                <FieldError message={shown.price} />
              </div>
              <div>
                <Label htmlFor="variant-original-price">{labels.mrp}</Label>
                <Input
                  type="number"
                  id="variant-original-price"
                  value={form.original_price}
                  error={!!shown.original_price}
                  onChange={(e) => set("original_price", e.target.value)}
                  placeholder="Leave empty if there is no MRP"
                />
                <FieldError message={shown.original_price} />
              </div>
              <div>
                <Label htmlFor="variant-min-price">{labels.min}</Label>
                <Input
                  type="number"
                  id="variant-min-price"
                  value={form.min_selling_price}
                  error={!!shown.min_selling_price}
                  onChange={(e) => set("min_selling_price", e.target.value)}
                  placeholder="Optional"
                />
                <FieldError message={shown.min_selling_price} />
              </div>
              <div>
                <Label htmlFor="variant-b2b-price">{labels.b2b}</Label>
                <Input
                  type="number"
                  id="variant-b2b-price"
                  value={form.b2b_price}
                  error={!!shown.b2b_price}
                  onChange={(e) => set("b2b_price", e.target.value)}
                  placeholder="Optional"
                />
                <FieldError message={shown.b2b_price} />
              </div>
              <Can permission="products.view_cost">
                <div>
                  <Label htmlFor="variant-cost-price">{labels.cost}</Label>
                  <Input
                    type="number"
                    id="variant-cost-price"
                    value={form.cost_price}
                    error={!!shown.cost_price}
                    onChange={(e) => set("cost_price", e.target.value)}
                    placeholder="Optional"
                  />
                  <FieldError message={shown.cost_price} />
                  {settings && !errors.price && !errors.cost_price && (
                    <MarginReadout
                      price={form.price}
                      cost={form.cost_price}
                      gstRate={gstRate ?? settings.default_gst_rate}
                      costGstRate={form.cost_gst_rate}
                      pricesIncludeGst={settings.prices_include_gst}
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="variant-cost-gst-rate">Purchase GST rate</Label>
                  <Select
                    id="variant-cost-gst-rate"
                    options={costRateOptions}
                    value={form.cost_gst_rate}
                    onChange={(val) => set("cost_gst_rate", val)}
                    placeholder="Same as product"
                  />
                </div>
              </Can>
              <div>
                <Label htmlFor="variant-stock">{isEdit ? "Stock" : "Initial stock"}</Label>
                {isEdit ? (
                  <>
                    <Input id="variant-stock" value={numText(variant?.stock_quantity)} disabled />
                    <p className="mt-1 text-xs text-gray-500">Change stock from Inventory</p>
                  </>
                ) : (
                  <>
                    <Input
                      type="number"
                      id="variant-stock"
                      value={form.stock_quantity}
                      error={!!shown.stock_quantity}
                      onChange={(e) => set("stock_quantity", e.target.value)}
                      placeholder="0"
                    />
                    <FieldError message={shown.stock_quantity} />
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="variant-pack-size">Pack size</Label>
                <Input
                  type="number"
                  id="variant-pack-size"
                  value={form.pack_size}
                  error={!!shown.pack_size}
                  onChange={(e) => set("pack_size", e.target.value)}
                />
                <FieldError message={shown.pack_size} />
              </div>
              <div>
                <Label htmlFor="variant-reorder-level">Reorder level (blank uses the product&apos;s)</Label>
                <Input
                  type="number"
                  min="0"
                  id="variant-reorder-level"
                  value={form.reorder_level}
                  error={!!shown.reorder_level}
                  onChange={(e) => set("reorder_level", e.target.value)}
                  placeholder="Product's level"
                />
                <FieldError message={shown.reorder_level} />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Customers see &quot;Only N left&quot; when stock is at or below this number.
                </p>
              </div>
              {MEASURES.map((m) => (
                <div key={m.key}>
                  <Label htmlFor={`variant-${m.key}`}>{m.label}</Label>
                  <Input
                    type="number"
                    id={`variant-${m.key}`}
                    value={form.measures[m.key]}
                    error={!!shown[m.key]}
                    onChange={(e) => set("measures", { ...form.measures, [m.key]: e.target.value })}
                  />
                  <FieldError message={shown[m.key]} />
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => set("is_active", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500"
              />
              Active (sold to customers)
            </label>
          </div>

          {serverError && (
            <p role="alert" className="mt-4 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
              {serverError}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-50"
            >
              {isPending ? "Saving..." : isEdit ? "Update variant" : "Add variant"}
            </button>
          </div>
        </form>
      </Modal>
      {pendingUpdate && (
        <PriceReasonModal
          busy={isUpdating}
          onCancel={() => setPendingUpdate(null)}
          onConfirm={(reason) => {
            saveUpdate({ ...pendingUpdate, price_change_reason: reason });
            setPendingUpdate(null);
          }}
        />
      )}
    </>
  );
};

export default VariantModal;
