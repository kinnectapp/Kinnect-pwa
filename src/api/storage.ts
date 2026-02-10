/**
 * Storage utility for managing auth tokens and user data in localStorage
 */

export const StorageKeys = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  EMAIL: "email",
} as const;

export const setItem = async (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error("Error setting item in localStorage:", error);
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error("Error getting item from localStorage:", error);
    return null;
  }
};

export const removeItem = async (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing item from localStorage:", error);
  }
};

export const clearStorage = async () => {
  try {
    Object.values(StorageKeys).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};

export const getUser = async () => {
  try {
    const user = await getItem(StorageKeys.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
};

export const setUser = async (user: any) => {
  try {
    await setItem(StorageKeys.USER, JSON.stringify(user));
  } catch (error) {
    console.error("Error setting user in localStorage:", error);
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return await getItem(StorageKeys.ACCESS_TOKEN);
};

export const setAccessToken = async (token: string) => {
  await setItem(StorageKeys.ACCESS_TOKEN, token);
};

export const getRefreshToken = async (): Promise<string | null> => {
  return await getItem(StorageKeys.REFRESH_TOKEN);
};

export const setRefreshToken = async (token: string) => {
  await setItem(StorageKeys.REFRESH_TOKEN, token);
};

export const getEmail = async (): Promise<string | null> => {
  return await getItem(StorageKeys.EMAIL);
};

export const setEmail = async (email: string) => {
  await setItem(StorageKeys.EMAIL, email);
};
