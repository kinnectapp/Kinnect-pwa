import { API_BASE_URL } from "@/env"
import { useAuthStore } from "@/store/auth.store"
import axios from "axios"
import { clearStorage } from "./storage"
import { endpoints } from "./endpoints"
import { normalizeApiError } from "./serviceUtils"



 
export const api = axios.create({
  baseURL: API_BASE_URL,
   headers: {
    "Content-Type": "application/json"
  }
})

api.interceptors.request.use(
  (config) => {
    // Example: attach token
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const config = error.config;
      const url = config?.url ?? "";
      const exempt401Endpoints = [
        endpoints.auth.login,
        endpoints.users.changePassword,
      ];
      const isExempt401 = exempt401Endpoints.some((endpoint) =>
        url.includes(endpoint),
      );
      if (!isExempt401) {
     const authStore = useAuthStore.getState();
         authStore.logout();
         clearStorage();
         window.location.href = "/auth/login";
    }
  }
    return Promise.reject(normalizeApiError(error))
  }
)
