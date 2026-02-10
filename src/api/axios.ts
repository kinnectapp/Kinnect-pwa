import { VITE_API_BASE_URL } from "@/env"
import { useAuthStore } from "@/store/auth.store"
import axios from "axios"
import { clearStorage } from "./storage"



 
export const api = axios.create({
  baseURL: VITE_API_BASE_URL,
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
    const isLoginEndpoint = config?.url?.includes("/auth/login");
      if (!isLoginEndpoint) {
     const authStore = useAuthStore.getState();
         authStore.logout();
         clearStorage();
         window.location.href = "/auth/login";
    }
  }
    return Promise.reject(error)
  }
)
