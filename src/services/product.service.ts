import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export type ProductStatus = "draft" | "active" | "inactive" | "archived";
/** Statuses a form may set; archived is reached only through the archive endpoint. */
export type WritableProductStatus = Exclude<ProductStatus, "archived">;

export interface ProductImage {
  id: string;
  product_id?: string;
  image_url: string;
  thumb_url?: string | null;
  card_url?: string | null;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  image_type?: string | null;
  variant_id?: string | null;
  is_primary: boolean;
  display_order: number;
}

export interface ProductOptionValue {
  id: string;
  value: string;
  position: number;
}

export interface ProductOption {
  id: string;
  name: string;
  position: number;
  values: ProductOptionValue[];
}

export interface VariantOptionValue {
  option_id: string;
  option_name: string;
  value_id: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  /** Legacy: kept for old clients */
  variant_type?: string | null;
  variant_name?: string | null;
  sku: string;
  price: number;
  original_price?: number | null;
  /** Lowest price a discount may take the variant to; null = no floor */
  min_selling_price?: number | null;
  /** Only with products.view_cost */
  cost_price?: number | null;
  /** Only with products.view_cost; null = the product's GST rate */
  cost_gst_rate?: number | null;
  /** Only with products.view_cost; cost plus purchase GST, null without a cost */
  cost_with_gst?: number | null;
  /** Every admin; null = no B2B price */
  b2b_price?: number | null;
  /** Only with products.view_cost; null when cost is not set */
  margin_amount?: number | null;
  margin_percent?: number | null;
  markup_percent?: number | null;
  stock_quantity: number;
  display_order: number;
  is_active: boolean;
  is_default: boolean;
  barcode?: string | null;
  gtin?: string | null;
  pack_size?: number;
  weight_g?: number | null;
  package_length_mm?: number | null;
  package_width_mm?: number | null;
  package_height_mm?: number | null;
  package_weight_g?: number | null;
  option_values?: VariantOptionValue[];
  /** Admin only: true once orders or stock history use the SKU */
  sku_locked?: boolean;
}

export interface ProductSpecification {
  id?: string;
  group_name?: string | null;
  name: string;
  value: string;
  unit?: string | null;
  display_order?: number;
}

export interface BrandSummary {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
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
    status?: string;
  } | null;
  status: ProductStatus;
  archived_at?: string | null;
  archived_by?: string | null;
  brand_id?: string | null;
  brand?: BrandSummary | null;
  short_name?: string | null;
  model_number?: string | null;
  mpn?: string | null;
  manufacturer?: string | null;
  country_of_origin?: string | null;
  hsn_code?: string | null;
  /** GST percentage (18, not 0.18) */
  gst_rate?: number;
  unit_of_measure?: string;
  tags?: string[];
  highlights?: string[];
  key_features?: string[];
  benefits?: string | null;
  usage_info?: string | null;
  care_info?: string | null;
  installation_info?: string | null;
  usage_instructions?: string | null;
  whats_included?: string[];
  warranty_available?: boolean;
  warranty_months?: number | null;
  warranty_provider?: string | null;
  warranty_type?: string | null;
  warranty_conditions?: string | null;
  min_order_qty?: number;
  max_order_qty?: number | null;
  order_qty_step?: number;
  /** Mirrors recomputed from the variants (read-only) */
  base_price: number;
  original_price?: number | null;
  has_variants: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  /** Always equals status === "active" */
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
  options?: ProductOption[];
  default_variant_id?: string | null;
  specifications?: ProductSpecification[];
  price_range?: { min: number; max: number } | null;
  /** Admin list rows: number of non-default variants */
  variant_count?: number;
  /** Admin detail only */
  has_orders?: boolean;
  /** Create / update responses only */
  warnings?: string[];
}

export interface ProductFilters {
  category_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  in_stock?: boolean;
  is_active?: boolean;
  /** One status or a comma list */
  status?: string;
  include_archived?: boolean;
  brand_id?: string;
  is_featured?: boolean;
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

export interface VariantDetailFields {
  barcode?: string | null;
  gtin?: string | null;
  pack_size?: number;
  weight_g?: number | null;
  package_length_mm?: number | null;
  package_width_mm?: number | null;
  package_height_mm?: number | null;
  package_weight_g?: number | null;
}

/** Price fields a product or variant write may carry (C3). */
export interface PriceFields {
  /** Needs products.view_cost to read it back */
  cost_price?: number | null;
  /** Purchase GST rate; needs products.view_cost, null = the product's rate */
  cost_gst_rate?: number | null;
  min_selling_price?: number | null;
  /** Edit only (not product create); null clears it */
  b2b_price?: number | null;
  /** 3-500 characters; required when a price, MRP, minimum, cost or GST rate changes on an existing product or variant */
  price_change_reason?: string;
}

/** Create-time option set: values listed per option, in option order. */
export interface CreateProductOptionInput {
  name: string;
  values: string[];
}

export interface CreateProductVariantInput extends VariantDetailFields, PriceFields {
  /** One value per option, in option order */
  values: string[];
  price: number;
  original_price?: number | null;
  sku?: string;
  stock_quantity?: number;
  is_active?: boolean;
}

export interface CreateProductRequest extends VariantDetailFields, PriceFields {
  name: string;
  sku?: string;
  short_description?: string;
  description?: string;
  category_id: string;
  status?: WritableProductStatus;
  brand_id?: string | null;
  short_name?: string | null;
  model_number?: string | null;
  mpn?: string | null;
  manufacturer?: string | null;
  country_of_origin?: string | null;
  hsn_code?: string | null;
  /** Must be an active rate from the GST rate list; omitted on create = HSN rate or store default */
  gst_rate?: number;
  unit_of_measure?: string;
  tags?: string[];
  highlights?: string[];
  key_features?: string[];
  benefits?: string | null;
  usage_info?: string | null;
  care_info?: string | null;
  installation_info?: string | null;
  usage_instructions?: string | null;
  whats_included?: string[];
  warranty_available?: boolean;
  warranty_months?: number | null;
  warranty_provider?: string | null;
  warranty_type?: string | null;
  warranty_conditions?: string | null;
  min_order_qty?: number;
  max_order_qty?: number | null;
  order_qty_step?: number;
  specifications?: ProductSpecification[];
  /** Simple product: default variant price (the old name base_price is still read by the API) */
  price?: number;
  original_price?: number | null;
  /** Initial stock, create only; later changes go through Inventory */
  stock_quantity?: number;
  low_stock_threshold?: number;
  is_featured?: boolean;
  /** Product with options (create only; later use saveOptions + variants) */
  options?: CreateProductOptionInput[];
  variants?: CreateProductVariantInput[];
}

export type UpdateProductRequest = Partial<
  Omit<CreateProductRequest, "options" | "variants" | "stock_quantity">
>;

/** Product returned by create / update / archive / restore / options */
export type ProductResponse = Product;

export interface CreateVariantRequest extends VariantDetailFields, PriceFields {
  /** One value id per option (add); ignored on update */
  option_value_ids?: string[];
  /** @deprecated legacy single-axis fields; the old variant modal still sends them until Tasks 14-16 */
  variant_type?: string | null;
  variant_name?: string | null;
  sku?: string;
  price: number;
  original_price?: number | null;
  /** Initial stock, add only */
  stock_quantity?: number;
  display_order?: number;
  is_active?: boolean;
}

export type PriceHistoryField =
  | "price"
  | "mrp"
  | "min_selling_price"
  | "b2b_price"
  | "cost_price"
  | "cost_gst_rate"
  | "gst_rate";

export interface PriceHistoryEntry {
  id: string;
  product_id: string;
  /** null for the product's own rows (gst_rate) */
  variant_id: string | null;
  /** null for product rows, a default variant or a deleted variant */
  variant_name: string | null;
  field: PriceHistoryField;
  old_value: number | null;
  new_value: number | null;
  reason: string;
  actor: "admin" | "system";
  changed_by: string | null;
  changed_by_name: string | null;
  created_at: string;
}

export type PriceHistoryResponse = PaginatedResponse<PriceHistoryEntry>;

export interface SaveOptionsRequest {
  options: {
    id?: string;
    name: string;
    values: { id?: string; value: string }[];
  }[];
}

export interface UpdateImageRequest {
  is_primary?: boolean;
  alt_text?: string | null;
  image_type?: string | null;
  variant_id?: string | null;
  image_url?: string;
  thumb_url?: string | null;
  card_url?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface UploadedImage {
  image_url: string;
  thumb_url: string;
  card_url: string;
  width: number;
  height: number;
}

export interface AddImageRequest {
  image_url: string;
  thumb_url?: string | null;
  card_url?: string | null;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  image_type?: string | null;
  variant_id?: string | null;
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

  createProduct: async (data: CreateProductRequest): Promise<ProductResponse> => {
    const response: { product: ProductResponse; status: number } = await defaultAxios.post(API_ROUTES.PRODUCTS.CREATE, data);
    return response.product;
  },

  updateProduct: async (
    id: string | number,
    data: UpdateProductRequest
  ): Promise<ProductResponse> => {
    const response: { product: ProductResponse; status: number } = await defaultAxios.put(API_ROUTES.PRODUCTS.UPDATE(id), data);
    return response.product;
  },

  archiveProduct: async (id: string | number): Promise<Product> => {
    const response: { product: Product; status: number } = await defaultAxios.post(API_ROUTES.PRODUCTS.ARCHIVE(id), {});
    return response.product;
  },

  /** Restores as Inactive */
  restoreProduct: async (id: string | number): Promise<Product> => {
    const response: { product: Product; status: number } = await defaultAxios.post(API_ROUTES.PRODUCTS.RESTORE(id), {});
    return response.product;
  },

  saveOptions: async (id: string | number, data: SaveOptionsRequest): Promise<Product> => {
    const response: { product: Product; status: number } = await defaultAxios.put(API_ROUTES.PRODUCTS.OPTIONS(id), data);
    return response.product;
  },

  /** Creates every missing option combination as an inactive variant */
  generateVariants: async (id: string | number): Promise<ProductVariant[]> => {
    const response: { variants: ProductVariant[]; status: number } = await defaultAxios.post(
      API_ROUTES.PRODUCTS.GENERATE_VARIANTS(id),
      {}
    );
    return response.variants || [];
  },

  /** Newest first. Cost rows come only with products.view_cost. */
  getPriceHistory: async (
    id: string | number,
    page = 1,
    limit = 20
  ): Promise<PriceHistoryResponse> => {
    return defaultAxios.get(
      `${API_ROUTES.PRODUCTS.PRICE_HISTORY(id)}?page=${page}&limit=${limit}`
    );
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
  uploadImage: async (file: FormData): Promise<UploadedImage> => {
    const response: UploadedImage & { status: number } = await defaultAxios.post(
      API_ROUTES.PRODUCTS.UPLOAD_IMAGE,
      file
    );
    return {
      image_url: response.image_url,
      thumb_url: response.thumb_url,
      card_url: response.card_url,
      width: response.width,
      height: response.height,
    };
  },

  // Add image URL to product
  addProductImage: async (
    productId: string | number,
    data: AddImageRequest
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
      ...uploadResponse,
      is_primary: false,
    });
    return [image];
  },

  updateImage: async (
    productId: string | number,
    imageId: string | number,
    data: UpdateImageRequest
  ): Promise<ProductImage> => {
    const response: { image: ProductImage; status: number } = await defaultAxios.patch(
      API_ROUTES.PRODUCTS.IMAGE(productId, imageId),
      data
    );
    return response.image;
  },

  /** imageIds must list every image of the product, once each */
  reorderImages: async (
    productId: string | number,
    imageIds: string[]
  ): Promise<ProductImage[]> => {
    const response: { images: ProductImage[]; status: number } = await defaultAxios.put(
      API_ROUTES.PRODUCTS.IMAGES_REORDER(productId),
      { image_ids: imageIds }
    );
    return response.images || [];
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
