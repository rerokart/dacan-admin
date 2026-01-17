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
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  base_price: number;
  original_price?: number;
  has_variants: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured?: boolean;
  average_rating: number;
  total_reviews: number;
  view_count?: number;
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
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc" | "name_desc" | "rating";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
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

export interface AddImageRequest {
  image_url: string;
  is_primary?: boolean;
  display_order?: number;
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
    const response: { product: Product; status: number } = await defaultAxios.get(API_ROUTES.PRODUCTS.GET(id));
    return response.product;
  },

  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response: { product: Product; status: number } = await defaultAxios.post(API_ROUTES.PRODUCTS.CREATE, data);
    return response.product;
  },

  updateProduct: async (
    id: string | number,
    data: Partial<CreateProductRequest>
  ): Promise<Product> => {
    const response: { product: Product; status: number } = await defaultAxios.put(API_ROUTES.PRODUCTS.UPDATE(id), data);
    return response.product;
  },

  deleteProduct: async (id: string | number): Promise<void> => {
    return defaultAxios.delete(API_ROUTES.PRODUCTS.DELETE(id));
  },

  // Variants
  getVariants: async (productId: string | number): Promise<ProductVariant[]> => {
    const response: { variants: ProductVariant[]; status: number } = await defaultAxios.get(
      API_ROUTES.PRODUCTS.VARIANTS(productId)
    );
    return response.variants || [];
  },

  addVariant: async (
    productId: string | number,
    data: CreateVariantRequest
  ): Promise<ProductVariant> => {
    const response: { variant: ProductVariant; status: number } = await defaultAxios.post(
      API_ROUTES.PRODUCTS.VARIANTS(productId),
      data
    );
    return response.variant;
  },

  updateVariant: async (
    productId: string | number,
    variantId: string | number,
    data: Partial<CreateVariantRequest>
  ): Promise<ProductVariant> => {
    const response: { variant: ProductVariant; status: number } = await defaultAxios.put(
      API_ROUTES.PRODUCTS.VARIANT(productId, variantId),
      data
    );
    return response.variant;
  },

  deleteVariant: async (
    productId: string | number,
    variantId: string | number
  ): Promise<void> => {
    return defaultAxios.delete(API_ROUTES.PRODUCTS.VARIANT(productId, variantId));
  },

  // Images
  // Upload image file and get URL back
  uploadImage: async (file: FormData): Promise<{ image_url: string }> => {
    const response: { image_url: string; status: number } = await defaultAxios.post(
      API_ROUTES.PRODUCTS.UPLOAD_IMAGE,
      file
    );
    return { image_url: response.image_url };
  },

  // Add image URL to product
  addProductImage: async (
    productId: string | number,
    data: { image_url: string; is_primary?: boolean; display_order?: number }
  ): Promise<ProductImage> => {
    const response: { image: ProductImage; status: number } = await defaultAxios.post(
      API_ROUTES.PRODUCTS.IMAGES(productId),
      data
    );
    return response.image;
  },

  // Upload and add images to product (convenience method)
  uploadImages: async (
    productId: string | number,
    files: FormData
  ): Promise<ProductImage[]> => {
    // First upload the image file
    const uploadResponse = await productService.uploadImage(files);
    // Then add the image URL to the product
    const image = await productService.addProductImage(productId, {
      image_url: uploadResponse.image_url,
      is_primary: false,
    });
    return [image];
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
