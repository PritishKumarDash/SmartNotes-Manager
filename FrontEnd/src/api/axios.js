import axios from "axios";

const API = axios.create({
  baseURL: "https://smartnotes-manager.onrender.com"
  withCredentials: true,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      if (!url.includes("/api/auth/me")) {
        localStorage.removeItem("token");
      }
    }
    return Promise.reject(error);
  }
);

export default API;
