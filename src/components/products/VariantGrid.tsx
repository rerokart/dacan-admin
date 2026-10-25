"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Can from "@/components/auth/Can";
import { usePermissions } from "@/context/AuthContext";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useDeleteVariant, useGenerateVariants, useUpdateVariant } from "@/hooks/useProducts";
import { MAX_VARIANTS } from "@/utils/productRules";
import { percent, rupees } from "@/utils/productFormat";
import { formatCurrency } from "@/utils/helpers/helperfn";
import type { Product, ProductVariant } from "@/services/product.service";
import { VariantModal, combinationKey } from "./VariantModal";

interface VariantGridProps {
  /** A product with options (no default variant) */
  product: Product;
  /** Archived product: variants are listed, nothing can be changed */
  readOnly?: boolean;
}

const money = (n?: number | null) =>
  n === null || n === undefined ? "-" : formatCurrency(Number(n));

const th = "px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400";
const td = "px-3 py-3 text-sm text-gray-700 dark:text-gray-300";
const iconButton =
  "rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200";

type ModalState = { variant: ProductVariant | null } | null;

export default function VariantGrid({ product, readOnly = false }: VariantGridProps) {
  const [modal, setModal] = useState<ModalState>(null);
  const { confirm } = useConfirm();
  const { mutate: generate, isPending: isGenerating } = useGenerateVariants();
  const { mutate: updateVariant, isPending: isToggling, variables: toggling } = useUpdateVariant();
  const { mutate: deleteVariant } = useDeleteVariant();
  const { can } = usePermissions();
  const canViewCost = can("products.view_cost");

  const options = useMemo(() => product.options ?? [], [product.options]);
  // The default variant (a product without options) never shows here.
  const variants = useMemo(() => (product.variants ?? []).filter((v) => !v.is_default), [product.variants]);

  const taken = useMemo(
    () => new Set(variants.map((v) => combinationKey((v.option_values ?? []).map((ov) => ov.value_id)))),
    [variants]
  );
  const totalCombinations = options.length ? options.reduce((n, o) => n * o.values.length, 1) : 0;
  const missing = Math.max(totalCombinations - taken.size, 0);
  const overLimit = variants.length + missing > MAX_VARIANTS;

  const valueOf = (variant: ProductVariant, optionId: string) =>
    variant.option_values?.find((ov) => ov.option_id === optionId)?.value ?? "-";

  const handleDelete = async (variant: ProductVariant) => {
    const label = options.map((o) => valueOf(variant, o.id)).join(" / ");
    const ok = await confirm({
      title: "Delete variant",
      message: `Delete ${label} (${variant.sku})? Variants with orders or stock history can only be deactivated.`,
      variant: "danger",
      confirmText: "Delete",
    });
    // The hook toasts the server's message, e.g. "Deactivate this variant instead".
    if (ok) deleteVariant({ productId: product.id, variantId: variant.id });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {variants.length}/{MAX_VARIANTS} variants · {totalCombinations} possible combination
          {totalCombinations === 1 ? "" : "s"}
        </p>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <Can permission="products.edit">
              <button
                type="button"
                onClick={() => generate(product.id)}
                disabled={isGenerating || missing === 0 || overLimit}
                title={
                  overLimit
                    ? `Generating would make ${variants.length + missing} variants; the limit is ${MAX_VARIANTS}`
                    : undefined
                }
                className="rounded-lg px-3 py-2 text-sm font-medium text-brand-600 ring-1 ring-inset ring-brand-200 hover:bg-brand-50 disabled:opacity-40 dark:text-brand-400 dark:ring-brand-800 dark:hover:bg-brand-900/20"
              >
                {isGenerating
                  ? "Generating..."
                  : missing === 0
                    ? "No missing combinations"
                    : `Generate ${missing} missing combination${missing === 1 ? "" : "s"}`}
              </button>
            </Can>
            <Can permission="products.create">
              <button
                type="button"
                onClick={() => setModal({ variant: null })}
                disabled={missing === 0 || variants.length >= MAX_VARIANTS}
                className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                + Add variant
              </button>
            </Can>
          </div>
        )}
      </div>
      {!readOnly && overLimit && missing > 0 && (
        <p className="mb-3 text-xs text-warning-600">
          Generating every combination would make {variants.length + missing} variants; a product can have at most{" "}
          {MAX_VARIANTS}. Add the ones you need one by one, or remove option values.
        </p>
      )}
      {!readOnly && (
        <p className="mb-3 text-xs text-gray-500">
          Generated variants start inactive with stock 0. Set their price, then switch them on.
        </p>
      )}

      {variants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {readOnly ? "No variants." : "No variants yet. Generate the combinations or add one."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`w-full ${canViewCost ? "min-w-[68rem]" : "min-w-[62rem]"}`}>
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {options.map((o) => (
                  <th key={o.id} className={th}>
                    {o.name}
                  </th>
                ))}
                <th className={th}>SKU</th>
                <th className={th}>Barcode</th>
                <th className={th}>GTIN</th>
                <th className={`${th} text-right`}>Price</th>
                <th className={`${th} text-right`}>MRP</th>
                <th className={`${th} text-right`}>Min</th>
                <th className={`${th} text-right`}>B2B</th>
                {canViewCost && <th className={`${th} text-right`}>Cost / Margin</th>}
                <th className={`${th} text-right`}>Stock</th>
                <th className={`${th} text-right`}>Reorder level</th>
                <th className={`${th} text-center`}>Active</th>
                {!readOnly && <th className={`${th} text-right`}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => {
                const busy = isToggling && toggling?.variantId === variant.id;
                return (
                  <tr key={variant.id} className="border-b border-gray-100 dark:border-gray-800">
                    {options.map((o) => (
                      <td key={o.id} className={`${td} font-medium text-gray-800 dark:text-white/90`}>
                        {valueOf(variant, o.id)}
                      </td>
                    ))}
                    <td className={td}>
                      <span className="inline-flex items-center gap-1 font-mono text-xs">
                        {variant.sku}
                        {variant.sku_locked && (
                          <svg
                            className="h-3.5 w-3.5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            role="img"
                            aria-label="SKU locked: used by orders or stock history"
                          >
                            <title>SKU locked: used by orders or stock history</title>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        )}
                      </span>
                    </td>
                    <td className={`${td} font-mono text-xs`}>{variant.barcode || "-"}</td>
                    <td className={`${td} font-mono text-xs`}>{variant.gtin || "-"}</td>
                    <td className={`${td} text-right`}>{money(variant.price)}</td>
                    <td className={`${td} text-right text-gray-500`}>{money(variant.original_price)}</td>
                    <td className={`${td} text-right text-gray-500`}>{money(variant.min_selling_price)}</td>
                    <td className={`${td} text-right text-gray-500`}>{money(variant.b2b_price)}</td>
                    {canViewCost && (
                      <td className={`${td} text-right tabular-nums`}>
                        {money(variant.cost_price)}
                        {variant.cost_with_gst !== null && variant.cost_with_gst !== undefined && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            With GST {rupees(variant.cost_with_gst)}
                          </span>
                        )}
                        {variant.margin_amount !== null && variant.margin_amount !== undefined && (
                          <span
                            className={`block text-xs ${variant.margin_amount < 0 ? "text-error-500" : "text-gray-500 dark:text-gray-400"}`}
                          >
                            {rupees(variant.margin_amount)}
                            {variant.margin_percent !== null && variant.margin_percent !== undefined &&
                              ` (${percent(variant.margin_percent)})`}
                          </span>
                        )}
                      </td>
                    )}
                    <td className={`${td} text-right`}>
                      <Link
                        href="/inventory"
                        title="Change stock from Inventory"
                        className="text-brand-600 hover:underline dark:text-brand-400"
                      >
                        {variant.stock_quantity}
                      </Link>
                    </td>
                    <td className={`${td} text-right text-gray-500`}>
                      {variant.reorder_level ?? variant.effective_reorder_level ?? "-"}
                      {variant.reorder_level == null && variant.effective_reorder_level != null && (
                        <span className="block text-xs">product&apos;s</span>
                      )}
                    </td>
                    <td className={`${td} text-center`}>
                      {readOnly ? (
                        variant.is_active ? "Yes" : "No"
                      ) : (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={variant.is_active}
                          aria-label={`${variant.is_active ? "Deactivate" : "Activate"} ${variant.sku}`}
                          disabled={busy}
                          onClick={() =>
                            updateVariant({
                              productId: product.id,
                              variantId: variant.id,
                              data: { is_active: !variant.is_active },
                            })
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 ${
                            variant.is_active ? "bg-brand-500" : "bg-gray-200 dark:bg-white/10"
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                              variant.is_active ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      )}
                    </td>
                    {!readOnly && (
                      <td className={`${td} text-right`}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            aria-label={`Edit ${variant.sku}`}
                            onClick={() => setModal({ variant })}
                            className={iconButton}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <Can permission="products.delete">
                            <button
                              type="button"
                              aria-label={`Delete ${variant.sku}`}
                              onClick={() => handleDelete(variant)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </Can>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && !readOnly && (
        <VariantModal
          key={modal.variant?.id ?? "new"}
          onClose={() => setModal(null)}
          productId={product.id}
          productSku={product.sku}
          options={options}
          takenCombinations={taken}
          variant={modal.variant}
          gstRate={product.gst_rate ?? null}
        />
      )}
    </div>
  );
}
