import API from './axios';

// Register
export const register = async (userData) => {
  const res = await API.post('/auth/register', userData);
  if (res.data.token) {
    localStorage.setItem('userInfo', JSON.stringify(res.data));
  }
  return res.data;
};

// Login
export const login = async (userData) => {
  const res = await API.post('/auth/login', userData);
  if (res.data.token) {
    localStorage.setItem('userInfo', JSON.stringify(res.data));
  }
  return res.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem('userInfo');
};

// Get current user
export const getCurrentUser = async () => {
  const res = await API.get('/auth/me');
  return res.data;
};
