import axios from "axios";
import storage from "../utils/storage";

// Create axios with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 - Unauthorized
      if (error.response.status === 401) {
        storage.clear();
        window.location.href = "/login";
      }

      // Return error message from backend
      const message = error.response.data?.message || "An error occurred";
      return Promise.reject(new Error(message));
    }

    // Network error
    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timeout"));
    }

    return Promise.reject(
      new Error("Network error. Please check your connection.")
    );
  }
);

export default api;
