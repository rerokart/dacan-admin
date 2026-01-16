import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export interface ReviewImage {
  id: string;
  image_url: string;
}

export interface Review {
  id: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  order_id: string;
  order_number?: string;
  rating: number;
  title?: string;
  review_text: string;
  status: "pending" | "approved" | "rejected";
  helpful_count: number;
  images?: ReviewImage[];
  created_at: string;
  updated_at: string;
}

export interface ReviewFilters {
  search?: string;
  product_id?: string;
  user_id?: string;
  status?: "pending" | "approved" | "rejected";
  rating?: number;
  min_rating?: number;
  max_rating?: number;
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

// Service
export const reviewService = {
  getReviews: async (
    filters?: ReviewFilters
  ): Promise<PaginatedResponse<Review>> => {
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
      ? `${API_ROUTES.REVIEWS.LIST}?${queryString}`
      : API_ROUTES.REVIEWS.LIST;
    return defaultAxios.get(url);
  },

  getReviewById: async (id: string | number): Promise<Review> => {
    return defaultAxios.get(API_ROUTES.REVIEWS.GET(id));
  },

  getProductReviews: async (
    productId: string | number,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams();
    if (page) params.append("page", String(page));
    if (limit) params.append("limit", String(limit));
    const queryString = params.toString();
    const url = queryString
      ? `${API_ROUTES.PRODUCTS.REVIEWS(productId)}?${queryString}`
      : API_ROUTES.PRODUCTS.REVIEWS(productId);
    return defaultAxios.get(url);
  },

  approveReview: async (id: string | number): Promise<Review> => {
    return defaultAxios.put(API_ROUTES.REVIEWS.APPROVE(id));
  },

  rejectReview: async (id: string | number): Promise<Review> => {
    return defaultAxios.put(API_ROUTES.REVIEWS.REJECT(id));
  },

  deleteReview: async (id: string | number): Promise<void> => {
    return defaultAxios.delete(API_ROUTES.REVIEWS.DELETE(id));
  },
};

export const REVIEW_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export const REVIEW_STATUS_COLORS: Record<string, string> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export default reviewService;
