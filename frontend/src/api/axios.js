import axios from 'axios';

// Axios instance for authenticated requests
const API = axios.create({
  baseURL: 'https://expense-manager-backend-31gm.onrender.com/api',
});

// Add Authorization header if token exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;

// Example functions using this instance:
export const fetchStock = (symbol) => API.get(`/stocks/${symbol}`);
export const getPortfolio = () => API.get('/portfolios');
export const addStock = (data) => API.post('/portfolios', data);
export const removeStock = (id) => API.delete(`/portfolios/${id}`);
