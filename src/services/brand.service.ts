import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

export type BrandStatus = "active" | "inactive";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  status: BrandStatus;
  /** Non-archived products using the brand */
  product_count?: number;
  /** Products using the brand, archived ones included (blocks delete) */
  product_count_all?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BrandFilters {
  search?: string;
  status?: BrandStatus;
  page?: number;
  limit?: number;
}

export interface BrandListResponse {
  data: Brand[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface CreateBrandRequest {
  name: string;
  description?: string | null;
  logo_url?: string | null;
  status?: BrandStatus;
}

export type UpdateBrandRequest = Partial<CreateBrandRequest>;

export interface UploadedLogo {
  logo_url: string;
  width: number;
  height: number;
}

export const brandService = {
  getBrands: async (filters?: BrandFilters): Promise<BrandListResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    const qs = params.toString();
    return defaultAxios.get(qs ? `${API_ROUTES.BRANDS.LIST}?${qs}` : API_ROUTES.BRANDS.LIST);
  },

  getBrandById: async (id: string | number): Promise<Brand> => {
    const response: { brand: Brand; status: number } = await defaultAxios.get(API_ROUTES.BRANDS.GET(id));
    return response.brand;
  },

  createBrand: async (data: CreateBrandRequest): Promise<Brand> => {
    const response: { brand: Brand; status: number } = await defaultAxios.post(API_ROUTES.BRANDS.CREATE, data);
    return response.brand;
  },

  updateBrand: async (id: string | number, data: UpdateBrandRequest): Promise<Brand> => {
    const response: { brand: Brand; status: number } = await defaultAxios.put(API_ROUTES.BRANDS.UPDATE(id), data);
    return response.brand;
  },

  /** 409 when products use the brand */
  deleteBrand: async (id: string | number): Promise<void> => {
    return defaultAxios.delete(API_ROUTES.BRANDS.DELETE(id));
  },

  /** FormData with a `logo` file */
  uploadLogo: async (file: FormData): Promise<UploadedLogo> => {
    const response: UploadedLogo & { status: number } = await defaultAxios.post(
      API_ROUTES.BRANDS.UPLOAD_LOGO,
      file
    );
    return { logo_url: response.logo_url, width: response.width, height: response.height };
  },
};

export default brandService;
