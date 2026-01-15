import axios from 'axios';
import { getToken, handleLogout } from '../helpers/token';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const userAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add bearer token
userAxios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    const { response } = error;
    if (response?.status === 401) {
      handleLogout();
      return Promise.reject({ message: "Session expired. Please login again." });
    }
    const message = response?.data || "Something Went Wrong";
    return Promise.reject(error);
  }
);

userAxios.interceptors.response.use(
  (response) => {
    if (response.data?.status === 1) return response.data;
    return Promise.reject(response.data);
  },
  (error) => {
    const { response } = error;

    const message = response?.data || 'Something Went Wrong';
    return Promise.reject(message);
  }
);
