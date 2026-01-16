import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  parent_name?: string;
  display_order: number;
  is_active: boolean;
  product_count?: number;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface CategoryFilters {
  search?: string;
  is_active?: boolean;
  parent_id?: string;
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

// API Response type
interface CategoriesResponse {
  categories: Category[];
  status: number;
}

// Service
export const categoryService = {
  getCategories: async (filters?: CategoryFilters): Promise<Category[]> => {
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
      ? `${API_ROUTES.CATEGORIES.LIST}?${queryString}`
      : API_ROUTES.CATEGORIES.LIST;
    const response: CategoriesResponse = await defaultAxios.get(url);
    return response.categories || [];
  },

  getCategoryById: async (id: string | number): Promise<Category> => {
    return defaultAxios.get(API_ROUTES.CATEGORIES.GET(id));
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    return defaultAxios.post(API_ROUTES.CATEGORIES.CREATE, data);
  },

  updateCategory: async (
    id: string | number,
    data: Partial<CreateCategoryRequest>
  ): Promise<Category> => {
    return defaultAxios.put(API_ROUTES.CATEGORIES.UPDATE(id), data);
  },

  deleteCategory: async (id: string | number): Promise<void> => {
    return defaultAxios.delete(API_ROUTES.CATEGORIES.DELETE(id));
  },

  getCategoryProducts: async (
    categoryId: string | number,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<unknown>> => {
    const params = new URLSearchParams();
    if (page) params.append("page", String(page));
    if (limit) params.append("limit", String(limit));
    const queryString = params.toString();
    const url = queryString
      ? `${API_ROUTES.CATEGORIES.PRODUCTS(categoryId)}?${queryString}`
      : API_ROUTES.CATEGORIES.PRODUCTS(categoryId);
    return defaultAxios.get(url);
  },

  uploadCategoryImage: async (file: FormData): Promise<{ image_url: string }> => {
    return defaultAxios.post("categories/upload-image", file, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default categoryService;
