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
  /** Effective reorder level: the variant's, else the product's, else 10. */
  reorder_level: number;
  /** Alias of reorder_level kept by the server for older builds. */
  low_stock_threshold?: number;
  category: string | null;
  stock_status: StockStatus;
  unit_price: number | null;
}

export type CorrectionReason = "damaged" | "lost" | "count_correction" | "other";

export type MovementReason =
  | "order"
  | "cancel"
  | "pos_sale"
  | "return_good"
  | "arrival"
  | "correction"
  | "initial_stock"
  | "product_edit"
  | "payment_hold_release"
  | "unspecified";

export interface MovementItem {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_label: string | null;
  sku: string | null;
  reason_type: MovementReason;
  sub_reason: CorrectionReason | null;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  admin: { id: string; name: string } | null;
  order_id: string | null;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

export interface MovementFilters {
  product_id?: string;
  variant_id?: string;
  reason_type?: string;
  sub_reason?: string;
  admin_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface MovementListResponse {
  movements: MovementItem[];
  pagination: Pagination;
}

export interface ArrivalItem {
  id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_label: string | null;
  sku: string | null;
  quantity: number;
  supplier_name: string | null;
  batch_no: string | null;
  manufactured_on: string | null;
  expires_on: string | null;
  received_on: string;
  note: string | null;
  movement_id: string | null;
  created_by: { id: string; name: string } | null;
  created_at: string;
  /** Cost fields exist only for roles with products.view_cost. */
  unit_cost?: number;
  purchase_gst_rate?: number;
  gst_amount?: number;
  cost_with_gst?: number;
}

export interface ArrivalFilters {
  product_id?: string;
  variant_id?: string;
  supplier?: string;
  date_from?: string;
  date_to?: string;
  expiring_within_days?: number;
  page?: number;
  limit?: number;
}

export interface ArrivalListResponse {
  arrivals: ArrivalItem[];
  pagination: Pagination;
}

export interface CreateArrivalRequest {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  /** Without GST. */
  unit_cost: number;
  purchase_gst_rate?: number;
  supplier_name: string;
  batch_no?: string;
  manufactured_on?: string;
  expires_on?: string;
  received_on?: string;
  note?: string;
}

export interface CreateArrivalResponse {
  arrival: ArrivalItem;
  new_stock: number;
  cost_updated: boolean;
}

export interface ExpiringItem {
  arrival_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_label: string | null;
  sku: string | null;
  batch_no: string | null;
  supplier_name: string | null;
  expires_on: string;
  /** Negative when already expired. */
  days_left: number;
  remaining_quantity: number;
}

export interface ExpiringResponse {
  expiring: ExpiringItem[];
  days: number;
  pagination: Pagination;
}

export interface ReportFilterDef {
  name: string;
  label: string;
  type: "uuid" | "text" | "date" | "number";
  required?: boolean;
}

export interface ReportDef {
  key: string;
  title: string;
  description: string;
  needs_cost_permission: boolean;
  allowed: boolean;
  filters: ReportFilterDef[];
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

export interface CorrectStockRequest {
  product_id?: string;
  /** Set for variant rows. */
  variant_id?: string | null;
  /** Whole number, positive or negative, never 0. */
  quantity_change: number;
  reason: CorrectionReason;
  /** 3 to 300 characters; required for reason "other". */
  note?: string;
}

export interface CorrectStockResponse {
  message: string;
  previous_quantity: number;
  new_quantity: number;
  change: number;
}

const toQuery = (filters?: object): string => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

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
    return defaultAxios.get(
      `${API_ROUTES.INVENTORY.STOCK_LEVELS}${toQuery(filters)}`
    );
  },

  correctStock: async (
    data: CorrectStockRequest
  ): Promise<CorrectStockResponse> => {
    return defaultAxios.post(API_ROUTES.INVENTORY.CORRECTIONS, data);
  },

  getMovements: async (
    filters?: MovementFilters
  ): Promise<MovementListResponse> => {
    return defaultAxios.get(`${API_ROUTES.INVENTORY.MOVEMENTS}${toQuery(filters)}`);
  },

  getArrivals: async (filters?: ArrivalFilters): Promise<ArrivalListResponse> => {
    return defaultAxios.get(`${API_ROUTES.INVENTORY.ARRIVALS}${toQuery(filters)}`);
  },

  createArrival: async (
    data: CreateArrivalRequest
  ): Promise<CreateArrivalResponse> => {
    return defaultAxios.post(API_ROUTES.INVENTORY.ARRIVALS, data);
  },

  getExpiring: async (
    days?: number,
    page?: number,
    limit?: number
  ): Promise<ExpiringResponse> => {
    return defaultAxios.get(
      `${API_ROUTES.INVENTORY.EXPIRING}${toQuery({ days, page, limit })}`
    );
  },

  listReports: async (): Promise<ReportDef[]> => {
    const res: { reports: ReportDef[] } = await defaultAxios.get(
      API_ROUTES.INVENTORY.REPORTS
    );
    return res.reports;
  },

  /** The server answers with the .xlsx file; the axios client returns the Blob. */
  downloadReport: async (
    key: string,
    filters?: Record<string, string>
  ): Promise<Blob> => {
    const res = await defaultAxios.get(
      `${API_ROUTES.INVENTORY.REPORT_FILE(key)}${toQuery(filters)}`,
      { responseType: "blob" }
    );
    return res as unknown as Blob;
  },
};

export default inventoryService;
