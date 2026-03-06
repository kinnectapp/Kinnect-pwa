/**
 * Service utilities for API error handling and common interceptor logic
 */

import { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth.store";
import { clearStorage } from "./storage";

export const handleUnAuthenticatedError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    // Exempt endpoints where 401 is a business error (not session expiry).
    const config = error.config;
    const url = config?.url ?? "";
    const exempt401Endpoints = ["/auth/login", "/profile/password/change"];
    const isExempt401 = exempt401Endpoints.some((endpoint) =>
      url.includes(endpoint),
    );

    if (!isExempt401) {
      // For other 401s (expired token on protected routes), clear auth and logout
      const authStore = useAuthStore.getState();
      authStore.logout();
      clearStorage();
      // Optionally redirect to login for protected route 401s
      window.location.href = "/auth/login";
    }
    // If endpoint is exempt (e.g. wrong old password), let mutation onError handle it.
  }
};

const formatApiMessage = (message: unknown): string => {
  if (Array.isArray(message)) {
    return message.filter(Boolean).join(", ");
  }

  if (typeof message === "string") {
    return message;
  }

  if (message && typeof message === "object") {
    return Object.values(message as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value): value is string => typeof value === "string")
      .join(", ");
  }

  return "";
};

const extractApiErrorMessage = (data: any): string => {
  if (!data || typeof data !== "object") {
    return "";
  }

  const messageFromMessage = formatApiMessage(data.message);
  if (messageFromMessage) {
    return messageFromMessage;
  }

  return typeof data.error === "string" ? data.error : "";
};

export const normalizeApiError = (error: any): any => {
  if (error?.response?.data) {
    const normalizedMessage = extractApiErrorMessage(error.response.data);

    if (normalizedMessage) {
      error.response.data.message = normalizedMessage;
      error.message = normalizedMessage;
    }
  }

  return error;
};

export const handleApiError = (error: any): string => {
  const normalizedError = normalizeApiError(error);
console.log("normalizedError",error);

  if (normalizedError.response) {
    // Server responded with error status
    const serverMessage = extractApiErrorMessage(normalizedError.response.data);

    return (
      serverMessage ||
      normalizedError.response.statusText ||
      "An error occurred"
    );
  } else if (normalizedError.request) {
    // Request made but no response received
    return "No response from server. Please check your connection.";
  } else {
    // Error in request setup
    return normalizedError.message || "An unexpected error occurred";
  }
};
