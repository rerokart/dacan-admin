import { formatCurrency } from "@/utils/helpers/helperfn";
// Small helpers shared by the product form and the variant modal.

export const MEASURES = [
  { key: "weight_g", label: "Weight (g)" },
  { key: "package_length_mm", label: "Package length (mm)" },
  { key: "package_width_mm", label: "Package width (mm)" },
  { key: "package_height_mm", label: "Package height (mm)" },
  { key: "package_weight_g", label: "Package weight (g)" },
] as const;
export type MeasureKey = (typeof MEASURES)[number]["key"];

/** A number as input text; null / undefined become an empty field. */
export const numText = (value?: number | null): string =>
  value === null || value === undefined ? "" : String(value);

/** Input text as a number; an empty field becomes null. */
export const num = (value: string): number | null => (value.trim() === "" ? null : Number(value));

/** Trimmed text, or null when empty. */
export const toText = (value: string): string | null => value.trim() || null;

/** "₹1,23,456.50", "₹500"; a negative amount reads "-₹12.50". */
export const rupees = (value: number): string =>
  `${value < 0 ? "-" : ""}${formatCurrency(Math.abs(value))}`;

/** "18%", "0.25%" */
export const percent = (value: number): string => `${Number(value)}%`;
