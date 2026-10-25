import { MEASURES, type MeasureKey, num, numText, toText } from "@/utils/productFormat";
import { MAX_TAGS, TAG_MAX, TAG_MIN } from "@/utils/productRules";
import type { Product, UpdateProductRequest, WritableProductStatus } from "@/services/product.service";

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

export type TabKey = "basics" | "pricing" | "identity" | "content" | "specs" | "limits";
/** Tab order, used to point at the first tab with an error. */
export const TAB_ORDER: TabKey[] = ["basics", "pricing", "identity", "content", "specs", "limits"];

export interface SpecRow {
  group_name: string;
  name: string;
  value: string;
  unit: string;
}

export const TEXT_BLOCKS = [
  { key: "benefits", label: "Benefits" },
  { key: "usage_info", label: "Usage" },
  { key: "care_info", label: "Care" },
  { key: "installation_info", label: "Installation" },
  { key: "usage_instructions", label: "Usage instructions" },
] as const;
export type TextBlockKey = (typeof TEXT_BLOCKS)[number]["key"];

export type FormState = {
  // Basics
  name: string;
  short_name: string;
  sku: string;
  category_id: string;
  brand_id: string | null;
  status: WritableProductStatus;
  is_featured: boolean;
  // Pricing & stock (default variant)
  price: string;
  /** MRP */
  original_price: string;
  min_selling_price: string;
  /** Only sent for admins with products.view_cost */
  cost_price: string;
  /** Purchase GST rate; "" = same as the product. Only sent for admins with products.view_cost */
  cost_gst_rate: string;
  /** B2B price; edit only */
  b2b_price: string;
  /** Product level; "" on create = the server picks the HSN rate or the store default */
  gst_rate: string;
  stock_quantity: string;
  low_stock_threshold: string;
  barcode: string;
  gtin: string;
  pack_size: string;
  // Identity
  model_number: string;
  mpn: string;
  manufacturer: string;
  country_of_origin: string;
  hsn_code: string;
  unit_of_measure: string;
  tags: string[];
  /** A tag typed but not yet committed with Enter / comma / blur; committed on Save. */
  tag_draft: string;
  // Content
  short_description: string;
  description: string;
  highlights: string[];
  key_features: string[];
  whats_included: string[];
  warranty_available: boolean;
  warranty_months: string;
  warranty_provider: string;
  warranty_type: string;
  warranty_conditions: string;
  // Specifications
  specifications: SpecRow[];
  // Purchase limits
  min_order_qty: string;
  max_order_qty: string;
  order_qty_step: string;
} & Record<TextBlockKey, string> &
  Record<MeasureKey, string>;

export const defaultVariantOf = (product?: Product) =>
  product?.default_variant_id
    ? product.variants?.find((v) => v.id === product.default_variant_id)
    : undefined;

export const toFormState = (product?: Product): FormState => {
  const variant = defaultVariantOf(product);
  return {
    name: product?.name ?? "",
    short_name: product?.short_name ?? "",
    sku: product?.sku ?? "",
    category_id: product?.category_id ?? "",
    brand_id: product?.brand_id ?? null,
    status: product && product.status !== "archived" ? product.status : "draft",
    is_featured: product?.is_featured ?? false,
    price: numText(variant?.price),
    original_price: numText(variant?.original_price),
    min_selling_price: numText(variant?.min_selling_price),
    cost_price: numText(variant?.cost_price),
    cost_gst_rate: variant?.cost_gst_rate == null ? "" : String(Number(variant.cost_gst_rate)),
    b2b_price: numText(variant?.b2b_price),
    // String(Number()) so "18.00" and 18 match the rate list's values.
    gst_rate: product?.gst_rate == null ? "" : String(Number(product.gst_rate)),
    stock_quantity: numText(variant?.stock_quantity ?? product?.stock_quantity),
    low_stock_threshold: numText(product?.low_stock_threshold ?? 10),
    barcode: variant?.barcode ?? "",
    gtin: variant?.gtin ?? "",
    pack_size: numText(variant?.pack_size ?? 1),
    weight_g: numText(variant?.weight_g),
    package_length_mm: numText(variant?.package_length_mm),
    package_width_mm: numText(variant?.package_width_mm),
    package_height_mm: numText(variant?.package_height_mm),
    package_weight_g: numText(variant?.package_weight_g),
    model_number: product?.model_number ?? "",
    mpn: product?.mpn ?? "",
    manufacturer: product?.manufacturer ?? "",
    country_of_origin: product?.country_of_origin ?? "",
    hsn_code: product?.hsn_code ?? "",
    unit_of_measure: product?.unit_of_measure ?? "piece",
    tags: product?.tags ?? [],
    tag_draft: "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    highlights: product?.highlights ?? [],
    key_features: product?.key_features ?? [],
    whats_included: product?.whats_included ?? [],
    benefits: product?.benefits ?? "",
    usage_info: product?.usage_info ?? "",
    care_info: product?.care_info ?? "",
    installation_info: product?.installation_info ?? "",
    usage_instructions: product?.usage_instructions ?? "",
    warranty_available: product?.warranty_available ?? false,
    warranty_months: numText(product?.warranty_months),
    warranty_provider: product?.warranty_provider ?? "",
    warranty_type: product?.warranty_type ?? "",
    warranty_conditions: product?.warranty_conditions ?? "",
    specifications: (product?.specifications ?? []).map((s) => ({
      group_name: s.group_name ?? "",
      name: s.name ?? "",
      value: s.value ?? "",
      unit: s.unit ?? "",
    })),
    min_order_qty: numText(product?.min_order_qty ?? 1),
    max_order_qty: numText(product?.max_order_qty),
    order_qty_step: numText(product?.order_qty_step ?? 1),
  };
};

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export const normaliseTag = (raw: string) => raw.trim().toLowerCase().replace(/\s+/g, " ");

/** Why `tag` (already normalised) can't be added to `tags`, or null when it can. */
export const tagProblem = (tags: string[], tag: string): string | null => {
  if (tag.length < TAG_MIN || tag.length > TAG_MAX) return `Each tag must be ${TAG_MIN}-${TAG_MAX} characters`;
  if (!tags.includes(tag) && tags.length >= MAX_TAGS) return `At most ${MAX_TAGS} tags`;
  return null;
};

/** The tags with a valid typed draft included (an invalid one is caught by validate). */
export const tagsWithDraft = (state: FormState): string[] => {
  const tag = normaliseTag(state.tag_draft);
  if (!tag || state.tags.includes(tag) || tagProblem(state.tags, tag)) return state.tags;
  return [...state.tags, tag];
};

// ---------------------------------------------------------------------------
// Pricing fields (the default variant)
// ---------------------------------------------------------------------------

/** Fields that live on the default variant; reset when the product gains or loses options. */
export const PRICING_KEYS = [
  "price",
  "original_price",
  "min_selling_price",
  "cost_price",
  "cost_gst_rate",
  "b2b_price",
  "stock_quantity",
  "barcode",
  "gtin",
  "pack_size",
  ...MEASURES.map((m) => m.key),
] as const satisfies readonly (keyof FormState)[];

/**
 * After the server moved the product on (e.g. options added or all removed):
 * pricing fields always take the fresh value; any other field follows the server
 * while still untouched (equal to the old saved value), and keeps the admin's edit otherwise.
 * Example: removing every option can change the product SKU.
 */
export const followServer = (state: FormState, oldSaved: FormState, fresh: FormState): FormState => {
  const pricing: readonly string[] = PRICING_KEYS;
  const next = { ...state } as Record<keyof FormState, unknown>;
  for (const key of Object.keys(fresh) as (keyof FormState)[]) {
    if (pricing.includes(key) || sameValue(state[key], oldSaved[key])) next[key] = fresh[key];
  }
  return next as FormState;
};

const list = (items: string[]): string[] => items.map((i) => i.trim()).filter(Boolean);

/**
 * Full payload for the form. `pricing` adds the default-variant fields
 * (simple products only). Stock is never part of it: it is added on create only.
 * `withCost`: only admins with products.view_cost may send cost_price at all
 * (the key alone, even null, is refused with 403 otherwise); the same goes for cost_gst_rate.
 */
export const toPayload = (
  state: FormState,
  pricing: boolean,
  withCost: boolean,
  /** B2B price is edit only (not sent on product create) */
  withB2b = false
): UpdateProductRequest => {
  const warrantyOn = state.warranty_available;
  const payload: UpdateProductRequest = {
    name: state.name.trim(),
    short_name: toText(state.short_name),
    category_id: state.category_id,
    brand_id: state.brand_id,
    status: state.status,
    is_featured: state.is_featured,
    low_stock_threshold: num(state.low_stock_threshold) ?? 10,
    model_number: toText(state.model_number),
    mpn: toText(state.mpn),
    manufacturer: toText(state.manufacturer),
    country_of_origin: toText(state.country_of_origin),
    hsn_code: toText(state.hsn_code),
    unit_of_measure: state.unit_of_measure,
    tags: tagsWithDraft(state),
    short_description: state.short_description.trim(),
    description: state.description.trim(),
    highlights: list(state.highlights),
    key_features: list(state.key_features),
    whats_included: list(state.whats_included),
    benefits: toText(state.benefits),
    usage_info: toText(state.usage_info),
    care_info: toText(state.care_info),
    installation_info: toText(state.installation_info),
    usage_instructions: toText(state.usage_instructions),
    warranty_available: warrantyOn,
    warranty_months: warrantyOn ? num(state.warranty_months) : null,
    warranty_provider: warrantyOn ? toText(state.warranty_provider) : null,
    warranty_type: warrantyOn ? toText(state.warranty_type) : null,
    warranty_conditions: warrantyOn ? toText(state.warranty_conditions) : null,
    specifications: state.specifications
      .filter((s) => s.name.trim() || s.value.trim())
      .map((s, i) => ({
        group_name: toText(s.group_name),
        name: s.name.trim(),
        value: s.value.trim(),
        unit: toText(s.unit),
        display_order: i,
      })),
    // Blank min / step mean the default 1; a partial update must never send null for them.
    min_order_qty: num(state.min_order_qty) ?? 1,
    max_order_qty: num(state.max_order_qty),
    order_qty_step: num(state.order_qty_step) ?? 1,
  };
  if (state.sku.trim()) payload.sku = state.sku.trim().toUpperCase();
  // Blank only on create: the server then takes the HSN rate or the store default.
  const gstRate = num(state.gst_rate);
  if (gstRate !== null) payload.gst_rate = gstRate;
  if (pricing) {
    // null on edit reaches the server as "Price is required"; create drops it (draft, price 0).
    payload.price = num(state.price) as number;
    payload.original_price = num(state.original_price);
    payload.min_selling_price = num(state.min_selling_price);
    if (withCost) {
      payload.cost_price = num(state.cost_price);
      payload.cost_gst_rate = num(state.cost_gst_rate);
    }
    if (withB2b) payload.b2b_price = num(state.b2b_price);
    payload.barcode = toText(state.barcode);
    payload.gtin = toText(state.gtin);
    // pack_size may never be null
    payload.pack_size = num(state.pack_size) ?? 1;
    for (const m of MEASURES) payload[m.key] = num(state[m.key]);
  }
  return payload;
};

export const sameValue = (a: unknown, b: unknown): boolean =>
  typeof a === "object" || typeof b === "object" ? JSON.stringify(a) === JSON.stringify(b) : a === b;

/** Sets one form field. */
export type SetField = <K extends keyof FormState>(key: K, value: FormState[K]) => void;
