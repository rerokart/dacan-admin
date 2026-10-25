import {
  BARCODE_PATTERN,
  COUNTRY_MAX,
  COUNTRY_MIN,
  HSN_PATTERN,
  SKU_PATTERN,
  WARRANTY_MONTHS_MAX,
  WARRANTY_MONTHS_MIN,
  checkQuantityRules,
  B2B_PRICE_MESSAGE,
  b2bPriceProblem,
  isValidGtin,
  priceProblems,
} from "@/utils/productRules";
import { MEASURES, num } from "@/utils/productFormat";
import { type FormState, type TabKey, normaliseTag, tagProblem } from "./formState";

// ---------------------------------------------------------------------------
// Client checks (the server re-checks everything)
// ---------------------------------------------------------------------------

export type FieldErrors = Partial<Record<string, { tab: TabKey; message: string }>>;

/** The saved selling price, MRP and minimum price (as form text) an edit is compared with. */
export type SavedPrices = Pick<FormState, "price" | "original_price" | "min_selling_price" | "b2b_price">;

const isWholeNumber = (value: string, min: number) =>
  value.trim() === "" || (Number.isInteger(Number(value)) && Number(value) >= min);

export const validate = (
  state: FormState,
  pricing: boolean,
  isCreate: boolean,
  baselineSku = "",
  savedPrices?: SavedPrices
): FieldErrors => {
  const errors: FieldErrors = {};
  const add = (field: string, tab: TabKey, message: string) => {
    if (!errors[field]) errors[field] = { tab, message };
  };

  if (!state.name.trim()) add("name", "basics", "Name is required");
  if (!state.category_id) add("category_id", "basics", "Choose a category");
  // Create may leave the SKU blank (auto PRD-000123); an existing product always keeps one.
  // The format is only checked when the SKU changed, so a legacy SKU never blocks other edits.
  const skuNow = state.sku.trim().toUpperCase();
  const skuBefore = baselineSku.trim().toUpperCase();
  if (!isCreate && !skuNow && skuBefore) {
    add("sku", "basics", "SKU can't be empty");
  } else if (skuNow && skuNow !== skuBefore && !SKU_PATTERN.test(skuNow)) {
    add("sku", "basics", "3-50 characters: A-Z, 0-9 and hyphens");
  }

  if (pricing) {
    const priceKeys = ["price", "original_price", "min_selling_price", "b2b_price", "cost_price"] as const;
    let pricesValid = true;
    for (const key of priceKeys) {
      const v = state[key];
      const bad = Number.isNaN(Number(v)) || Number(v) < 0 || (key === "b2b_price" && Number(v) === 0);
      if (v.trim() !== "" && bad) {
        add(key, "pricing", key === "b2b_price" ? B2B_PRICE_MESSAGE : "Enter a price of 0 or more");
        pricesValid = false;
      }
    }
    // Like the server, the price rules only run when one of the three changed,
    // so an older product that breaks them can still get other edits.
    const pricesChanged =
      isCreate ||
      !savedPrices ||
      (["price", "original_price", "min_selling_price"] as const).some((k) => num(state[k]) !== num(savedPrices[k]));
    if (pricesValid && pricesChanged) {
      for (const p of priceProblems(num(state.price), num(state.original_price), num(state.min_selling_price))) {
        add(p.field, "pricing", p.message);
      }
    }
    if (!isCreate && pricesValid) {
      const b2b = num(state.b2b_price);
      const mrp = num(state.original_price);
      // Like the server, checked only when the B2B price or the MRP changed.
      const b2bChanged = !savedPrices || b2b !== num(savedPrices.b2b_price) || mrp !== num(savedPrices.original_price);
      const problem = b2bChanged ? b2bPriceProblem(b2b, mrp) : null;
      if (problem) add("b2b_price", "pricing", problem);
    }
    if (state.barcode.trim() && !BARCODE_PATTERN.test(state.barcode.trim())) {
      add("barcode", "pricing", "4-48 characters: A-Z, 0-9 and hyphens");
    }
    if (state.gtin.trim() && !isValidGtin(state.gtin.trim())) {
      add("gtin", "pricing", "8, 12, 13 or 14 digits with a valid check digit");
    }
    if (!isWholeNumber(state.pack_size, 1)) add("pack_size", "pricing", "Whole number, 1 or more");
    if (!isWholeNumber(state.stock_quantity, 0)) add("stock_quantity", "pricing", "Whole number, 0 or more");
    for (const m of MEASURES) {
      if (!isWholeNumber(state[m.key], 0)) add(m.key, "pricing", "Whole number, 0 or more");
    }
  }
  if (!isWholeNumber(state.low_stock_threshold, 0)) {
    add("low_stock_threshold", "pricing", "Whole number, 0 or more");
  }

  if (state.hsn_code.trim() && !HSN_PATTERN.test(state.hsn_code.trim())) {
    add("hsn_code", "identity", "4, 6 or 8 digits");
  }
  // A tag still being typed is saved with the form, so it must pass the tag rules.
  const draftTag = normaliseTag(state.tag_draft);
  const draftProblem = draftTag ? tagProblem(state.tags, draftTag) : null;
  if (draftProblem) add("tags", "identity", draftProblem);
  const country = state.country_of_origin.trim();
  if (country && (country.length < COUNTRY_MIN || country.length > COUNTRY_MAX)) {
    add("country_of_origin", "identity", `${COUNTRY_MIN}-${COUNTRY_MAX} characters`);
  }

  if (state.warranty_available) {
    const months = Number(state.warranty_months);
    if (
      state.warranty_months.trim() === "" ||
      !Number.isInteger(months) ||
      months < WARRANTY_MONTHS_MIN ||
      months > WARRANTY_MONTHS_MAX
    ) {
      add("warranty_months", "content", `Warranty months: ${WARRANTY_MONTHS_MIN}-${WARRANTY_MONTHS_MAX}`);
    }
  }

  state.specifications.forEach((s, i) => {
    if (!s.name.trim() && s.value.trim()) add(`spec-${i}`, "specs", `Row ${i + 1} needs a name`);
    if (s.name.trim() && !s.value.trim()) add(`spec-${i}`, "specs", `"${s.name.trim()}" needs a value`);
  });

  const qtyMessage =
    !isWholeNumber(state.min_order_qty, 1) ||
    !isWholeNumber(state.order_qty_step, 1) ||
    !isWholeNumber(state.max_order_qty, 1)
      ? "Quantities must be whole numbers, 1 or more"
      : checkQuantityRules(num(state.min_order_qty), num(state.max_order_qty), num(state.order_qty_step));
  if (qtyMessage) add("quantity", "limits", qtyMessage);

  return errors;
};
