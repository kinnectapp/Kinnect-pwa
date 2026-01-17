import { VITE_API_BASE_URL } from "@/env"
import axios from "axios"

export const api = axios.create({
  baseURL: VITE_API_BASE_URL,
  timeout: 15000,
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
      // logout and redirect, to be implemented
    }
    return Promise.reject(error)
  }
)
