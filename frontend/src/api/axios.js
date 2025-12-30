import axios from "axios";

const instance = axios.create({
  baseURL: "https://expense-manager-backend-31gm.onrender.com/api",
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
