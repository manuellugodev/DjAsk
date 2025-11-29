import axios from 'axios';

// In Docker, connect directly to localhost:5000 from browser
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
