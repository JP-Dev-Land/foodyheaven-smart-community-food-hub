import axios from 'axios';
import { clearToken, getToken } from '../utils/localStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add JWT token to headers if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor : Handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Example: Redirect to login or trigger token refresh logic
      console.error('Unauthorized! Redirecting to login...');
      // Potentially clear token and redirect:
      clearToken(); 
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export default api;