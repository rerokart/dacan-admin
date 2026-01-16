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
  delivery_charge: number;
  tax_amount: number;
  total_amount: number;
  payment_method: "cod" | "online";
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
  order_status?: string;
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
    return defaultAxios.get(API_ROUTES.ORDERS.GET(id));
  },

  updateOrderStatus: async (
    id: string | number,
    data: UpdateOrderStatusRequest
  ): Promise<Order> => {
    return defaultAxios.put(API_ROUTES.ORDERS.UPDATE_STATUS(id), data);
  },

  cancelOrder: async (id: string | number, reason?: string): Promise<Order> => {
    return defaultAxios.post(API_ROUTES.ORDERS.CANCEL(id), { reason });
  },

  getOrderInvoice: async (id: string | number): Promise<Blob> => {
    const response = await defaultAxios.get(API_ROUTES.ORDERS.INVOICE(id), {
      responseType: "blob",
    });
    return response as unknown as Blob;
  },

  createOfflineOrder: async (data: {
    items: { product_id: string; variant_id?: string; quantity: number }[];
    customer_id?: string;
    payment_method: string;
    amount_paid?: number;
    notes?: string;
  }): Promise<Order> => {
    return defaultAxios.post(API_ROUTES.ORDERS.OFFLINE, data);
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
  { value: "refunded", label: "Refunded" },
];

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
