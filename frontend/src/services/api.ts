import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

const api = axios.create({
  baseURL: BASE_URL,
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

  if (path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
      .replace("http://187.127.216.219", "https://www.wawa-car-release.cloud")
      .replace("http://localhost:5000", "https://www.wawa-car-release.cloud")
      .replace("http://localhost:5001", "https://www.wawa-car-release.cloud");
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return cleanPath;
};

export default api;
