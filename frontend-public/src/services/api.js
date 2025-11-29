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

// Poll APIs
export const pollAPI = {
  getActive: () => api.get('/polls', { params: { active: 'true' } }),

  getById: (id) => api.get(`/polls/${id}`),

  submitResponse: (id, answer) => api.post(`/polls/${id}/responses`, { answer }),
};

// Analytics APIs
export const analyticsAPI = {
  getPollAnalytics: (id) => api.get(`/analytics/${id}`),
};

export default api;
