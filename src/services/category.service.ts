import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export type CategoryStatus = "active" | "draft" | "inactive" | "archived";
export type WritableCategoryStatus = Exclude<CategoryStatus, "archived">;

export interface CategoryPathItem {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  code: string;
  description?: string;
  parent_id?: string | null;
  parent_name?: string;
  display_order: number;
  status: CategoryStatus;
  show_on_app: boolean;
  show_on_web: boolean;
  show_in_pos: boolean;
  is_featured: boolean;
  featured_order: number;
  icon_url?: string | null;
  thumbnail_url?: string | null;
  banner_url?: string | null;
  archived_at?: string | null;
  archived_by?: string | null;
  /** Computed by the API */
  depth: number;
  hidden_by_parent?: boolean;
  /** In-stock products, including subcategories */
  product_count?: number;
  /** Active products, including subcategories */
  total_product_count?: number;
  /** Products directly in this category, any status (detail only) */
  direct_product_count?: number;
  path?: CategoryPathItem[];
  /** @deprecated use status */
  is_active: boolean;
  /** @deprecated display fallback: thumbnail → icon → old image */
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  code?: string;
  description?: string | null;
  parent_id?: string | null;
  display_order?: number;
  status?: WritableCategoryStatus;
  show_on_app?: boolean;
  show_on_web?: boolean;
  show_in_pos?: boolean;
  is_featured?: boolean;
  featured_order?: number;
  icon_url?: string | null;
  thumbnail_url?: string | null;
  banner_url?: string | null;
}

export interface ArchiveCategoryResponse {
  category: Category;
  moved_products: number;
}

export interface CategoryFilters {
  search?: string;
  include_archived?: boolean;
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
    const response: { category: Category; status: number } = await defaultAxios.get(API_ROUTES.CATEGORIES.GET(id));
    if (!response.category) {
      throw new Error("Category not found");
    }
    return response.category;
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

  archiveCategory: async (
    id: string | number,
    moveProductsTo?: string
  ): Promise<ArchiveCategoryResponse> => {
    return defaultAxios.post(
      API_ROUTES.CATEGORIES.ARCHIVE(id),
      moveProductsTo ? { move_products_to: moveProductsTo } : {}
    );
  },

  restoreCategory: async (id: string | number): Promise<{ category: Category }> => {
    return defaultAxios.post(API_ROUTES.CATEGORIES.RESTORE(id), {});
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
    // Don't set Content-Type header manually - axios will set it with the correct boundary
    return defaultAxios.post("categories/upload-image", file);
  },
};

export default categoryService;
