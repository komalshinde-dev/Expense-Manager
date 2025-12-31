import axios from "axios";

const API = axios.create({
  baseURL: "https://expense-manager-backend-31gm.onrender.com/api",
});

API.interceptors.request.use((req) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (userInfo?.token) {
    req.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return req;
});

export default API;
