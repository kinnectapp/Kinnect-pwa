/**
 * Service utilities for API error handling and common interceptor logic
 */

import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth.store";
import { clearStorage } from "./storage";

export const handleUnAuthenticatedError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    // Check if this is a login endpoint error (wrong credentials)
    // If so, don't auto-logout — let the mutation handle the error message
    const config = error.config;
    const isLoginEndpoint = config?.url?.includes("/auth/login");

    if (!isLoginEndpoint) {
      // For other 401s (expired token on protected routes), clear auth and logout
      const authStore = useAuthStore.getState();
      authStore.logout();
      clearStorage();
      // Optionally redirect to login for protected route 401s
      window.location.href = "/auth/login";
    }
    // If it IS the login endpoint (wrong password), just let the mutation's onError handle it
  }
};

export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    return (
      error.response.data?.message ||
      error.response.statusText ||
      "An error occurred"
    );
  } else if (error.request) {
    // Request made but no response received
    return "No response from server. Please check your connection.";
  } else {
    // Error in request setup
    return error.message || "An unexpected error occurred";
  }
};
