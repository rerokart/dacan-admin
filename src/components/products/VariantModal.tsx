"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useAddVariant, useUpdateVariant } from "@/hooks/useProducts";
import { MEASURES, numText } from "@/utils/productFormat";
import type {
  CreateVariantRequest,
  ProductOption,
  ProductVariant,
} from "@/services/product.service";
import { type Errors, type FormState, toFormState, toRequest, validate } from "./variant-modal/variantForm";

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
}) => {
  const isEdit = !!variant;
  const [form, setForm] = useState<FormState>(() => toFormState(variant));
  const [showErrors, setShowErrors] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate: addVariant, isPending: isAdding } = useAddVariant();
  const { mutate: updateVariant, isPending: isUpdating } = useUpdateVariant();
  const isPending = isAdding || isUpdating;
  const skuLocked = !!variant?.sku_locked;

  const errors = validate(form, options, isEdit, takenCombinations, variant?.sku ?? "");
  const shown: Errors = showErrors ? errors : {};

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setServerError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (Object.keys(errors).length) return;

    const data = toRequest(form, options, isEdit, variant?.sku ?? "");
    const done = { onSuccess: onClose, onError: (error: Error) => setServerError(error.message) };

    if (isEdit && variant) {
      // Send only what changed; option values and stock never change here.
      const before = toRequest(toFormState(variant), options, true, variant?.sku ?? "");
      const changed = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => !sameValue(value, before[key as keyof CreateVariantRequest]))
      ) as Partial<CreateVariantRequest>;
      if (Object.keys(changed).length === 0) {
        onClose();
        return;
      }
      updateVariant({ productId, variantId: variant.id, data: changed }, done);
    } else {
      addVariant({ productId, data }, done);
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-2xl p-6 sm:p-8">
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
              <Label htmlFor="variant-price">Price (₹) *</Label>
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
              <Label htmlFor="variant-original-price">Original price (₹)</Label>
              <Input
                type="number"
                id="variant-original-price"
                value={form.original_price}
                error={!!shown.original_price}
                onChange={(e) => set("original_price", e.target.value)}
                placeholder="For discount display"
              />
              <FieldError message={shown.original_price} />
            </div>
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
  );
};

export default VariantModal;
