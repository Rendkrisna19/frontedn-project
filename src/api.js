import axios from "axios";

export const API_BASE = "http://127.0.0.1:8000/api"; // sesuaikan

const api = axios.create({ baseURL: API_BASE, withCredentials: false });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
