import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export interface POSProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  original_price?: number;
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
  notes?: string;
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
  }[];
  subtotal: number;
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
}

interface CustomersApiResponse {
  status: number;
  customers: POSCustomer[];
}

interface CustomerApiResponse {
  status: number;
  customer: POSCustomer;
}

interface OrderApiResponse {
  status: number;
  order: OfflineOrderResponse;
}

// Service
export const posService = {
  searchProducts: async (query: string, limit?: number): Promise<POSProduct[]> => {
    const params = new URLSearchParams();
    params.append("q", query);
    if (limit) params.append("limit", String(limit));
    const response: ProductsApiResponse = await defaultAxios.get(`${API_ROUTES.POS.PRODUCTS}?${params.toString()}`);
    return response.products || [];
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

  createOfflineOrder: async (
    data: CreateOfflineOrderRequest
  ): Promise<OfflineOrderResponse> => {
    const response: OrderApiResponse = await defaultAxios.post(API_ROUTES.POS.CREATE_ORDER, data);
    return response.order;
  },
};

// Cart utilities
export const calculateCartTotals = (items: POSCartItem[]) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxRate = 0.18; // 18% GST
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total,
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
  };
};

export const formatReceiptDate = (date: Date = new Date()): string => {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default posService;
