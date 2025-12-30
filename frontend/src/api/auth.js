import axios from 'axios';

const AUTH_URL = 'https://expense-manager-backend-31gm.onrender.com/api';

// Register user
export const register = async (userData) => {
  const res = await axios.post(`${AUTH_URL}/register`, userData, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.data.token) {
    localStorage.setItem('user', JSON.stringify(res.data));
    localStorage.setItem('token', res.data.token);
  }
  return res.data;
};

// Login user
export const login = async (userData) => {
  const res = await axios.post(`${AUTH_URL}/login`, userData, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.data.token) {
    localStorage.setItem('user', JSON.stringify(res.data));
    localStorage.setItem('token', res.data.token);
  }
  return res.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Get current user (authenticated route)
export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${AUTH_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
