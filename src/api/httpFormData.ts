/**
 * HTTP client for form data uploads with multipart/form-data content type
 */

import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "@/env";
import { attachAuthInterceptors } from "./http";

export const useHttpFormData = (): { http: AxiosInstance } => {
  const httpFormData = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  attachAuthInterceptors(httpFormData);

  return { http: httpFormData };
};
