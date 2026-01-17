import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
  active_from?: string;
  active_to?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerRequest {
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  display_order?: number;
  is_active?: boolean;
  active_from?: string;
  active_to?: string;
}

export interface BannerFilters {
  is_active?: boolean;
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

export interface ReorderRequest {
  banners: { id: string; display_order: number }[];
}

// API Response types
interface BannersApiResponse {
  status: number;
  banners: Banner[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

interface BannerApiResponse {
  status: number;
  banner: Banner;
}

interface ImageUploadResponse {
  status: number;
  image_url: string;
}

// Service
export const bannerService = {
  getBanners: async (
    filters?: BannerFilters
  ): Promise<PaginatedResponse<Banner>> => {
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
      ? `${API_ROUTES.BANNERS.LIST}?${queryString}`
      : API_ROUTES.BANNERS.LIST;
    const response: BannersApiResponse = await defaultAxios.get(url);
    return {
      data: response.banners || [],
      total: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      limit: response.pagination?.limit || 10,
      total_pages: response.pagination?.total_pages || 1,
    };
  },

  getActiveBanners: async (): Promise<Banner[]> => {
    const response: BannersApiResponse = await defaultAxios.get(`${API_ROUTES.BANNERS.LIST}?is_active=true`);
    return response.banners || [];
  },

  getBannerById: async (id: string | number): Promise<Banner> => {
    const response: BannerApiResponse = await defaultAxios.get(API_ROUTES.BANNERS.GET(id));
    return response.banner;
  },

  createBanner: async (data: CreateBannerRequest): Promise<Banner> => {
    const response: BannerApiResponse = await defaultAxios.post(API_ROUTES.BANNERS.CREATE, data);
    return response.banner;
  },

  updateBanner: async (
    id: string | number,
    data: Partial<CreateBannerRequest>
  ): Promise<Banner> => {
    const response: BannerApiResponse = await defaultAxios.put(API_ROUTES.BANNERS.UPDATE(id), data);
    return response.banner;
  },

  deleteBanner: async (id: string | number): Promise<void> => {
    return defaultAxios.delete(API_ROUTES.BANNERS.DELETE(id));
  },

  reorderBanners: async (data: ReorderRequest): Promise<void> => {
    return defaultAxios.put(API_ROUTES.BANNERS.REORDER, data);
  },

  uploadBannerImage: async (file: FormData): Promise<{ image_url: string }> => {
    const response: ImageUploadResponse = await defaultAxios.post("banners/upload-image", file);
    return { image_url: response.image_url };
  },
};

export default bannerService;
