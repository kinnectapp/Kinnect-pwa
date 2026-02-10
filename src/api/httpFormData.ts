/**
 * HTTP client for form data uploads with multipart/form-data content type
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { VITE_API_BASE_URL } from "@/env";
import { getAccessToken } from "./storage";
import { handleUnAuthenticatedError } from "./serviceUtils";

export const useHttpFormData = (): { http: AxiosInstance } => {
  const http = axios.create({
    baseURL: VITE_API_BASE_URL,
     headers: {
      "Content-Type": "multipart/form-data",
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

  // Response interceptor: Handle errors
  http.interceptors.response.use(
    (response) => response,
    (error) => {
      handleUnAuthenticatedError(error);
      return Promise.reject(error?.response ?? error);
    },
  );

  return { http };
};
