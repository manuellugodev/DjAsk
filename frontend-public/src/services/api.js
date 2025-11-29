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
  getActive: () => api.get('/polls', { params: { active: 'true' } }),

  getById: (id) => api.get(`/polls/${id}`),

  submitResponse: (id, answer) => api.post(`/polls/${id}/responses`, { answer }),
};

// Analytics APIs
export const analyticsAPI = {
  getPollAnalytics: (id) => api.get(`/analytics/${id}`),
};

export default api;
