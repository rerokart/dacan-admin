import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string;
  variant_name: string;
  sku: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  display_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string;
  category_name?: string;
  base_price: number;
  original_price?: number;
  has_variants: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  primary_image?: string;
}

export interface ProductFilters {
  category_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  in_stock?: boolean;
  is_active?: boolean;
  sort?: "price_asc" | "price_desc" | "newest" | "rating";
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

export interface CreateProductRequest {
  name: string;
  sku?: string;
  short_description: string;
  description: string;
  category_id: string;
  base_price: number;
  original_price?: number;
  has_variants: boolean;
  stock_quantity?: number;
  low_stock_threshold?: number;
  is_active?: boolean;
}

export interface CreateVariantRequest {
  variant_type: string;
  variant_name: string;
  sku?: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  display_order?: number;
  is_active?: boolean;
}

// Service
export const productService = {
  getProducts: async (
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    return defaultAxios.get(`${API_ROUTES.PRODUCTS.LIST}?${params.toString()}`);
  },

  getProductById: async (id: string | number): Promise<Product> => {
    return defaultAxios.get(API_ROUTES.PRODUCTS.GET(id));
  },

  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    return defaultAxios.post(API_ROUTES.PRODUCTS.CREATE, data);
  },

  updateProduct: async (
    id: string | number,
    data: Partial<CreateProductRequest>
  ): Promise<Product> => {
    return defaultAxios.put(API_ROUTES.PRODUCTS.UPDATE(id), data);
  },

  deleteProduct: async (id: string | number): Promise<void> => {
    return defaultAxios.delete(API_ROUTES.PRODUCTS.DELETE(id));
  },

  // Variants
  getVariants: async (productId: string | number): Promise<ProductVariant[]> => {
    return defaultAxios.get(API_ROUTES.PRODUCTS.VARIANTS(productId));
  },

  addVariant: async (
    productId: string | number,
    data: CreateVariantRequest
  ): Promise<ProductVariant> => {
    return defaultAxios.post(API_ROUTES.PRODUCTS.VARIANTS(productId), data);
  },

  updateVariant: async (
    productId: string | number,
    variantId: string | number,
    data: Partial<CreateVariantRequest>
  ): Promise<ProductVariant> => {
    return defaultAxios.put(
      API_ROUTES.PRODUCTS.VARIANT(productId, variantId),
      data
    );
  },

  deleteVariant: async (
    productId: string | number,
    variantId: string | number
  ): Promise<void> => {
    return defaultAxios.delete(API_ROUTES.PRODUCTS.VARIANT(productId, variantId));
  },

  // Images
  uploadImages: async (
    productId: string | number,
    files: FormData
  ): Promise<ProductImage[]> => {
    return defaultAxios.post(API_ROUTES.PRODUCTS.IMAGES(productId), files, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteImage: async (
    productId: string | number,
    imageId: string | number
  ): Promise<void> => {
    return defaultAxios.delete(API_ROUTES.PRODUCTS.IMAGE(productId, imageId));
  },

  // Search
  searchProducts: async (query: string): Promise<Product[]> => {
    return defaultAxios.get(`${API_ROUTES.PRODUCTS.SEARCH}?q=${encodeURIComponent(query)}`);
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    return defaultAxios.get(API_ROUTES.PRODUCTS.FEATURED);
  },

  getLatestProducts: async (): Promise<Product[]> => {
    return defaultAxios.get(API_ROUTES.PRODUCTS.LATEST);
  },
};

export default productService;
