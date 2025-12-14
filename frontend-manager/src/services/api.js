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

// Debug: Log the API URL being used
console.log('[DEBUG] API Base URL:', API_BASE_URL);
console.log('[DEBUG] VITE_API_URL env:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
