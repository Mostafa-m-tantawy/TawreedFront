import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const apiUrl = "http://tawreedbackend.test/api/"; // process.env.NEXT_PUBLIC_API_URL

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    const tenantId = localStorage.getItem("tenantId");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers["X-Tenant"] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && typeof window !== "undefined") {
      const status = error.response.status;
      const authStore = useAuthStore.getState();

      if (status === 401) {
        authStore.logout?.();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const setApiLanguage = (locale: string) => {
  api.defaults.headers.common["Accept-Language"] = locale;
};

export default api;
