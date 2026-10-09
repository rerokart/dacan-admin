import { MEASURES, type MeasureKey, num, numText, toText } from "@/utils/productFormat";
import type { Product, UpdateProductRequest, WritableProductStatus } from "@/services/product.service";

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

export type TabKey = "basics" | "pricing" | "identity" | "content" | "specs" | "limits";

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
  original_price: string;
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

const list = (items: string[]): string[] => items.map((i) => i.trim()).filter(Boolean);

/**
 * Full payload for the form. `pricing` adds the default-variant fields
 * (simple products only). Stock is never part of it: it is added on create only.
 */
export const toPayload = (state: FormState, pricing: boolean): UpdateProductRequest => {
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
    tags: state.tags,
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
  if (pricing) {
    // null on edit reaches the server as "Price is required"; create drops it (draft, price 0).
    payload.price = num(state.price) as number;
    payload.original_price = num(state.original_price);
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
