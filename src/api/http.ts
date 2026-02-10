/**
 * HTTP client with request/response interceptors for auth token management
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { VITE_API_BASE_URL } from "@/env";
import { getAccessToken } from "./storage";
import { handleUnAuthenticatedError, handleApiError } from "./serviceUtils";

export const useHttp = (): { http: AxiosInstance } => {
  const http = axios.create({
    baseURL: VITE_API_BASE_URL,
     headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor: Attach access token to all requests
  http.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const accessToken = await getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor: Handle errors and token refresh
  http.interceptors.response.use(
    (response) => response,
    (error) => {
      handleUnAuthenticatedError(error);
      return Promise.reject(error);
    },
  );

  return { http };
};
