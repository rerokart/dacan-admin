import Cookies from "js-cookie";
import { ACCESS_TOKEN_NAME } from "../constants/enums";

const USER_DATA_KEY = "admin_user";

export interface StoredUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export const setTokens = ({ accessToken, expiresAt = 144 }: { accessToken: string; expiresAt?: number }) => {
  if (typeof window === "undefined") return;
  const expiresInDays = Number(expiresAt) / 24;

  Cookies.set(ACCESS_TOKEN_NAME, accessToken, {
    expires: expiresInDays,
    path: "/",
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });
};

export const setUserData = (user: StoredUser) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

export const getUserData = (): StoredUser | null => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(USER_DATA_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as StoredUser;
  } catch {
    return null;
  }
};

export const getToken = () => {
  if (typeof window === "undefined") return null;

  return Cookies.get(ACCESS_TOKEN_NAME) || null;
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;

  const token = getToken();
  return Boolean(token);
};

export const removeToken = () => {
  if (typeof window === "undefined") return;

  Cookies.remove(ACCESS_TOKEN_NAME, { path: "/" });
};

export function clearCookies() {
  if (typeof window === "undefined") return;

  const allCookies = Cookies.get();
  Object.keys(allCookies).forEach((cookieName) => {
    Cookies.remove(cookieName, { path: "/" });
    Cookies.remove(cookieName);
  });
}

export const handleLogout = () => {
  if (typeof window === "undefined") return;

  localStorage.clear();
  clearCookies();
  window.location.href = "/signin";
};

export const refreshToken = (newToken: string, expiresAt = 144) => {
  removeToken();
  setTokens({ accessToken: newToken, expiresAt });
};

export const isTokenExpired = () => {
  return !isAuthenticated();
};
