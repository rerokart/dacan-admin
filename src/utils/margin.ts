// Margin helpers. They mirror the backend (product_rules.margin_fields, ruling P6)
// so the live readout in the product form matches what the server returns.
//
// All maths is done on BigInt integers (paise, and the GST rate in hundredths
// of a percent), never on binary fractions. Inputs are rupee amounts with at
// most 2 decimals and rates with at most 2 decimals; they are converted once
// with Math.round(x * 100), which is exact for such values. Every division
// rounds half away from zero, like Python's ROUND_HALF_UP.
//
// selling price before GST = price / (1 + rate/100) when prices include GST,
// else the price. It is kept unrounded inside the margin formulas.

export interface MarginResult {
  /** Rupees, rounded half-up to paise */
  margin_amount: number | null;
  /** Margin / selling price before GST x 100, 2 decimals */
  margin_percent: number | null;
  /** Margin / cost x 100, 2 decimals */
  markup_percent: number | null;
}

const NO_MARGIN: MarginResult = {
  margin_amount: null,
  margin_percent: null,
  markup_percent: null,
};

type Num = number | string | null | undefined;

/** Hundredths of a unit as an integer, or null when missing / not a number. */
const hundredths = (value: Num): bigint | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return BigInt(Math.round(n * 100));
};

/** n / d rounded half away from zero (d > 0). */
const divRound = (n: bigint, d: bigint): bigint => {
  const neg = n < BigInt(0);
  const abs = neg ? -n : n;
  const q = (abs * BigInt(2) + d) / (d * BigInt(2));
  return neg ? -q : q;
};

const toUnits = (hundredthsValue: bigint): number => Number(hundredthsValue) / 100;

/**
 * Price before GST, rounded half-up to paise. With prices_include_gst false
 * (or no rate) it is the price itself. null when the price is missing.
 */
export function taxablePrice(
  price: Num,
  gstRate: Num,
  pricesIncludeGst: boolean
): number | null {
  const p = hundredths(price);
  if (p === null) return null;
  const r = pricesIncludeGst ? hundredths(gstRate) ?? BigInt(0) : BigInt(0);
  const d = BigInt(10000) + r;
  return toUnits(divRound(p * BigInt(10000), d));
}

/**
 * Margin of one price against its cost. Every value is null when the price or
 * cost is missing; the percentages are null when their divisor is 0.
 */
export function marginFields(
  price: Num,
  cost: Num,
  gstRate: Num,
  pricesIncludeGst: boolean
): MarginResult {
  const p = hundredths(price);
  const c = hundredths(cost);
  if (p === null || c === null) return NO_MARGIN;
  const r = pricesIncludeGst ? hundredths(gstRate) ?? BigInt(0) : BigInt(0);
  const d = BigInt(10000) + r; // 1 + rate/100, scaled by 10000
  const scale = BigInt(10000);

  // selling = p * scale / d (paise); margin = selling - c.
  // n = margin * d / (1 paise), so margin = n / d.
  const n = p * scale - c * d;

  const marginAmount = toUnits(divRound(n, d));
  // margin / selling x 100 = n / (p * scale) x 100: in hundredths of a percent, n / p.
  const marginPercent = p === BigInt(0) ? null : toUnits(divRound(n, p));
  // margin / cost x 100 = n / (d * c) x 100: in hundredths, n * 10000 / (d * c).
  const markupPercent = c === BigInt(0) ? null : toUnits(divRound(n * scale, d * c));

  return {
    margin_amount: marginAmount,
    margin_percent: marginPercent,
    markup_percent: markupPercent,
  };
}

/**
 * GST on a price, rounded half-up to paise: the GST inside the price when
 * prices include GST, else the GST added on top. null when the price is missing.
 * Display only (the product form's helper line).
 */
export function gstOnPrice(
  price: Num,
  gstRate: Num,
  pricesIncludeGst: boolean
): number | null {
  const p = hundredths(price);
  if (p === null) return null;
  const r = hundredths(gstRate) ?? BigInt(0);
  if (pricesIncludeGst) {
    const before = divRound(p * BigInt(10000), BigInt(10000) + r);
    return toUnits(p - before);
  }
  return toUnits(divRound(p * r, BigInt(10000)));
}

/**
 * What the customer pays for a price, rounded half-up to paise: the price itself
 * when prices include GST, else the price plus the GST added on top (summed in
 * paise). null when the price is missing. Display only.
 */
export function priceWithGst(
  price: Num,
  gstRate: Num,
  pricesIncludeGst: boolean
): number | null {
  const p = hundredths(price);
  if (p === null) return null;
  if (pricesIncludeGst) return toUnits(p);
  const r = hundredths(gstRate) ?? BigInt(0);
  return toUnits(p + divRound(p * r, BigInt(10000)));
}
