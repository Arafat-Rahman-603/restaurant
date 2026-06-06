import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach admin or customer JWT
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const isAdminRequest = config.url?.startsWith('/admin');
      const isAdminPage = window.location.pathname.startsWith('/admin');
      
      if (isAdminRequest || isAdminPage) {
        const token = localStorage.getItem('admin_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } else {
        const token = localStorage.getItem('customer_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
