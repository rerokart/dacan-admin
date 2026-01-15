export const getLocalStorageItem = <T>(key: string, defaultValue: T | null = null): T | null => {
  try {
    if (typeof window === "undefined") return defaultValue;
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage item "${key}":`, error);
    return defaultValue;
  }
};

export const setLocalStorageItem = <T>(key: string, value: T): boolean => {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage item "${key}":`, error);
    return false;
  }
};

export const removeLocalStorageItem = (key: string): boolean => {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage item "${key}":`, error);
    return false;
  }
};

export const clearLocalStorage = (): boolean => {
  try {
    if (typeof window === "undefined") return false;
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
};

export const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === "undefined") return false;
    const testKey = "__localStorage_test__";
    window.localStorage.setItem(testKey, "test");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};
