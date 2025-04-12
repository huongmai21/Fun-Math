// src/services/authService.js
import api from './api';

// Đăng ký
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Đăng nhập
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Đăng xuất
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Lấy người dùng từ localStorage
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};