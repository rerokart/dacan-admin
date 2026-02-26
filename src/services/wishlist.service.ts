import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  base_price: number;
  original_price?: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  added_at: string;
  user: User;
  product: Product;
}

export interface WishlistFilters {
  search?: string;
  user_id?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// API Response type
interface WishlistsApiResponse {
  data: WishlistItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  status: number;
}

// Service
export const wishlistService = {
  getWishlists: async (filters?: WishlistFilters): Promise<PaginatedResponse<WishlistItem>> => {
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
      ? `${API_ROUTES.WISHLISTS.LIST}?${queryString}`
      : API_ROUTES.WISHLISTS.LIST;
    const response: WishlistsApiResponse = await defaultAxios.get(url);
    return {
      data: response.data || [],
      total: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      limit: response.pagination?.limit || 10,
      total_pages: response.pagination?.total_pages || 1,
      has_next: response.pagination?.has_next || false,
      has_prev: response.pagination?.has_prev || false,
    };
  },
};

export default wishlistService;
