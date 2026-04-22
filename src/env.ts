export const {
  VITE_API_BASE_URL,
  VITE_KINNECT_APP_STORE_SECRET,
  VITE_CURRENT_PROJECT_VERSION,
  VITE_GOOGLE_AUTH_API,
  VITE_GOOGLE_WEB_CLIENT_ID,
  VITE_GOOGLE_IOS_CLIENT_ID,
  VITE_STREAM_API_KEY,
  VITE_GEMINI_API_KEY,
} = (import.meta as any).env;

// Provide defaults or ensure values are defined
export const API_BASE_URL =
  VITE_API_BASE_URL || "http://localhost:4500";
export const APP_STORE_SECRET = VITE_KINNECT_APP_STORE_SECRET || "";
export const PROJECT_VERSION = VITE_CURRENT_PROJECT_VERSION || "30";
export const GOOGLE_AUTH_API =
  VITE_GOOGLE_AUTH_API || "https://www.googleapis.com";
export const GOOGLE_WEB_CLIENT_ID = VITE_GOOGLE_WEB_CLIENT_ID || "";
export const GOOGLE_IOS_CLIENT_ID = VITE_GOOGLE_IOS_CLIENT_ID || "";
export const STREAM_API_KEY = VITE_STREAM_API_KEY || "";
export const GEMINI_API_KEY = VITE_GEMINI_API_KEY || "";
