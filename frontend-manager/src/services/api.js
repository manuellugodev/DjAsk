import axios from 'axios';

// Dynamically use the same host that served the page, but port 5000 for API
// This works both for localhost and network IP (e.g., 192.168.1.72)
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const hostname = window.location.hostname;
  return `http://${hostname}:5000/api`;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('djask_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('djask_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout'),
};

// Poll APIs
export const pollAPI = {
  getAll: (activeOnly = false) => {
    const params = activeOnly ? { active: 'true' } : {};
    return api.get('/polls', { params });
  },

  getById: (id) => api.get(`/polls/${id}`),

  create: (pollData) => api.post('/polls/', pollData),

  update: (id, pollData) => api.put(`/polls/${id}`, pollData),

  delete: (id) => api.delete(`/polls/${id}`),

  getResponses: (id) => api.get(`/polls/${id}/responses`),
};

// Analytics APIs
export const analyticsAPI = {
  getPollAnalytics: (id) => api.get(`/analytics/${id}`),

  getSummary: () => api.get('/analytics/summary'),
};

export default api;
