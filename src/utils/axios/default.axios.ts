import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const defaultAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

defaultAxios.interceptors.response.use(
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
