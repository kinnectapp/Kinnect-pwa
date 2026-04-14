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

type AuthUserInput = Partial<User> & Pick<User, "id" | "email">;

const normalizeUser = (user: AuthUserInput): User => {
  const now = new Date().toISOString();

  return {
    ...user,
    id: user.id,
    email: user.email,
    firstname: typeof user.firstname === "string" ? user.firstname : "",
    lastname: typeof user.lastname === "string" ? user.lastname : "",
    username: typeof user.username === "string" ? user.username : "",
    gender: typeof user.gender === "string" ? user.gender : "",
    dob: typeof user.dob === "string" ? user.dob : "",
    phone: typeof user.phone === "string" ? user.phone : "",
    createdAt: typeof user.createdAt === "string" ? user.createdAt : now,
    updatedAt: typeof user.updatedAt === "string" ? user.updatedAt : now,
  };
};

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUserInput | null) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setAccessToken: (token: string) => Promise<void>;
  setRefreshToken: (token: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  login: (
    user: AuthUserInput,
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
  isLoading: true,

  setUser: async (user: AuthUserInput | null) => {
    const normalizedUser = user ? normalizeUser(user) : null;
    if (user) {
      await setUserStorage(normalizedUser);
    }
    set({ user: normalizedUser, isAuthenticated: !!normalizedUser });
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

  login: async (
    user: AuthUserInput,
    accessToken: string,
    refreshToken: string,
  ) => {
    const normalizedUser = normalizeUser(user);
    await setUserStorage(normalizedUser);
    await setAccessToken(accessToken);
    await setRefreshToken(refreshToken);
    set({
      user: normalizedUser,
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
    set({ isLoading: true });
    try {
      const [storedUser, storedAccessToken, storedRefreshToken] =
        await Promise.all([
          getUserStorage(),
          getAccessToken(),
          getRefreshToken(),
        ]);

      if (storedUser && storedAccessToken) {
        const normalizedStoredUser =
          storedUser?.id && storedUser?.email
            ? normalizeUser(storedUser as AuthUserInput)
            : null;

        if (!normalizedStoredUser) {
          await clearStorage();
          set({ isLoading: false });
          return;
        }

        set({
          user: normalizedStoredUser,
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
