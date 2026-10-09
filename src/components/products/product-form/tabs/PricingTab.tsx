import Link from "next/link";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { MEASURES, numText } from "@/utils/productFormat";
import type { Product, ProductVariant } from "@/services/product.service";
import FieldError from "../fields/FieldError";
import type { TabProps } from "./types";

export default function PricingTab({ form, set, errors, hasPricing, isCreate, baseline, defaultVariant }: TabProps & {
  hasPricing: boolean;
  isCreate: boolean;
  baseline?: Product;
  defaultVariant?: ProductVariant;
}) {
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
              <Label htmlFor="price">Price (₹)</Label>
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
            </div>
            <div>
              <Label htmlFor="original_price">Original Price (₹)</Label>
              <Input
                id="original_price"
                type="number"
                min="0"
                step="0.01"
                value={form.original_price}
                error={!!errors.original_price}
                onChange={(e) => set("original_price", e.target.value)}
                placeholder="Shown struck through for a discount"
              />
              <FieldError error={errors.original_price} />
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
