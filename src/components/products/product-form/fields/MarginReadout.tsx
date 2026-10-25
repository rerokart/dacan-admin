import { costWithGst, marginFields } from "@/utils/margin";
import { percent, rupees } from "@/utils/productFormat";

interface MarginReadoutProps {
  price: string;
  cost: string;
  /** The product's GST rate (selling side) */
  gstRate: string | number | null;
  /** Purchase GST rate; blank or null = the product's rate */
  costGstRate?: string | number | null;
  pricesIncludeGst: boolean;
}

/** Live "Cost with GST ₹X · Profit ₹Y · Margin Z%" for a selling price against its cost; empty without both. */
export default function MarginReadout({ price, cost, gstRate, costGstRate, pricesIncludeGst }: MarginReadoutProps) {
  if (price.trim() === "" || cost.trim() === "") return null;
  const m = marginFields(price, cost, gstRate, pricesIncludeGst);
  if (m.margin_amount === null) return null;
  const purchaseRate = costGstRate === null || costGstRate === undefined || costGstRate === "" ? gstRate : costGstRate;
  const withGst = costWithGst(cost, purchaseRate);
  const loss = m.margin_amount < 0;
  const parts: string[] = [];
  if (withGst !== null) parts.push(`Cost with GST ${rupees(withGst)}`);
  parts.push(`Profit ${rupees(m.margin_amount)}`);
  if (m.margin_percent !== null) parts.push(`Margin ${percent(m.margin_percent)}`);
  return (
    <p className={`mt-1 text-xs tabular-nums ${loss ? "text-error-500" : "text-gray-500 dark:text-gray-400"}`} aria-live="polite">
      {parts.join(" · ")}
      {loss && <span className="block font-medium">This price sells at a loss</span>}
    </p>
  );
}
