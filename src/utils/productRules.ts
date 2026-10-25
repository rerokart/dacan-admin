// Product limits. Mirror the backend (app/services/product_rules.py); keep both in step.

export const MAX_OPTIONS = 3;
export const MAX_VALUES_PER_OPTION = 30;
export const MAX_VARIANTS = 100;
export const OPTION_NAME_MAX = 30;
export const OPTION_VALUE_MAX = 50;

export const SKU_MIN = 3;
export const SKU_MAX = 50;
export const SKU_PATTERN = /^[A-Z0-9-]{3,50}$/;
export const BARCODE_PATTERN = /^[A-Z0-9-]{4,48}$/;
export const HSN_PATTERN = /^(\d{4}|\d{6}|\d{8})$/;
export const COUNTRY_MIN = 2;
export const COUNTRY_MAX = 60;

export const UNITS_OF_MEASURE = [
  "piece", "pair", "set", "box", "carton", "packet", "bag", "roll",
  "kg", "g", "litre", "ml", "metre", "feet", "sq_ft",
] as const;
export type UnitOfMeasure = (typeof UNITS_OF_MEASURE)[number];

export const MAX_TAGS = 20;
export const TAG_MIN = 2;
export const TAG_MAX = 30;

export const SHORT_NAME_MAX = 60;
export const HIGHLIGHTS_MAX_ITEMS = 6;
export const HIGHLIGHT_MAX_LENGTH = 40;
export const KEY_FEATURES_MAX_ITEMS = 15;
export const KEY_FEATURE_MAX_LENGTH = 200;
export const WHATS_INCLUDED_MAX_ITEMS = 20;
export const WHATS_INCLUDED_MAX_LENGTH = 100;
export const TEXT_BLOCK_MAX = 5000;
export const DESCRIPTION_MAX = 20000;

export const SPECS_MAX_ROWS = 50;
export const SPEC_NAME_MAX = 60;
export const SPEC_VALUE_MAX = 200;
export const SPEC_UNIT_MAX = 20;
export const SPEC_GROUP_MAX = 40;

export const WARRANTY_MONTHS_MIN = 1;
export const WARRANTY_MONTHS_MAX = 600;
export const WARRANTY_PROVIDERS = ["manufacturer", "seller"] as const;
export type WarrantyProvider = (typeof WARRANTY_PROVIDERS)[number];
export const WARRANTY_TYPE_MAX = 50;
export const WARRANTY_CONDITIONS_MAX = 2000;

export const MAX_IMAGES = 8;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MIN_IMAGE_SIDE = 300;
export const MAX_IMAGE_PIXELS = 50_000_000;
export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
export const IMAGE_ALT_MAX = 150;
export const IMAGE_TYPES = [
  "main", "front", "back", "side", "top", "bottom",
  "packaging", "installation", "dimension", "lifestyle", "specification",
] as const;
export type ImageType = (typeof IMAGE_TYPES)[number];

export const BRAND_NAME_MIN = 2;
export const BRAND_NAME_MAX = 80;

/** 8, 12, 13 or 14 digits with a valid GS1 mod-10 check digit. */
export function isValidGtin(value: string): boolean {
  if (!/^\d+$/.test(value) || ![8, 12, 13, 14].includes(value.length)) return false;
  const digits = value.split("").map(Number);
  const check = digits.pop() as number;
  const total = digits
    .reverse()
    .reduce((sum, d, i) => sum + d * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (total % 10)) % 10 === check;
}

/**
 * Checks min / max / step. Returns the first problem as a message,
 * or null when the three values are consistent. Blank values use the defaults.
 */
export function checkQuantityRules(
  min?: number | null,
  max?: number | null,
  step?: number | null
): string | null {
  const minQty = min ?? 1;
  const stepQty = step ?? 1;
  if (!Number.isInteger(minQty) || minQty < 1) return "Minimum order quantity must be at least 1";
  if (!Number.isInteger(stepQty) || stepQty < 1) return "Order quantity step must be at least 1";
  if (max !== null && max !== undefined && max < minQty) {
    return "Maximum order quantity cannot be less than the minimum";
  }
  if (minQty % stepQty !== 0) {
    return "Minimum order quantity must be a multiple of the order quantity step";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Prices (C3): mirrors product_rules.price_problems on the server
// ---------------------------------------------------------------------------

export const PRICE_REASON_MIN = 3;
export const PRICE_REASON_MAX = 500;

/** Fields whose change on an existing product or variant needs a price_change_reason. */
export const PRICE_CHANGE_FIELDS = [
  "price",
  "original_price",
  "min_selling_price",
  "b2b_price",
  "cost_price",
  "cost_gst_rate",
  "gst_rate",
] as const;

/** "₹1,234.50", the way the server writes amounts in its messages. */
const serverRupees = (value: number) =>
  `₹${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export interface PriceProblem {
  field: "price" | "min_selling_price";
  message: string;
}

/**
 * Selling price / MRP / minimum price rules, in the server's order:
 * price > MRP, minimum > MRP, price < minimum. A missing value skips the
 * rules that need it.
 */
export const priceProblems = (
  price: number | null,
  mrp: number | null,
  min: number | null
): PriceProblem[] => {
  const problems: PriceProblem[] = [];
  if (price !== null && mrp !== null && price > mrp) {
    problems.push({ field: "price", message: "Selling price can't be more than the MRP" });
  }
  if (min !== null && mrp !== null && min > mrp) {
    problems.push({ field: "min_selling_price", message: "Minimum price can't be more than the MRP" });
  }
  if (price !== null && min !== null && price < min) {
    problems.push({ field: "price", message: `Selling price can't be below the minimum price (${serverRupees(min)})` });
  }
  return problems;
};

/**
 * B2B price rules, as on the server: more than 0, and not more than the MRP.
 * A blank B2B price (null) is fine; a missing MRP skips the MRP rule.
 */
export const B2B_PRICE_MESSAGE = "B2B price must be more than 0";

export const b2bPriceProblem = (b2b: number | null, mrp: number | null): string | null => {
  if (b2b === null) return null;
  if (b2b <= 0) return B2B_PRICE_MESSAGE;
  if (mrp !== null && b2b > mrp) return "B2B price can't be more than the MRP";
  return null;
};
