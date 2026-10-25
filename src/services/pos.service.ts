import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export interface POSProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  original_price?: number;
  /** The product's GST rate in percent, when the search sends it */
  gst_rate?: number | null;
  stock_quantity: number;
  image?: string | null;
  has_variants: boolean;
  variants?: {
    id: string;
    variant_name: string;
    variant_type: string;
    sku: string;
    price: number;
    stock_quantity: number;
  }[];
}

export interface POSCustomer {
  id: string;
  full_name: string;
  mobile: string;
  email?: string;
  total_orders?: number;
}

export interface POSCartItem {
  product_id: string;
  variant_id?: string;
  name: string;
  variant_name?: string;
  sku: string;
  price: number;
  /** The product's GST rate in percent, when known */
  gst_rate?: number | null;
  quantity: number;
  stock_quantity: number;
  image?: string | null;
}

export interface CreateOfflineOrderRequest {
  items: {
    product_id: string;
    variant_id?: string;
    quantity: number;
  }[];
  customer_id?: string;
  payment_method: "cash" | "card" | "upi";
  payment_status?: "pending" | "paid" | "failed";
  amount_paid?: number;
  coupon_code?: string;
  notes?: string;
}

/** Body of POST pos/quote: the same items (and coupon / customer) as the sale. */
export interface POSQuoteRequest {
  items: { product_id: string; variant_id?: string; quantity: number }[];
  coupon_code?: string;
  customer_id?: string;
}

/** Priced totals from the pricing engine (money in rupees, rates in percent). */
export interface POSQuoteSummary {
  subtotal: number;
  discount_amount: number;
  delivery_charge: number;
  tax_amount: number;
  total_amount: number;
  free_delivery_threshold: number | null;
  /** The one rate when every line shares it, else null */
  gst_rate: number | null;
  coupon_code: string | null;
  coupon_error: string | null;
  coupon_note: string | null;
  prices_include_gst: boolean;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  delivery_tax_amount: number;
  round_off: number;
  you_saved: number;
}

/** A priced line, or an `error`-only line when the item could not be resolved. */
export interface POSQuoteLine {
  index: number;
  error: string | null;
  product_id?: string;
  variant_id?: string;
  product_name?: string;
  stock_quantity?: number;
  quantity?: number;
  unit_price?: number;
  gst_rate?: number;
  hsn_code?: string | null;
  gross?: number;
  discount?: number;
  net?: number;
  taxable?: number;
  tax?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total?: number;
}

export interface POSQuote {
  summary: POSQuoteSummary;
  lines: POSQuoteLine[];
}

export interface OfflineOrderResponse {
  id: string;
  order_number: string;
  items: {
    product_id: string;
    product_name: string;
    variant_name?: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
    discount_amount?: number;
    hsn_code?: string | null;
    gst_rate?: number | null;
    taxable_value?: number;
    tax_amount?: number;
    line_total?: number;
  }[];
  subtotal: number;
  discount_amount?: number;
  coupon_code?: string | null;
  taxable_amount?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  round_off?: number;
  prices_include_gst?: boolean | null;
  store_gstin?: string | null;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status?: string;
  order_status?: string;
  amount_paid: number;
  change_amount: number;
  created_at: string;
}

// API Response types
interface ProductsApiResponse {
  status: number;
  products: POSProduct[];
  /** The store setting, sent once for the whole response */
  prices_include_gst?: boolean;
}

export interface POSProductSearchResult {
  products: POSProduct[];
  /** True or false from the server; undefined only for an older backend */
  prices_include_gst?: boolean;
}

interface CustomersApiResponse {
  status: number;
  customers: POSCustomer[];
}

interface CustomerApiResponse {
  status: number;
  customer: POSCustomer;
}

type QuoteApiResponse = POSQuote & { status: number };

interface OrderApiResponse {
  status: number;
  order: OfflineOrderResponse;
}

// Service
export const posService = {
  searchProducts: async (query: string, limit?: number): Promise<POSProductSearchResult> => {
    const params = new URLSearchParams();
    params.append("q", query);
    if (limit) params.append("limit", String(limit));
    const response: ProductsApiResponse = await defaultAxios.get(`${API_ROUTES.POS.PRODUCTS}?${params.toString()}`);
    return { products: response.products || [], prices_include_gst: response.prices_include_gst };
  },

  searchCustomers: async (phone: string): Promise<POSCustomer[]> => {
    const response: CustomersApiResponse = await defaultAxios.get(
      `${API_ROUTES.POS.CUSTOMERS}?phone=${encodeURIComponent(phone)}`
    );
    return response.customers || [];
  },

  createCustomer: async (data: {
    full_name: string;
    mobile: string;
    email?: string;
  }): Promise<POSCustomer> => {
    const response: CustomerApiResponse = await defaultAxios.post(API_ROUTES.POS.CREATE_CUSTOMER, data);
    return response.customer;
  },

  /** Prices a cart on the server. Writes nothing. */
  quoteOrder: async (data: POSQuoteRequest): Promise<POSQuote> => {
    const response: QuoteApiResponse = await defaultAxios.post(API_ROUTES.POS.QUOTE, data);
    return { summary: response.summary, lines: response.lines || [] };
  },

  createOfflineOrder: async (
    data: CreateOfflineOrderRequest
  ): Promise<OfflineOrderResponse> => {
    const response: OrderApiResponse = await defaultAxios.post(API_ROUTES.POS.CREATE_ORDER, data);
    return response.order;
  },
};

export const formatReceiptDate = (date: Date = new Date()): string => {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default posService;
