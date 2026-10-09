import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import type { TabProps } from "./types";

/** `errors` here is every error, not only the shown ones: the quantity rule shows inline at once. */
export default function LimitsTab({ form, set, errors }: TabProps) {
  return (
    <>
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
    </>
  );
}
