import { create } from "zustand";
import { User } from "@/lib/types/auth";
import {
  setAccessToken,
  setRefreshToken,
  setUser as setUserStorage,
  clearStorage,
  getAccessToken,
  getRefreshToken,
  getUser as getUserStorage,
} from "@/api/storage";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setAccessToken: (token: string) => Promise<void>;
  setRefreshToken: (token: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  login: (
    user: User,
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: async (user: User | null) => {
    if (user) {
      await setUserStorage(user);
    }
    set({ user, isAuthenticated: !!user });
  },

  setTokens: async (accessToken: string, refreshToken: string) => {
    await setAccessToken(accessToken);
    await setRefreshToken(refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  setAccessToken: async (token: string) => {
    await setAccessToken(token);
    set({ accessToken: token });
  },

  setRefreshToken: async (token: string) => {
    await setRefreshToken(token);
    set({ refreshToken: token });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  login: async (user: User, accessToken: string, refreshToken: string) => {
    await setUserStorage(user);
    await setAccessToken(accessToken);
    await setRefreshToken(refreshToken);
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await clearStorage();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  initializeAuth: async () => {
    try {
      const [storedUser, storedAccessToken, storedRefreshToken] =
        await Promise.all([
          getUserStorage(),
          getAccessToken(),
          getRefreshToken(),
        ]);

      if (storedUser && storedAccessToken) {
        set({
          user: storedUser,
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
    }
  },
}));
