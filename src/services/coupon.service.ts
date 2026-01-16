import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount?: number;
  min_order_value: number;
  usage_limit?: number;
  usage_count: number;
  per_user_limit: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateCouponRequest {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount?: number;
  min_order_value?: number;
  usage_limit?: number;
  per_user_limit?: number;
  valid_from: string;
  valid_to: string;
  is_active?: boolean;
}

export interface CouponFilters {
  search?: string;
  is_active?: boolean;
  status?: "active" | "expired" | "all";
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

export interface ValidateCouponRequest {
  code: string;
  order_total: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discount_amount?: number;
  message?: string;
}

// Service
export const couponService = {
  getCoupons: async (
    filters?: CouponFilters
  ): Promise<PaginatedResponse<Coupon>> => {
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
      ? `${API_ROUTES.COUPONS.LIST}?${queryString}`
      : API_ROUTES.COUPONS.LIST;
    return defaultAxios.get(url);
  },

  getCouponById: async (id: string | number): Promise<Coupon> => {
    return defaultAxios.get(API_ROUTES.COUPONS.GET(id));
  },

  createCoupon: async (data: CreateCouponRequest): Promise<Coupon> => {
    return defaultAxios.post(API_ROUTES.COUPONS.CREATE, data);
  },

  updateCoupon: async (
    id: string | number,
    data: Partial<CreateCouponRequest>
  ): Promise<Coupon> => {
    return defaultAxios.put(API_ROUTES.COUPONS.UPDATE(id), data);
  },

  deleteCoupon: async (id: string | number): Promise<void> => {
    return defaultAxios.delete(API_ROUTES.COUPONS.DELETE(id));
  },

  validateCoupon: async (
    data: ValidateCouponRequest
  ): Promise<ValidateCouponResponse> => {
    return defaultAxios.post(API_ROUTES.COUPONS.VALIDATE, data);
  },

  generateCode: (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },
};

export default couponService;
