import { useMemo } from "react";
import Link from "next/link";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Can from "@/components/auth/Can";
import { usePermissions } from "@/context/AuthContext";
import { useGstRates, useTaxSettings } from "@/hooks/useTaxSettings";
import { gstOnPrice } from "@/utils/margin";
import { MEASURES, numText, percent, rupees } from "@/utils/productFormat";
import type { Product, ProductVariant } from "@/services/product.service";
import FieldError from "../fields/FieldError";
import MarginReadout from "../fields/MarginReadout";
import type { TabProps } from "./types";

/** Settings, rates and HSN codes are readable with settings.view or products.edit (P7). */
export const TAX_READ_PERMISSIONS = ["settings.view", "products.edit"];

export default function PricingTab({
  form,
  set,
  errors,
  hasPricing,
  isCreate,
  baseline,
  defaultVariant,
  rateHint,
}: TabProps & {
  hasPricing: boolean;
  isCreate: boolean;
  baseline?: Product;
  defaultVariant?: ProductVariant;
  /** "Rate filled from HSN 7214" after an HSN autofill */
  rateHint?: string | null;
}) {
  const { can } = usePermissions();
  const canReadTax = can(TAX_READ_PERMISSIONS);
  const { data: settings } = useTaxSettings({ enabled: canReadTax });
  const { data: rates } = useGstRates({ enabled: canReadTax });

  // Active rates, plus the chosen rate when it is no longer active (an older product).
  const rateOptions = useMemo(() => {
    const options = (rates ?? [])
      .filter((r) => r.is_active)
      .sort((a, b) => Number(a.rate) - Number(b.rate))
      .map((r) => ({ value: String(Number(r.rate)), label: r.label || percent(r.rate) }));
    if (form.gst_rate && !options.some((o) => o.value === form.gst_rate)) {
      const rate = percent(Number(form.gst_rate));
      // Until the list loads (or without access to it) the rate can't be called inactive.
      options.push({ value: form.gst_rate, label: rates ? `${rate} (inactive)` : rate });
    }
    if (isCreate) options.unshift({ value: "", label: "From the HSN code, else the store default" });
    return options;
  }, [rates, form.gst_rate, isCreate]);

  // Blank on create: the server will use the HSN rate or the default; show the default meanwhile.
  const effectiveRate = form.gst_rate || (settings ? String(settings.default_gst_rate) : "");
  const includeGst = settings?.prices_include_gst ?? true;
  const gst = settings && form.price.trim() !== "" && !errors.price ? gstOnPrice(form.price, effectiveRate, includeGst) : null;

  return (
    <>
      {!hasPricing && (
        <p className="mb-6 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          This product has options. Price, stock, barcode, GTIN, pack size and weights are set on each
          variant below.
        </p>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {hasPricing && (
          <>
            <div>
              <Label htmlFor="price">Selling price (₹)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                error={!!errors.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0.00"
              />
              <FieldError error={errors.price} />
              {gst !== null && (
                <p className="mt-1 text-xs tabular-nums text-gray-500 dark:text-gray-400">
                  Customer pays {rupees(Number(form.price))}, {includeGst ? "including" : "plus"} GST {rupees(gst)}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="original_price">MRP (₹)</Label>
              <Input
                id="original_price"
                type="number"
                min="0"
                step="0.01"
                value={form.original_price}
                error={!!errors.original_price}
                onChange={(e) => set("original_price", e.target.value)}
                placeholder="Leave empty if there is no MRP"
              />
              <FieldError error={errors.original_price} />
            </div>
            <div>
              <Label htmlFor="min_selling_price">Minimum selling price (₹)</Label>
              <Input
                id="min_selling_price"
                type="number"
                min="0"
                step="0.01"
                value={form.min_selling_price}
                error={!!errors.min_selling_price}
                onChange={(e) => set("min_selling_price", e.target.value)}
                placeholder="Optional"
              />
              <FieldError error={errors.min_selling_price} />
            </div>
            <div>
              <Label htmlFor="stock_quantity">{isCreate ? "Initial Stock" : "Current Stock"}</Label>
              {isCreate ? (
                <>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    error={!!errors.stock_quantity}
                    onChange={(e) => set("stock_quantity", e.target.value)}
                    placeholder="0"
                  />
                  <FieldError error={errors.stock_quantity} />
                  <p className="mt-1 text-xs text-gray-500">Recorded in stock history as &quot;Initial stock&quot;.</p>
                </>
              ) : (
                <>
                  <Input id="stock_quantity" value={numText(defaultVariant?.stock_quantity ?? baseline?.stock_quantity)} disabled />
                  <Link href="/inventory" className="mt-1 inline-block text-xs text-brand-500 hover:underline">
                    Change in Inventory
                  </Link>
                </>
              )}
            </div>
          </>
        )}
        <div>
          <Label htmlFor="gst_rate">GST rate</Label>
          <Select
            id="gst_rate"
            options={rateOptions}
            value={form.gst_rate}
            onChange={(val) => set("gst_rate", val)}
            placeholder={canReadTax ? "Choose a rate" : "Not available"}
          />
          <FieldError error={errors.gst_rate} />
          {rateHint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{rateHint}</p>}
          {!hasPricing && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Every variant uses this rate.</p>}
        </div>
        {hasPricing && (
          <Can permission="products.view_cost">
            <div>
              <Label htmlFor="cost_price">Cost price before GST (₹)</Label>
              <Input
                id="cost_price"
                type="number"
                min="0"
                step="0.01"
                value={form.cost_price}
                error={!!errors.cost_price}
                onChange={(e) => set("cost_price", e.target.value)}
                placeholder="Optional"
              />
              <FieldError error={errors.cost_price} />
              {settings && !errors.price && !errors.cost_price && (
                <MarginReadout
                  price={form.price}
                  cost={form.cost_price}
                  gstRate={effectiveRate}
                  pricesIncludeGst={includeGst}
                />
              )}
            </div>
          </Can>
        )}
        <div>
          <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
          <Input
            id="low_stock_threshold"
            type="number"
            min="0"
            value={form.low_stock_threshold}
            error={!!errors.low_stock_threshold}
            onChange={(e) => set("low_stock_threshold", e.target.value)}
            placeholder="10"
          />
          <FieldError error={errors.low_stock_threshold} />
        </div>
        {hasPricing && (
          <>
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={form.barcode}
                error={!!errors.barcode}
                onChange={(e) => set("barcode", e.target.value.toUpperCase())}
                placeholder="Store barcode"
              />
              <FieldError error={errors.barcode} />
            </div>
            <div>
              <Label htmlFor="gtin">GTIN / EAN / UPC</Label>
              <Input
                id="gtin"
                inputMode="numeric"
                value={form.gtin}
                error={!!errors.gtin}
                onChange={(e) => set("gtin", e.target.value.replace(/\s/g, ""))}
                placeholder="8, 12, 13 or 14 digits"
              />
              <FieldError error={errors.gtin} />
            </div>
            <div>
              <Label htmlFor="pack_size">Pack Size</Label>
              <Input
                id="pack_size"
                type="number"
                min="1"
                value={form.pack_size}
                error={!!errors.pack_size}
                onChange={(e) => set("pack_size", e.target.value)}
                placeholder="1"
              />
              <FieldError error={errors.pack_size} />
            </div>
            {MEASURES.map((m) => (
              <div key={m.key}>
                <Label htmlFor={m.key}>{m.label}</Label>
                <Input
                  id={m.key}
                  type="number"
                  min="0"
                  value={form[m.key]}
                  error={!!errors[m.key]}
                  onChange={(e) => set(m.key, e.target.value)}
                />
                <FieldError error={errors[m.key]} />
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
