import axios from "axios";

// In production (Vercel), VITE_API_URL must be set to the Render backend URL.
// The fallback below ensures local development still works out of the box.
const BASE_URL = import.meta.env.VITE_API_URL || "https://basicvotingsystem.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

// Attach stored JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("auth-token");
      if (!window.location.pathname.includes("/verify")) {
        window.location.href = "/verify";
      }
    }
    return Promise.reject(err);
  }
);

export default api;

