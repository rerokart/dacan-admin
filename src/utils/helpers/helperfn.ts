type DateInput = string | number | Date;
type DateFormatType = "short" | "long" | "medium" | "time" | "datetime";

// Formatting dates
export const formatDate = (date: DateInput, format: DateFormatType = "medium"): string => {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const options: Record<DateFormatType, Intl.DateTimeFormatOptions> = {
    short: { year: "numeric", month: "short", day: "numeric" },
    long: { year: "numeric", month: "long", day: "numeric", weekday: "long" },
    medium: { year: "numeric", month: "short", day: "numeric" },
    time: { hour: "2-digit", minute: "2-digit" },
    datetime: {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  };

  return dateObj.toLocaleDateString("en-US", options[format] || options.medium);
};

// Get relative time from a date
export const getRelativeTime = (date: DateInput): string => {
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};

// Check if a date is today
export const isToday = (date: DateInput): boolean => {
  if (!date) return false;
  const dateObj = new Date(date);
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

// Add days to a date
export const addDays = (date: DateInput, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Truncate text to a specified length with an optional suffix
export const truncateText = (text: string, maxLength = 100, suffix = "..."): string => {
  if (!text || typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
};

// Convert string to slug format
export const slugify = (text: string): string => {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Extract initials from name
export const getInitials = (name: string, maxInitials = 2): string => {
  if (!name || typeof name !== "string") return "";
  return name
    .split(" ")
    .filter((word) => word.length > 0)
    .slice(0, maxInitials)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

// Capitalize first letter of each word
export const capitalizeWords = (text: string): string => {
  if (!text || typeof text !== "string") return "";
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Format number with commas
export const formatNumber = (num: number): string => {
  if (typeof num !== "number" || isNaN(num)) return "";
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

// Generate random number between min and max
export const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Remove duplicates from array
export const removeDuplicates = <T>(array: T[], key: keyof T | null = null): T[] => {
  if (!Array.isArray(array)) return [];

  if (key) {
    const seen = new Set();
    return array.filter((item) => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  return [...new Set(array)];
};

// Check if object is empty
export const isEmpty = (obj: unknown): boolean => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return false;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== "string") return false;
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ""));
};

// Validate URL format
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Format URL with proper protocol for external links
export const formatExternalUrl = (url: string): string => {
  if (!url || typeof url !== "string") return url;

  // If URL already has a protocol, return as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Add https:// protocol for external URLs
  return `https://${url}`;
};

// Generate random ID
export const generateId = (length = 8): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Download file from URL
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate random hex color
export const randomColor = (): string => {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
};
