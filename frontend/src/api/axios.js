import axios from "axios";

const instance = axios.create({
  baseURL: "http://expense-manager-backend.onrender.com/api",
});

// 🔥 ATTACH TOKEN TO EVERY REQUEST
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // MUST exist after login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
