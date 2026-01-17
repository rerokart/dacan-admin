import axios from 'axios';
import { getToken, handleLogout } from '@/utils/helpers/token';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const defaultAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token to all requests
defaultAxios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If data is FormData, let axios set the Content-Type automatically (with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle success and errors
defaultAxios.interceptors.response.use(
  (response) => {
    if (response.data?.status === 1) return response.data;
    return Promise.reject(response.data);
  },
  (error) => {
    const { response } = error;

    // Handle 401 Unauthorized - token expired or invalid
    if (response?.status === 401) {
      handleLogout();
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    const message = response?.data?.message || response?.data || 'Something went wrong';
    return Promise.reject(new Error(typeof message === 'string' ? message : 'Something went wrong'));
  }
);
