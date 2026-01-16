import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export interface InventoryOverview {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export interface StockItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_name?: string;
  sku: string;
  current_stock: number;
  low_stock_threshold: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  last_updated: string;
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
  status?: "in_stock" | "low_stock" | "out_of_stock";
  category_id?: string;
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

export interface UpdateStockRequest {
  product_id: string;
  variant_id?: string;
  quantity_change: number;
  reason: string;
}

// Service
export const inventoryService = {
  getOverview: async (): Promise<InventoryOverview> => {
    return defaultAxios.get(API_ROUTES.INVENTORY.OVERVIEW);
  },

  getStockLevels: async (
    filters?: StockFilters
  ): Promise<PaginatedResponse<StockItem>> => {
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

  updateStock: async (data: UpdateStockRequest): Promise<StockItem> => {
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
