import { defaultAxios } from "@/utils/axios/default.axios";
import { API_ROUTES } from "@/utils/axios/apiEndPoint";

// Types
export interface User {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  profile_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
}

export interface UserDetails extends User {
  addresses?: {
    id: string;
    full_name: string;
    mobile: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    address_type: string;
    is_default: boolean;
  }[];
  recent_orders?: {
    id: string;
    order_number: string;
    total_amount: number;
    order_status: string;
    payment_status: string;
    created_at: string;
  }[];
}

export interface UserFilters {
  search?: string;
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

// API Response type
interface UsersApiResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  status: number;
}

// Service
export const userService = {
  getUsers: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
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
      ? `${API_ROUTES.USERS.LIST}?${queryString}`
      : API_ROUTES.USERS.LIST;
    const response: UsersApiResponse = await defaultAxios.get(url);
    return {
      data: response.users || [],
      total: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      limit: response.pagination?.limit || 10,
      total_pages: response.pagination?.total_pages || 1,
    };
  },

  getUserById: async (id: string | number): Promise<UserDetails> => {
    return defaultAxios.get(API_ROUTES.USERS.GET(id));
  },

  blockUser: async (id: string | number): Promise<User> => {
    return defaultAxios.put(API_ROUTES.USERS.BLOCK(id), { is_active: false });
  },

  unblockUser: async (id: string | number): Promise<User> => {
    return defaultAxios.put(API_ROUTES.USERS.BLOCK(id), { is_active: true });
  },

  updateUser: async (
    id: string | number,
    data: Partial<{ full_name: string; mobile: string; is_active: boolean }>
  ): Promise<User> => {
    return defaultAxios.put(API_ROUTES.USERS.UPDATE(id), data);
  },
};

export default userService;
