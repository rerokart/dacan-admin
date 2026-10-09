import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export interface OrderItem {
  id: string;
  product_id: string;
  variant_id?: string;
  product_snapshot: {
    name: string;
    sku: string;
    image_url?: string;
  };
  variant_snapshot?: {
    variant_name: string;
    variant_type: string;
  };
  quantity: number;
  unit_price: number;
  subtotal: number;
  /** C3 tax breakup: absent or null on legacy orders */
  hsn_code?: string | null;
  /** Percentage (18, not 0.18) */
  gst_rate?: number | null;
  mrp?: number | null;
  discount_amount?: number | null;
  taxable_value?: number | null;
  cgst_amount?: number | null;
  sgst_amount?: number | null;
  igst_amount?: number | null;
  tax_amount?: number | null;
  line_total?: number | null;
}

export interface OrderAddress {
  full_name: string;
  mobile: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  address_type: string;
}

export interface OrderStatusHistory {
  id: string;
  status: string;
  notes?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    mobile: string;
  };
  address_id?: string;
  address_snapshot?: OrderAddress;
  subtotal: number;
  discount_amount: number;
  coupon_id?: string;
  coupon_code?: string;
  /** The order detail route sends the coupon as an object, not coupon_code */
  coupon?: { code: string; description?: string | null } | null;
  delivery_charge: number;
  tax_amount: number;
  total_amount: number;
  /** C3 tax breakup: absent or null on legacy orders (null prices_include_gst marks one) */
  prices_include_gst?: boolean | null;
  taxable_amount?: number | null;
  cgst_amount?: number | null;
  sgst_amount?: number | null;
  igst_amount?: number | null;
  delivery_tax_amount?: number | null;
  round_off?: number | null;
  store_gstin?: string | null;
  store_state?: string | null;
  payment_method: "cod" | "online" | "cash" | "card" | "upi";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  order_status:
    | "placed"
    | "confirmed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  source: "online" | "offline";
  pos_user_id?: string;
  notes?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  status_history?: OrderStatusHistory[];
}

export interface OrderFilters {
  search?: string;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  source?: "online" | "offline";
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UpdateOrderStatusRequest {
  status: string;
  notes?: string;
  send_notification?: boolean;
}

// Service
export const orderService = {
  getOrders: async (
    filters?: OrderFilters
  ): Promise<PaginatedResponse<Order>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const url = queryString
      ? `${API_ROUTES.ORDERS.LIST}?${queryString}`
      : API_ROUTES.ORDERS.LIST;
    return defaultAxios.get(url);
  },

  getOrderById: async (id: string | number): Promise<Order> => {
    const response: { order: Order; status: number } = await defaultAxios.get(API_ROUTES.ORDERS.GET(id));
    return response.order;
  },

  updateOrderStatus: async (
    id: string | number,
    data: UpdateOrderStatusRequest
  ): Promise<Order> => {
    const response: { order: Order; status: number } = await defaultAxios.put(API_ROUTES.ORDERS.UPDATE_STATUS(id), data);
    return response.order;
  },

  updatePaymentStatus: async (
    id: string | number,
    payment_status: string
  ): Promise<Order> => {
    const response: { order: Order; status: number } = await defaultAxios.put(
      API_ROUTES.ORDERS.UPDATE_PAYMENT(id),
      { payment_status }
    );
    return response.order;
  },

  getOrderInvoice: async (id: string | number): Promise<Blob> => {
    const response = await defaultAxios.get(API_ROUTES.ORDERS.INVOICE(id), {
      responseType: "blob",
    });
    return response as unknown as Blob;
  },
};

export const ORDER_STATUS_OPTIONS = [
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
];

// Display labels for every payment method the backend can store
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "COD",
  online: "Online",
  cash: "Cash",
  card: "Card",
  upi: "UPI",
};

export const getPaymentMethodLabel = (method?: string | null): string =>
  method ? PAYMENT_METHOD_LABELS[method] ?? method : "—";

export const ORDER_STATUS_COLORS: Record<string, string> = {
  placed: "warning",
  confirmed: "info",
  shipped: "primary",
  out_for_delivery: "primary",
  delivered: "success",
  cancelled: "error",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "warning",
  paid: "success",
  failed: "error",
  refunded: "info",
};

export default orderService;
