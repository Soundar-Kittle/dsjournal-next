import axios from "axios";

const getToken = () => localStorage.getItem("token");

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 120_000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);
