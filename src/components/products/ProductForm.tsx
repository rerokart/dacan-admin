"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";
import Select from "@/components/form/Select";
import BrandPicker from "@/components/brands/BrandPicker";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { flattenCategoryOptions } from "@/utils/categoryOptions";
import {
  BARCODE_PATTERN,
  COUNTRY_MAX,
  COUNTRY_MIN,
  HIGHLIGHTS_MAX_ITEMS,
  HIGHLIGHT_MAX_LENGTH,
  HSN_PATTERN,
  KEY_FEATURES_MAX_ITEMS,
  KEY_FEATURE_MAX_LENGTH,
  MAX_TAGS,
  SHORT_NAME_MAX,
  SKU_PATTERN,
  SPECS_MAX_ROWS,
  SPEC_GROUP_MAX,
  SPEC_NAME_MAX,
  SPEC_UNIT_MAX,
  SPEC_VALUE_MAX,
  TAG_MAX,
  TAG_MIN,
  TEXT_BLOCK_MAX,
  UNITS_OF_MEASURE,
  WARRANTY_CONDITIONS_MAX,
  WARRANTY_MONTHS_MAX,
  WARRANTY_MONTHS_MIN,
  WARRANTY_PROVIDERS,
  WARRANTY_TYPE_MAX,
  WHATS_INCLUDED_MAX_ITEMS,
  WHATS_INCLUDED_MAX_LENGTH,
  checkQuantityRules,
  isValidGtin,
} from "@/utils/productRules";
import type {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
  WritableProductStatus,
} from "@/services/product.service";

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

type TabKey = "basics" | "pricing" | "identity" | "content" | "specs" | "limits";

interface SpecRow {
  group_name: string;
  name: string;
  value: string;
  unit: string;
}

const TEXT_BLOCKS = [
  { key: "benefits", label: "Benefits" },
  { key: "usage_info", label: "Usage" },
  { key: "care_info", label: "Care" },
  { key: "installation_info", label: "Installation" },
  { key: "usage_instructions", label: "Usage instructions" },
] as const;
type TextBlockKey = (typeof TEXT_BLOCKS)[number]["key"];

const MEASURES = [
  { key: "weight_g", label: "Weight (g)" },
  { key: "package_length_mm", label: "Package length (mm)" },
  { key: "package_width_mm", label: "Package width (mm)" },
  { key: "package_height_mm", label: "Package height (mm)" },
  { key: "package_weight_g", label: "Package weight (g)" },
] as const;
type MeasureKey = (typeof MEASURES)[number]["key"];

type FormState = {
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

const numText = (value: number | null | undefined): string =>
  value === null || value === undefined ? "" : String(value);

const defaultVariantOf = (product?: Product) =>
  product?.default_variant_id
    ? product.variants?.find((v) => v.id === product.default_variant_id)
    : undefined;

const toFormState = (product?: Product): FormState => {
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

const text = (value: string): string | null => value.trim() || null;
const num = (value: string): number | null => (value.trim() === "" ? null : Number(value));
const list = (items: string[]): string[] => items.map((i) => i.trim()).filter(Boolean);

/**
 * Full payload for the form. `pricing` adds the default-variant fields
 * (simple products only). Stock is never part of it: it is added on create only.
 */
const toPayload = (state: FormState, pricing: boolean): UpdateProductRequest => {
  const warrantyOn = state.warranty_available;
  const payload: UpdateProductRequest = {
    name: state.name.trim(),
    short_name: text(state.short_name),
    category_id: state.category_id,
    brand_id: state.brand_id,
    status: state.status,
    is_featured: state.is_featured,
    low_stock_threshold: num(state.low_stock_threshold) ?? 10,
    model_number: text(state.model_number),
    mpn: text(state.mpn),
    manufacturer: text(state.manufacturer),
    country_of_origin: text(state.country_of_origin),
    hsn_code: text(state.hsn_code),
    unit_of_measure: state.unit_of_measure,
    tags: state.tags,
    short_description: state.short_description.trim(),
    description: state.description.trim(),
    highlights: list(state.highlights),
    key_features: list(state.key_features),
    whats_included: list(state.whats_included),
    benefits: text(state.benefits),
    usage_info: text(state.usage_info),
    care_info: text(state.care_info),
    installation_info: text(state.installation_info),
    usage_instructions: text(state.usage_instructions),
    warranty_available: warrantyOn,
    warranty_months: warrantyOn ? num(state.warranty_months) : null,
    warranty_provider: warrantyOn ? text(state.warranty_provider) : null,
    warranty_type: warrantyOn ? text(state.warranty_type) : null,
    warranty_conditions: warrantyOn ? text(state.warranty_conditions) : null,
    specifications: state.specifications
      .filter((s) => s.name.trim() || s.value.trim())
      .map((s, i) => ({
        group_name: text(s.group_name),
        name: s.name.trim(),
        value: s.value.trim(),
        unit: text(s.unit),
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
    payload.barcode = text(state.barcode);
    payload.gtin = text(state.gtin);
    // pack_size may never be null
    payload.pack_size = num(state.pack_size) ?? 1;
    for (const m of MEASURES) payload[m.key] = num(state[m.key]);
  }
  return payload;
};

const sameValue = (a: unknown, b: unknown): boolean =>
  typeof a === "object" || typeof b === "object" ? JSON.stringify(a) === JSON.stringify(b) : a === b;

// ---------------------------------------------------------------------------
// Client checks (the server re-checks everything)
// ---------------------------------------------------------------------------

type FieldErrors = Partial<Record<string, { tab: TabKey; message: string }>>;

const isWholeNumber = (value: string, min: number) =>
  value.trim() === "" || (Number.isInteger(Number(value)) && Number(value) >= min);

const validate = (state: FormState, pricing: boolean): FieldErrors => {
  const errors: FieldErrors = {};
  const add = (field: string, tab: TabKey, message: string) => {
    if (!errors[field]) errors[field] = { tab, message };
  };

  if (!state.name.trim()) add("name", "basics", "Name is required");
  if (!state.category_id) add("category_id", "basics", "Choose a category");
  if (state.sku.trim() && !SKU_PATTERN.test(state.sku.trim().toUpperCase())) {
    add("sku", "basics", "3-50 characters: A-Z, 0-9 and hyphens");
  }

  if (pricing) {
    for (const key of ["price", "original_price"] as const) {
      const v = state[key];
      if (v.trim() !== "" && (Number.isNaN(Number(v)) || Number(v) < 0)) {
        add(key, "pricing", "Enter a price of 0 or more");
      }
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

// ---------------------------------------------------------------------------
// Small field editors
// ---------------------------------------------------------------------------

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";
const smallButton =
  "rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800";
const addButton =
  "mt-2 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 ring-1 ring-inset ring-brand-200 hover:bg-brand-50 disabled:opacity-40 dark:text-brand-400 dark:ring-brand-800 dark:hover:bg-brand-900/20";

function FieldError({ error }: { error?: { message: string } }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-error-500">{error.message}</p>;
}

function TextBlock({
  id,
  label,
  value,
  max,
  rows = 4,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  max: number;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      />
      <p className="mt-1 text-right text-xs text-gray-400">
        {value.length}/{max}
      </p>
    </div>
  );
}

function ListEditor({
  id,
  label,
  hint,
  items,
  maxItems,
  maxLength,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  items: string[];
  maxItems: number;
  maxLength: number;
  placeholder: string;
  onChange: (items: string[]) => void;
}) {
  const update = (index: number, value: string) =>
    onChange(items.map((item, i) => (i === index ? value : item)));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label htmlFor={`${id}-0`}>{label}</Label>
        <span className="text-xs text-gray-400">
          {items.length}/{maxItems}
        </span>
      </div>
      {hint && <p className="mb-2 text-xs text-gray-500">{hint}</p>}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id={`${id}-${index}`}
                type="text"
                value={item}
                maxLength={maxLength}
                placeholder={placeholder}
                onChange={(e) => update(index, e.target.value)}
                className={`${inputClass} pr-16`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {item.length}/{maxLength}
              </span>
            </div>
            <button
              type="button"
              aria-label={`Remove ${label} ${index + 1}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className={smallButton}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={items.length >= maxItems}
        onClick={() => onChange([...items, ""])}
        className={addButton}
      >
        + Add
      </button>
    </div>
  );
}

const normaliseTag = (raw: string) => raw.trim().toLowerCase().replace(/\s+/g, " ");

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const commit = () => {
    const tag = normaliseTag(draft);
    if (!tag) return;
    if (tag.length < TAG_MIN || tag.length > TAG_MAX) {
      setError(`Each tag must be ${TAG_MIN}-${TAG_MAX} characters`);
      return;
    }
    if (tags.length >= MAX_TAGS) {
      setError(`At most ${MAX_TAGS} tags`);
      return;
    }
    if (!tags.includes(tag)) onChange([...tags, tag]);
    setDraft("");
    setError(null);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label htmlFor="tags">Tags</Label>
        <span className="text-xs text-gray-400">
          {tags.length}/{MAX_TAGS}
        </span>
      </div>
      {tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove tag ${tag}`}
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        id="tags"
        type="text"
        value={draft}
        maxLength={TAG_MAX + 10}
        disabled={tags.length >= MAX_TAGS}
        placeholder="Type a tag and press Enter"
        onChange={(e) => {
          setDraft(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        className={inputClass}
      />
      <p className={`mt-1 text-xs ${error ? "text-error-500" : "text-gray-500"}`}>
        {error ?? "Saved in lowercase. Used for search."}
      </p>
    </div>
  );
}

function SpecsEditor({
  rows,
  errors,
  onChange,
}: {
  rows: SpecRow[];
  errors: FieldErrors;
  onChange: (rows: SpecRow[]) => void;
}) {
  const update = (index: number, key: keyof SpecRow, value: string) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const columns: { key: keyof SpecRow; label: string; max: number; placeholder: string }[] = [
    { key: "group_name", label: "Group", max: SPEC_GROUP_MAX, placeholder: "Dimensions" },
    { key: "name", label: "Name", max: SPEC_NAME_MAX, placeholder: "Length" },
    { key: "value", label: "Value", max: SPEC_VALUE_MAX, placeholder: "120" },
    { key: "unit", label: "Unit", max: SPEC_UNIT_MAX, placeholder: "mm" },
  ];

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-sm text-gray-500">
          Free rows shown as a table on the product page. Rows with the same group are shown together.
        </p>
        <span className="text-xs text-gray-400">
          {rows.length}/{SPECS_MAX_ROWS}
        </span>
      </div>
      {rows.length > 0 && (
        <div className="space-y-2">
          <div className="hidden grid-cols-[1fr_1fr_1.5fr_0.6fr_auto] gap-2 text-xs font-medium text-gray-500 lg:grid">
            {columns.map((c) => (
              <span key={c.key}>{c.label}</span>
            ))}
            <span className="w-36" />
          </div>
          {rows.map((row, index) => (
            <div key={index}>
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1fr_1.5fr_0.6fr_auto]">
                {columns.map((c) => (
                  <input
                    key={c.key}
                    type="text"
                    aria-label={`${c.label} ${index + 1}`}
                    value={row[c.key]}
                    maxLength={c.max}
                    placeholder={c.placeholder}
                    onChange={(e) => update(index, c.key, e.target.value)}
                    className={inputClass}
                  />
                ))}
                <div className="flex w-36 items-center gap-1">
                  <button type="button" className={smallButton} disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up">
                    ↑
                  </button>
                  <button
                    type="button"
                    className={smallButton}
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button type="button" className={smallButton} onClick={() => onChange(rows.filter((_, i) => i !== index))}>
                    Remove
                  </button>
                </div>
              </div>
              <FieldError error={errors[`spec-${index}`]} />
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        disabled={rows.length >= SPECS_MAX_ROWS}
        onClick={() => onChange([...rows, { group_name: rows[rows.length - 1]?.group_name ?? "", name: "", value: "", unit: "" }])}
        className={addButton}
      >
        + Add specification
      </button>
    </div>
  );
}

function Notice({ tone, title, items }: { tone: "error" | "warning"; title: string; items: string[] }) {
  const styles =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
      : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300";
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`} role={tone === "error" ? "alert" : "status"}>
      <p className="font-medium">{title}</p>
      <ul className="mt-1 list-disc pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft (being prepared)" },
  { value: "active", label: "Active (visible to customers)" },
  { value: "inactive", label: "Inactive (temporarily hidden)" },
];
const UNIT_OPTIONS = UNITS_OF_MEASURE.map((u) => ({ value: u, label: u.replace("_", " ") }));
const PROVIDER_OPTIONS = [
  { value: "", label: "Not set" },
  ...WARRANTY_PROVIDERS.map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) })),
];

interface ProductFormProps {
  mode: "create" | "edit";
  initial?: Product;
  /** Called with the saved product (create / update response) */
  onDone: (product: Product) => void;
}

export default function ProductForm({ mode, initial, onDone }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  // The saved product the edit diff is measured against; moves on after each save.
  const [baseline, setBaseline] = useState<Product | undefined>(initial);
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [tab, setTab] = useState<TabKey>("basics");
  const [showErrors, setShowErrors] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const isCreate = mode === "create";
  const isArchived = baseline?.status === "archived";
  // Price / stock / identifiers live on the default variant: only simple products have one.
  const hasPricing = isCreate || !!baseline?.default_variant_id;
  const skuLocked = !isCreate && !!defaultVariantOf(baseline)?.sku_locked;
  const categoryOptions = useMemo(() => flattenCategoryOptions(categories), [categories]);

  const errors = useMemo(() => validate(form, hasPricing), [form, hasPricing]);
  const shownErrors: FieldErrors = showErrors ? errors : {};
  const errorsByTab = useMemo(() => {
    const tabs = new Set<TabKey>();
    Object.values(errors).forEach((e) => e && tabs.add(e.tab));
    return tabs;
  }, [errors]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleError = (error: Error & { problems?: string[] }) => {
    // The hook already toasts the message.
    setProblems(error.problems ?? []);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowErrors(true);
    setProblems([]);
    setWarnings([]);

    const first = Object.values(errors).find(Boolean);
    if (first) {
      setTab(first.tab);
      toast.error(first.message);
      return;
    }

    const payload = toPayload(form, hasPricing);

    if (isCreate) {
      const data: CreateProductRequest = { ...payload, name: payload.name ?? "", category_id: form.category_id };
      if (data.price === null) delete data.price;
      const stock = num(form.stock_quantity);
      if (stock) data.stock_quantity = stock;
      createProduct(data, {
        onSuccess: (product) => {
          (product.warnings ?? []).forEach((w) => toast.warning(w));
          onDone(product);
        },
        onError: handleError,
      });
      return;
    }

    // Edit: send only what changed (an untouched field is never re-validated,
    // and stock is never sent: it changes from Inventory).
    const before = toPayload(toFormState(baseline), hasPricing);
    const changed = Object.fromEntries(
      Object.entries(payload).filter(
        ([key, value]) => !sameValue(value, before[key as keyof UpdateProductRequest])
      )
    ) as UpdateProductRequest;
    if (isArchived) delete changed.status;
    if (Object.keys(changed).length === 0) {
      toast.info("No changes to save");
      return;
    }
    updateProduct(
      { id: baseline!.id, data: changed },
      {
        onSuccess: (product) => {
          setBaseline(product);
          setForm(toFormState(product));
          setShowErrors(false);
          setWarnings(product.warnings ?? []);
          onDone(product);
        },
        onError: handleError,
      }
    );
  };

  const isBusy = isCreating || isUpdating;
  const defaultVariant = defaultVariantOf(baseline);
  const tabLabel = (key: TabKey, label: string) => (
    <span className="flex items-center gap-1.5">
      {label}
      {showErrors && errorsByTab.has(key) && <span className="h-1.5 w-1.5 rounded-full bg-error-500" aria-label="has errors" />}
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {isArchived && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
          This product is archived. Restore it from the product list to change its status.
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <TabList className="overflow-x-auto">
          <Tab value="basics">{tabLabel("basics", "Basics")}</Tab>
          <Tab value="pricing">{tabLabel("pricing", "Pricing & stock")}</Tab>
          <Tab value="identity">{tabLabel("identity", "Identity")}</Tab>
          <Tab value="content">{tabLabel("content", "Content")}</Tab>
          <Tab value="specs">{tabLabel("specs", "Specifications")}</Tab>
          <Tab value="limits">{tabLabel("limits", "Purchase limits")}</Tab>
        </TabList>

        {/* Basics */}
        <TabPanel value="basics" className="pt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={form.name}
                error={!!shownErrors.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Enter product name"
              />
              <FieldError error={shownErrors.name} />
            </div>

            <div>
              <Label htmlFor="short_name">Short Name</Label>
              <Input
                id="short_name"
                value={form.short_name}
                maxLength={SHORT_NAME_MAX}
                onChange={(e) => set("short_name", e.target.value)}
                placeholder="Shown where space is tight"
              />
              <p className="mt-1 text-right text-xs text-gray-400">
                {form.short_name.length}/{SHORT_NAME_MAX}
              </p>
            </div>

            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={form.sku}
                disabled={skuLocked}
                error={!!shownErrors.sku}
                onChange={(e) => set("sku", e.target.value.toUpperCase())}
                placeholder={isCreate ? "Leave empty for PRD-000123" : ""}
              />
              <p className={`mt-1 text-xs ${shownErrors.sku ? "text-error-500" : "text-gray-500"}`}>
                {shownErrors.sku?.message ??
                  (skuLocked
                    ? "Used by orders or stock history, so it can't be changed"
                    : isCreate
                      ? "Leave empty to generate one"
                      : "A-Z, 0-9 and hyphens")}
              </p>
            </div>

            {!isCreate && (
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={baseline?.slug ?? ""} disabled />
              </div>
            )}

            <div>
              <Label htmlFor="category">Category *</Label>
              {loadingCategories ? (
                <div className="flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <span className="text-sm text-gray-500">Loading categories...</span>
                </div>
              ) : (
                <Select
                  options={categoryOptions}
                  placeholder="Select Category"
                  value={form.category_id}
                  onChange={(val) => set("category_id", val)}
                />
              )}
              <FieldError error={shownErrors.category_id} />
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <BrandPicker
                value={form.brand_id}
                onChange={(id) => set("brand_id", id)}
                currentBrand={baseline?.brand ? { id: baseline.brand.id, name: baseline.brand.name } : null}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              {isArchived ? (
                <Input id="status" value="Archived" disabled />
              ) : (
                <Select
                  options={STATUS_OPTIONS}
                  value={form.status}
                  onChange={(val) => set("status", val as WritableProductStatus)}
                />
              )}
              <p className="mt-1 text-xs text-gray-500">
                Active needs a category, a price above 0 and a short description.
              </p>
            </div>

            <div className="flex items-center pt-6">
              <Checkbox
                id="is_featured"
                label="Featured product"
                checked={form.is_featured}
                onChange={(v) => set("is_featured", v)}
              />
            </div>
          </div>
        </TabPanel>

        {/* Pricing & stock */}
        <TabPanel value="pricing" className="pt-6">
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
                    error={!!shownErrors.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0.00"
                  />
                  <FieldError error={shownErrors.price} />
                </div>
                <div>
                  <Label htmlFor="original_price">Original Price (₹)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.original_price}
                    error={!!shownErrors.original_price}
                    onChange={(e) => set("original_price", e.target.value)}
                    placeholder="Shown struck through for a discount"
                  />
                  <FieldError error={shownErrors.original_price} />
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
                        error={!!shownErrors.stock_quantity}
                        onChange={(e) => set("stock_quantity", e.target.value)}
                        placeholder="0"
                      />
                      <FieldError error={shownErrors.stock_quantity} />
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
                error={!!shownErrors.low_stock_threshold}
                onChange={(e) => set("low_stock_threshold", e.target.value)}
                placeholder="10"
              />
              <FieldError error={shownErrors.low_stock_threshold} />
            </div>
            {hasPricing && (
              <>
                <div>
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={form.barcode}
                    error={!!shownErrors.barcode}
                    onChange={(e) => set("barcode", e.target.value.toUpperCase())}
                    placeholder="Store barcode"
                  />
                  <FieldError error={shownErrors.barcode} />
                </div>
                <div>
                  <Label htmlFor="gtin">GTIN / EAN / UPC</Label>
                  <Input
                    id="gtin"
                    inputMode="numeric"
                    value={form.gtin}
                    error={!!shownErrors.gtin}
                    onChange={(e) => set("gtin", e.target.value.replace(/\s/g, ""))}
                    placeholder="8, 12, 13 or 14 digits"
                  />
                  <FieldError error={shownErrors.gtin} />
                </div>
                <div>
                  <Label htmlFor="pack_size">Pack Size</Label>
                  <Input
                    id="pack_size"
                    type="number"
                    min="1"
                    value={form.pack_size}
                    error={!!shownErrors.pack_size}
                    onChange={(e) => set("pack_size", e.target.value)}
                    placeholder="1"
                  />
                  <FieldError error={shownErrors.pack_size} />
                </div>
                {MEASURES.map((m) => (
                  <div key={m.key}>
                    <Label htmlFor={m.key}>{m.label}</Label>
                    <Input
                      id={m.key}
                      type="number"
                      min="0"
                      value={form[m.key]}
                      error={!!shownErrors[m.key]}
                      onChange={(e) => set(m.key, e.target.value)}
                    />
                    <FieldError error={shownErrors[m.key]} />
                  </div>
                ))}
              </>
            )}
          </div>
        </TabPanel>

        {/* Identity */}
        <TabPanel value="identity" className="pt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <Label htmlFor="model_number">Model Number</Label>
              <Input id="model_number" value={form.model_number} maxLength={80} onChange={(e) => set("model_number", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="mpn">MPN (manufacturer part number)</Label>
              <Input id="mpn" value={form.mpn} maxLength={80} onChange={(e) => set("mpn", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" value={form.manufacturer} maxLength={120} onChange={(e) => set("manufacturer", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="country_of_origin">Country of Origin</Label>
              <Input
                id="country_of_origin"
                value={form.country_of_origin}
                maxLength={COUNTRY_MAX}
                error={!!shownErrors.country_of_origin}
                onChange={(e) => set("country_of_origin", e.target.value)}
                placeholder="India"
              />
              <FieldError error={shownErrors.country_of_origin} />
            </div>
            <div>
              <Label htmlFor="hsn_code">HSN / SAC Code</Label>
              <Input
                id="hsn_code"
                inputMode="numeric"
                value={form.hsn_code}
                maxLength={8}
                error={!!shownErrors.hsn_code}
                onChange={(e) => set("hsn_code", e.target.value.replace(/\D/g, ""))}
                placeholder="4, 6 or 8 digits"
              />
              <FieldError error={shownErrors.hsn_code} />
            </div>
            <div>
              <Label htmlFor="unit_of_measure">Unit of Measure</Label>
              <Select options={UNIT_OPTIONS} value={form.unit_of_measure} onChange={(val) => set("unit_of_measure", val)} />
            </div>
            <div className="lg:col-span-2">
              <TagInput tags={form.tags} onChange={(tags) => set("tags", tags)} />
            </div>
          </div>
        </TabPanel>

        {/* Content */}
        <TabPanel value="content" className="pt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                value={form.short_description}
                onChange={(e) => set("short_description", e.target.value)}
                placeholder="One line for listings (needed to publish)"
              />
            </div>
            <div className="lg:col-span-2">
              <TextBlock
                id="description"
                label="Full Description"
                value={form.description}
                max={TEXT_BLOCK_MAX}
                rows={6}
                onChange={(v) => set("description", v)}
              />
              <p className="text-xs text-gray-500">Plain text. Lines starting with &quot;- &quot; show as bullets.</p>
            </div>
            <ListEditor
              id="highlights"
              label="Highlights"
              hint="Short phrases shown as chips near the price"
              items={form.highlights}
              maxItems={HIGHLIGHTS_MAX_ITEMS}
              maxLength={HIGHLIGHT_MAX_LENGTH}
              placeholder="e.g. Rust proof"
              onChange={(items) => set("highlights", items)}
            />
            <ListEditor
              id="key_features"
              label="Key Features"
              items={form.key_features}
              maxItems={KEY_FEATURES_MAX_ITEMS}
              maxLength={KEY_FEATURE_MAX_LENGTH}
              placeholder="e.g. Solid brass body"
              onChange={(items) => set("key_features", items)}
            />
            <ListEditor
              id="whats_included"
              label="What's Included"
              items={form.whats_included}
              maxItems={WHATS_INCLUDED_MAX_ITEMS}
              maxLength={WHATS_INCLUDED_MAX_LENGTH}
              placeholder="e.g. 4 screws"
              onChange={(items) => set("whats_included", items)}
            />
            <div />
            {TEXT_BLOCKS.map((b) => (
              <TextBlock
                key={b.key}
                id={b.key}
                label={b.label}
                value={form[b.key]}
                max={TEXT_BLOCK_MAX}
                onChange={(v) => set(b.key, v)}
              />
            ))}

            <div className="rounded-lg border border-gray-200 p-4 lg:col-span-2 dark:border-gray-800">
              <Checkbox
                id="warranty_available"
                label="Warranty available"
                checked={form.warranty_available}
                onChange={(v) => set("warranty_available", v)}
              />
              {form.warranty_available && (
                <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div>
                    <Label htmlFor="warranty_months">Months *</Label>
                    <Input
                      id="warranty_months"
                      type="number"
                      min={String(WARRANTY_MONTHS_MIN)}
                      max={String(WARRANTY_MONTHS_MAX)}
                      value={form.warranty_months}
                      error={!!shownErrors.warranty_months}
                      onChange={(e) => set("warranty_months", e.target.value)}
                      placeholder="12"
                    />
                    <FieldError error={shownErrors.warranty_months} />
                  </div>
                  <div>
                    <Label htmlFor="warranty_provider">Provided by</Label>
                    <Select
                      options={PROVIDER_OPTIONS}
                      value={form.warranty_provider}
                      onChange={(val) => set("warranty_provider", val)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="warranty_type">Type</Label>
                    <Input
                      id="warranty_type"
                      value={form.warranty_type}
                      maxLength={WARRANTY_TYPE_MAX}
                      onChange={(e) => set("warranty_type", e.target.value)}
                      placeholder="e.g. Replacement"
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <TextBlock
                      id="warranty_conditions"
                      label="Conditions"
                      value={form.warranty_conditions}
                      max={WARRANTY_CONDITIONS_MAX}
                      rows={3}
                      onChange={(v) => set("warranty_conditions", v)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabPanel>

        {/* Specifications */}
        <TabPanel value="specs" className="pt-6">
          <SpecsEditor rows={form.specifications} errors={shownErrors} onChange={(rows) => set("specifications", rows)} />
        </TabPanel>

        {/* Purchase limits */}
        <TabPanel value="limits" className="pt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div>
              <Label htmlFor="min_order_qty">Minimum per order</Label>
              <Input
                id="min_order_qty"
                type="number"
                min="1"
                value={form.min_order_qty}
                error={!!errors.quantity}
                onChange={(e) => set("min_order_qty", e.target.value)}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="max_order_qty">Maximum per order</Label>
              <Input
                id="max_order_qty"
                type="number"
                min="1"
                value={form.max_order_qty}
                error={!!errors.quantity}
                onChange={(e) => set("max_order_qty", e.target.value)}
                placeholder="No limit"
              />
            </div>
            <div>
              <Label htmlFor="order_qty_step">Sold in multiples of</Label>
              <Input
                id="order_qty_step"
                type="number"
                min="1"
                value={form.order_qty_step}
                error={!!errors.quantity}
                onChange={(e) => set("order_qty_step", e.target.value)}
                placeholder="1"
              />
            </div>
          </div>
          {/* Inline: shown as soon as the three values disagree */}
          <p className={`mt-2 text-xs ${errors.quantity ? "text-error-500" : "text-gray-500"}`}>
            {errors.quantity?.message ??
              "Applies to the app and website cart and checkout, not to POS. Leave maximum empty for no limit."}
          </p>
        </TabPanel>
      </Tabs>

      {problems.length > 0 && <Notice tone="error" title="Can't publish this product yet" items={problems} />}
      {warnings.length > 0 && <Notice tone="warning" title="Saved, but please check" items={warnings} />}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isBusy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-50"
        >
          {isBusy ? "Saving..." : isCreate ? "Create Product" : "Save Product"}
        </button>
      </div>
    </form>
  );
}
