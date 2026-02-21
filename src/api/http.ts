/**
 * Shared HTTP client with auth token management and refresh-token retry.
 */

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { endpoints } from "@/api/endpoints";
import { API_BASE_URL } from "@/env";
import { useAuthStore } from "@/store/auth.store";
import {
  clearStorage,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./storage";
import { normalizeApiError } from "./serviceUtils";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const flushQueue = (error: unknown, token: string | null = null) => {
  queue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
      return;
    }
    resolve(token);
  });
  queue = [];
};

const shouldSkipRefresh = (config?: RetryableConfig): boolean => {
  const url = config?.url ?? "";
  const authExemptEndpoints = [
    endpoints.auth.login,
    endpoints.auth.register,
    endpoints.auth.refreshToken,
    endpoints.auth.forgotPassword,
    endpoints.auth.resetPassword,
    endpoints.auth.verifyOtp,
    endpoints.auth.verifyEmail,
    endpoints.auth.googleAuth,
    endpoints.auth.appleAuth,
    endpoints.users.changePassword,
  ];

  return authExemptEndpoints.some((endpoint) => url.includes(endpoint));
};

export const attachAuthInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const accessToken = await getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = (error.config ?? {}) as RetryableConfig;
      const status = error.response?.status;

      if (
        status !== 401 ||
        original._retry ||
        shouldSkipRefresh(original)
      ) {
        return Promise.reject(normalizeApiError(error));
      }

      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token) => {
              original.headers = original.headers ?? {};
              original.headers.Authorization = `Bearer ${token}`;
              resolve(client(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken =
          (await getRefreshToken()) || useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const { data } = await refreshClient.post(endpoints.auth.refreshToken, {
          token: refreshToken,
        });

        const tokenData = data?.data ?? data ?? {};
        const newAccessToken = tokenData.accessToken || tokenData.token;
        const newRefreshToken = tokenData.refreshToken || refreshToken;

        if (!newAccessToken) {
          throw new Error("Refresh token did not return a new access token");
        }

        await setAccessToken(newAccessToken);
        await setRefreshToken(newRefreshToken);

        const authStore = useAuthStore.getState();
        await authStore.setAccessToken(newAccessToken);
        await authStore.setRefreshToken(newRefreshToken);

        flushQueue(null, newAccessToken);

        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(original);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        const authStore = useAuthStore.getState();
        await authStore.logout();
        await clearStorage();
        window.location.href = "/auth/login";

        return Promise.reject(normalizeApiError(refreshError));
      } finally {
        isRefreshing = false;
      }
    },
  );
};

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

attachAuthInterceptors(http);

export const useHttp = (): { http: AxiosInstance } => ({ http });
