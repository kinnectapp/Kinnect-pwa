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

// Single shared promise — all concurrent 401s wait on the same refresh, no boolean flag needed.
let refreshPromise: Promise<string> | null = null;

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

      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const storedRefreshToken =
              (await getRefreshToken()) || useAuthStore.getState().refreshToken;

            if (!storedRefreshToken) {
              throw new Error("No refresh token available");
            }

            const { data } = await refreshClient.post(
              endpoints.auth.refreshToken,
              { token: storedRefreshToken },
            );

            const tokenData = data?.data ?? data ?? {};
            const newAccessToken = tokenData.accessToken || tokenData.token;
            const newRefreshToken = tokenData.refreshToken || storedRefreshToken;

            if (!newAccessToken) {
              throw new Error("Refresh token did not return a new access token");
            }

            await setAccessToken(newAccessToken);
            await setRefreshToken(newRefreshToken);

            const authStore = useAuthStore.getState();
            await authStore.setAccessToken(newAccessToken);
            await authStore.setRefreshToken(newRefreshToken);

            return newAccessToken as string;
          } catch (refreshError) {
            const authStore = useAuthStore.getState();
            await authStore.logout();
            await clearStorage();
            window.location.href = "/auth/login";
            throw refreshError;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      try {
        const newAccessToken = await refreshPromise;
        return client({
          ...original,
          headers: {
            ...(original.headers ?? {}),
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      } catch (refreshError) {
        return Promise.reject(normalizeApiError(refreshError));
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
