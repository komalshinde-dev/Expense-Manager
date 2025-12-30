import axios from 'axios';

// Axios instance for authenticated requests
const API = axios.create({
  baseURL: 'https://expense-manager-backend-31gm.onrender.com/api',
});

// Add Authorization header if token exists
API.interceptors.request.use((req) => {
  const userInfo = JSON.parse(localStorage.getItem('user'));
  if (userInfo?.token) {
    req.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return req;
});

export default API;

// Example functions using this instance:
export const fetchStock = (symbol) => API.get(`/stocks/${symbol}`);
export const getPortfolio = () => API.get('/portfolios');
export const addStock = (data) => API.post('/portfolios', data);
export const removeStock = (id) => API.delete(`/portfolios/${id}`);
