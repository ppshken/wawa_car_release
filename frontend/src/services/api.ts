import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wawa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('wawa_token');
      localStorage.removeItem('wawa_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("data:image")) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path.replace("http://localhost:5000", "http://localhost:5001");
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `http://localhost:5001${cleanPath}`;
};

export default api;
