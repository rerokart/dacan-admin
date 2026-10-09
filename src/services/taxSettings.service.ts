import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

export interface TaxSettings {
  gstin: string | null;
  store_state: string | null;
  prices_include_gst: boolean;
  /** Percentage, e.g. 18 */
  default_gst_rate: number;
  delivery_gst_rate: number;
  round_total_to_rupee: boolean;
  updated_at?: string;
  updated_by?: string | null;
}

export type UpdateTaxSettingsRequest = Partial<
  Pick<
    TaxSettings,
    | "gstin"
    | "store_state"
    | "prices_include_gst"
    | "default_gst_rate"
    | "delivery_gst_rate"
    | "round_total_to_rupee"
  >
>;

export interface GstRate {
  id: string;
  /** Percentage, e.g. 18 */
  rate: number;
  label: string;
  is_active: boolean;
  created_at?: string;
}

export interface CreateGstRateRequest {
  rate: number;
  label: string;
  is_active?: boolean;
}

export type UpdateGstRateRequest = Partial<CreateGstRateRequest>;

export interface HsnCode {
  code: string;
  description: string;
  gst_rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface HsnFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface HsnListResponse {
  data: HsnCode[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface CreateHsnCodeRequest {
  code: string;
  description?: string;
  gst_rate: number;
}

export type UpdateHsnCodeRequest = Partial<Omit<CreateHsnCodeRequest, "code">>;

export const taxSettingsService = {
  getSettings: async (): Promise<TaxSettings> => {
    const response: { settings: TaxSettings; status: number } = await defaultAxios.get(
      API_ROUTES.SETTINGS.TAX
    );
    return response.settings;
  },

  updateSettings: async (data: UpdateTaxSettingsRequest): Promise<TaxSettings> => {
    const response: { settings: TaxSettings; status: number } = await defaultAxios.put(
      API_ROUTES.SETTINGS.TAX,
      data
    );
    return response.settings;
  },

  getGstRates: async (): Promise<GstRate[]> => {
    const response: { rates: GstRate[]; status: number } = await defaultAxios.get(
      API_ROUTES.SETTINGS.GST_RATES
    );
    return response.rates || [];
  },

  createGstRate: async (data: CreateGstRateRequest): Promise<GstRate> => {
    const response: { rate: GstRate; status: number } = await defaultAxios.post(
      API_ROUTES.SETTINGS.GST_RATES,
      data
    );
    return response.rate;
  },

  updateGstRate: async (id: string, data: UpdateGstRateRequest): Promise<GstRate> => {
    const response: { rate: GstRate; status: number } = await defaultAxios.put(
      API_ROUTES.SETTINGS.GST_RATE(id),
      data
    );
    return response.rate;
  },

  /** 409 while products, HSN codes or the settings use the rate */
  deleteGstRate: async (id: string): Promise<void> => {
    return defaultAxios.delete(API_ROUTES.SETTINGS.GST_RATE(id));
  },

  getHsnCodes: async (filters?: HsnFilters): Promise<HsnListResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    const qs = params.toString();
    return defaultAxios.get(
      qs ? `${API_ROUTES.SETTINGS.HSN_CODES}?${qs}` : API_ROUTES.SETTINGS.HSN_CODES
    );
  },

  /** Rate for a product HSN: exact code, then its 6- and 4-digit prefix. null when none match. */
  lookupHsn: async (code: string): Promise<HsnCode | null> => {
    const response: { match: HsnCode | null; status: number } = await defaultAxios.get(
      `${API_ROUTES.SETTINGS.HSN_CODES}?lookup=${encodeURIComponent(code)}`
    );
    return response.match ?? null;
  },

  createHsnCode: async (data: CreateHsnCodeRequest): Promise<HsnCode> => {
    const response: { hsn: HsnCode; status: number } = await defaultAxios.post(
      API_ROUTES.SETTINGS.HSN_CODES,
      data
    );
    return response.hsn;
  },

  updateHsnCode: async (code: string, data: UpdateHsnCodeRequest): Promise<HsnCode> => {
    const response: { hsn: HsnCode; status: number } = await defaultAxios.put(
      API_ROUTES.SETTINGS.HSN_CODE(code),
      data
    );
    return response.hsn;
  },

  deleteHsnCode: async (code: string): Promise<void> => {
    return defaultAxios.delete(API_ROUTES.SETTINGS.HSN_CODE(code));
  },
};

export default taxSettingsService;
