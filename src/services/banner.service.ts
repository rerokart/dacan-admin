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
    return defaultAxios.get(url);
  },

  getActiveBanners: async (): Promise<Banner[]> => {
    return defaultAxios.get(`${API_ROUTES.BANNERS.LIST}?is_active=true`);
  },

  getBannerById: async (id: string | number): Promise<Banner> => {
    return defaultAxios.get(API_ROUTES.BANNERS.GET(id));
  },

  createBanner: async (data: CreateBannerRequest): Promise<Banner> => {
    return defaultAxios.post(API_ROUTES.BANNERS.CREATE, data);
  },

  updateBanner: async (
    id: string | number,
    data: Partial<CreateBannerRequest>
  ): Promise<Banner> => {
    return defaultAxios.put(API_ROUTES.BANNERS.UPDATE(id), data);
  },

  deleteBanner: async (id: string | number): Promise<void> => {
    return defaultAxios.delete(API_ROUTES.BANNERS.DELETE(id));
  },

  reorderBanners: async (data: ReorderRequest): Promise<void> => {
    return defaultAxios.put(API_ROUTES.BANNERS.REORDER, data);
  },

  uploadBannerImage: async (file: FormData): Promise<{ image_url: string }> => {
    return defaultAxios.post("banners/upload-image", file, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default bannerService;
