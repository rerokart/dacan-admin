// Price field labels. With "Prices are typed including GST" off (the default),
// the admin types prices without GST and the labels say so.

export interface PriceLabels {
  price: string;
  mrp: string;
  min: string;
  b2b: string;
  cost: string;
}

export const priceLabels = (typedIncludingGst: boolean): PriceLabels =>
  typedIncludingGst
    ? {
        price: "Selling price (₹)",
        mrp: "MRP (₹)",
        min: "Minimum selling price (₹)",
        b2b: "B2B price (₹)",
        cost: "Cost price before GST (₹)",
      }
    : {
        price: "Selling price (without GST)",
        mrp: "MRP (without GST)",
        min: "Minimum selling price (without GST)",
        b2b: "B2B price (without GST)",
        cost: "Cost price (without GST)",
      };
