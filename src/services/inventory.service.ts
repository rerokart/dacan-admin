import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryOverview {
  total_items: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  /** Sum of stock x selling price over active rows. */
  total_value: number;
}

export interface StockItem {
  type: "product" | "variant";
  id: string;
  product_id: string;
  variant_id: string | null;
  sku: string;
  name: string;
  variant_info: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
  category: string | null;
  stock_status: StockStatus;
  unit_price: number | null;
}

export interface StockHistoryItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_name?: string;
  change_type: "manual_adjustment" | "order_placed" | "order_cancelled" | "restock";
  quantity_before: number;
  quantity_change: number;
  quantity_after: number;
  reason?: string;
  created_by?: string;
  created_by_name?: string;
  order_id?: string;
  created_at: string;
}

export interface StockFilters {
  search?: string;
  /** One status, or a comma-separated list (e.g. "low_stock,out_of_stock"). */
  status?: StockStatus | string;
  category_id?: string;
  page?: number;
  limit?: number;
}

export interface InventoryListResponse {
  inventory: StockItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UpdateStockRequest {
  product_id: string;
  /** Set for variant rows. */
  variant_id?: string | null;
  /** Integer delta (positive or negative). */
  adjustment: number;
  reason: string;
}

export interface UpdateStockResponse {
  message: string;
  previous_quantity: number;
  new_quantity: number;
  change: number;
}

// Service
export const inventoryService = {
  getOverview: async (): Promise<InventoryOverview> => {
    const res: { overview: InventoryOverview } = await defaultAxios.get(
      API_ROUTES.INVENTORY.OVERVIEW
    );
    return res.overview;
  },

  getStockLevels: async (
    filters?: StockFilters
  ): Promise<InventoryListResponse> => {
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
      ? `${API_ROUTES.INVENTORY.STOCK_LEVELS}?${queryString}`
      : API_ROUTES.INVENTORY.STOCK_LEVELS;
    return defaultAxios.get(url);
  },

  updateStock: async (data: UpdateStockRequest): Promise<UpdateStockResponse> => {
    return defaultAxios.put(API_ROUTES.INVENTORY.UPDATE_STOCK, data);
  },

  getStockHistory: async (
    productId?: string,
    variantId?: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<StockHistoryItem>> => {
    const params = new URLSearchParams();
    if (productId) params.append("product_id", productId);
    if (variantId) params.append("variant_id", variantId);
    if (page) params.append("page", String(page));
    if (limit) params.append("limit", String(limit));
    const queryString = params.toString();
    const url = queryString
      ? `${API_ROUTES.INVENTORY.HISTORY}?${queryString}`
      : API_ROUTES.INVENTORY.HISTORY;
    return defaultAxios.get(url);
  },
};

export default inventoryService;
