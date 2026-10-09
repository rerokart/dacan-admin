import { marginFields } from "@/utils/margin";
import { percent, rupees } from "@/utils/productFormat";

interface MarginReadoutProps {
  price: string;
  cost: string;
  gstRate: string | number | null;
  pricesIncludeGst: boolean;
}

/** Live "Margin ₹X (Y%) · Markup Z%" for a selling price against its cost; empty without both. */
export default function MarginReadout({ price, cost, gstRate, pricesIncludeGst }: MarginReadoutProps) {
  if (price.trim() === "" || cost.trim() === "") return null;
  const m = marginFields(price, cost, gstRate, pricesIncludeGst);
  if (m.margin_amount === null) return null;
  const loss = m.margin_amount < 0;
  const parts = [`Margin ${rupees(m.margin_amount)}${m.margin_percent === null ? "" : ` (${percent(m.margin_percent)})`}`];
  if (m.markup_percent !== null) parts.push(`Markup ${percent(m.markup_percent)}`);
  return (
    <p className={`mt-1 text-xs tabular-nums ${loss ? "text-error-500" : "text-gray-500 dark:text-gray-400"}`} aria-live="polite">
      {parts.join(" · ")}
      {loss && <span className="block font-medium">This price sells at a loss</span>}
    </p>
  );
}
