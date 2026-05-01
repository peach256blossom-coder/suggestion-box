import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  deanLogin: (data) => api.post('/auth/dean/login', data)
};

export const suggestionsAPI = {
  submitSuggestion: (data) => api.post('/suggestions/submit', data),
  getPublicSuggestions: () => api.get('/suggestions/public'),
  getUserSuggestions: () => api.get('/suggestions/my-suggestions'),
  getDepartmentSuggestions: (deptId) => api.get(`/suggestions/department/${deptId}`),
  upvoteSuggestion: (id) => api.put(`/suggestions/${id}/upvote`)
};

export const supportAPI = {
  getContactInfo: () => api.get('/support/contact-info'),
  createTicket: (data) => api.post('/support/ticket', data),
  getTickets: () => api.get('/support/tickets'),
  getTicketById: (id) => api.get(`/support/ticket/${id}`),
  addMessage: (id, data) => api.post(`/support/ticket/${id}/message`, data),
  sendSMS: (data) => api.post('/support/send-sms', data),
  sendWhatsApp: (data) => api.post('/support/send-whatsapp', data),
  getAllTickets: () => api.get('/support/admin/tickets'),
  updateTicketStatus: (id, data) => api.put(`/support/admin/ticket/${id}/status`, data),
  closeTicket: (id, data) => api.put(`/support/admin/ticket/${id}/close`, data),
  getSupportStats: () => api.get('/support/admin/stats')
};

export const adminAPI = {
  updateSuggestionStatus: (id, data) => api.put(`/admin/suggestions/${id}`, data)
};

export default api;