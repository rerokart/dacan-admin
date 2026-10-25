import { BARCODE_PATTERN, SKU_PATTERN, b2bPriceProblem, isValidGtin, priceProblems } from "@/utils/productRules";
import { MEASURES, type MeasureKey, num, numText } from "@/utils/productFormat";
import type { CreateVariantRequest, ProductOption, ProductVariant } from "@/services/product.service";

// Form model for the variant modal: initial state, client checks and the request body.

export interface FormState {
  values: Record<string, string>; // option id -> value id
  sku: string;
  barcode: string;
  gtin: string;
  price: string;
  /** MRP */
  original_price: string;
  min_selling_price: string;
  /** Only sent for admins with products.view_cost */
  cost_price: string;
  /** Purchase GST rate; "" = same as the product. Only sent for admins with products.view_cost */
  cost_gst_rate: string;
  b2b_price: string;
  pack_size: string;
  stock_quantity: string;
  is_active: boolean;
  measures: Record<MeasureKey, string>;
}

// Unlike productFormat.toText, this also upper-cases (barcodes).
const text = (s: string): string | null => (s.trim() === "" ? null : s.trim().toUpperCase());
const isWhole = (s: string, min: number) =>
  s.trim() === "" || (Number.isInteger(Number(s)) && Number(s) >= min);

export const combinationKey = (valueIds: string[]) => [...valueIds].sort().join(",");

export const toFormState = (variant: ProductVariant | null): FormState => ({
  values: Object.fromEntries((variant?.option_values ?? []).map((v) => [v.option_id, v.value_id])),
  sku: variant?.sku ?? "",
  barcode: variant?.barcode ?? "",
  gtin: variant?.gtin ?? "",
  price: numText(variant?.price),
  original_price: numText(variant?.original_price),
  min_selling_price: numText(variant?.min_selling_price),
  cost_price: numText(variant?.cost_price),
  cost_gst_rate: variant?.cost_gst_rate == null ? "" : String(Number(variant.cost_gst_rate)),
  b2b_price: numText(variant?.b2b_price),
  pack_size: numText(variant?.pack_size ?? 1),
  stock_quantity: "",
  is_active: variant?.is_active ?? true,
  measures: Object.fromEntries(MEASURES.map((m) => [m.key, numText(variant?.[m.key])])) as Record<MeasureKey, string>,
});

export type Errors = Partial<Record<string, string>>;

export const validate = (
  state: FormState,
  options: ProductOption[],
  isEdit: boolean,
  taken: Set<string>,
  baselineSku = "",
  /** The saved variant's form state (edit) */
  saved?: FormState
): Errors => {
  const errors: Errors = {};
  if (!isEdit) {
    const chosen = options.map((o) => state.values[o.id]).filter(Boolean);
    if (chosen.length !== options.length) errors.values = "Choose one value for each option";
    else if (taken.has(combinationKey(chosen))) errors.values = "This combination already exists";
  }
  const sku = state.sku.trim().toUpperCase();
  // Format is only checked when the SKU changed, so a legacy SKU never blocks other edits.
  const skuBefore = baselineSku.trim().toUpperCase();
  if (isEdit && !sku && skuBefore) errors.sku = "SKU can't be empty";
  else if (sku && sku !== skuBefore && !SKU_PATTERN.test(sku)) errors.sku = "3-50 characters: A-Z, 0-9 and hyphens";
  if (state.barcode.trim() && !BARCODE_PATTERN.test(state.barcode.trim().toUpperCase())) {
    errors.barcode = "4-48 characters: A-Z, 0-9 and hyphens";
  }
  if (state.gtin.trim() && !isValidGtin(state.gtin.trim())) {
    errors.gtin = "8, 12, 13 or 14 digits with a valid check digit";
  }
  if (state.price.trim() === "" || Number.isNaN(Number(state.price)) || Number(state.price) < 0) {
    errors.price = "Enter a price of 0 or more";
  }
  for (const key of ["original_price", "min_selling_price", "b2b_price", "cost_price"] as const) {
    if (state[key].trim() !== "" && (Number.isNaN(Number(state[key])) || Number(state[key]) < 0)) {
      errors[key] = "Enter a price of 0 or more";
    }
  }
  // Price rules (as on the server): on edit only when one of the three changed,
  // so an older variant that breaks them can still get other edits.
  const pricesChanged =
    !isEdit ||
    !saved ||
    (["price", "original_price", "min_selling_price"] as const).some((k) => num(state[k]) !== num(saved[k]));
  if (!errors.price && !errors.original_price && !errors.min_selling_price && pricesChanged) {
    for (const p of priceProblems(num(state.price), num(state.original_price), num(state.min_selling_price))) {
      if (!errors[p.field]) errors[p.field] = p.message;
    }
  }
  // B2B rules, like the server: only when the B2B price or the MRP changed.
  if (!errors.b2b_price && !errors.original_price) {
    const b2b = num(state.b2b_price);
    const mrp = num(state.original_price);
    const b2bChanged = !isEdit || !saved || b2b !== num(saved.b2b_price) || mrp !== num(saved.original_price);
    const problem = b2bChanged ? b2bPriceProblem(b2b, mrp) : null;
    if (problem) errors.b2b_price = problem;
  }
  if (!isWhole(state.pack_size, 1)) errors.pack_size = "Whole number, 1 or more";
  if (!isEdit && !isWhole(state.stock_quantity, 0)) errors.stock_quantity = "Whole number, 0 or more";
  for (const m of MEASURES) {
    if (!isWhole(state.measures[m.key], 0)) errors[m.key] = "Whole number, 0 or more";
  }
  return errors;
};

export const toRequest = (
  state: FormState,
  options: ProductOption[],
  isEdit: boolean,
  baselineSku = "",
  /** Without products.view_cost the cost_price and cost_gst_rate keys must never be sent (403). */
  withCost = false
): CreateVariantRequest => {
  const data: CreateVariantRequest = {
    price: Number(state.price),
    original_price: num(state.original_price),
    min_selling_price: num(state.min_selling_price),
    barcode: text(state.barcode),
    gtin: state.gtin.trim() || null,
    pack_size: num(state.pack_size) ?? 1,
    is_active: state.is_active,
  };
  if (withCost) {
    data.cost_price = num(state.cost_price);
    data.cost_gst_rate = num(state.cost_gst_rate);
  }
  // On add a blank B2B price is simply left out; on edit a blank one clears it.
  if (isEdit || num(state.b2b_price) !== null) data.b2b_price = num(state.b2b_price);
  for (const m of MEASURES) data[m.key] = num(state.measures[m.key]);
  const sku = state.sku.trim().toUpperCase();
  if (sku && !(isEdit && sku === (baselineSku ?? "").trim().toUpperCase())) data.sku = sku;
  if (!isEdit) {
    data.option_value_ids = options.map((o) => state.values[o.id]);
    data.stock_quantity = num(state.stock_quantity) ?? 0;
  }
  return data;
};
