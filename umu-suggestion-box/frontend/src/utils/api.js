import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  deanLogin: (data) => api.post('/auth/dean/login', data),
  registerDean: (data) => api.post('/auth/dean/register', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Suggestions endpoints
export const suggestionsAPI = {
  getPublicSuggestions: () => api.get('/suggestions/public'),
  submitSuggestion: (data) => api.post('/suggestions/submit', data),
  getUserSuggestions: () => api.get('/suggestions/my-suggestions'),
  getDepartmentSuggestions: (departmentId) =>
    api.get(`/suggestions/department/${departmentId}`),
  upvoteSuggestion: (suggestionId) =>
    api.put(`/suggestions/${suggestionId}/upvote`),
  respondToSuggestion: (suggestionId, data) =>
    api.put(`/suggestions/${suggestionId}/respond`, data),
};

// Notifications endpoints
export const notificationsAPI = {
  getNotifications: () => api.get('/suggestions/notifications'),
  markAsRead: (notificationId) =>
    api.put(`/suggestions/notifications/${notificationId}/read`),
};

// Admin endpoints
export const adminAPI = {
  getAllSuggestions: () => api.get('/admin/suggestions'),
  updateSuggestionStatus: (suggestionId, data) =>
    api.put(`/admin/suggestions/${suggestionId}`, data),
  getDashboardStats: () => api.get('/admin/stats'),
  getDepartmentStats: (departmentId) =>
    api.get(`/admin/department-stats/${departmentId}`),
};

// Support/Chat endpoints
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

// Dean endpoints
export const deanAPI = {
  getAllSuggestions: () => api.get('/dean/suggestions'),
  getSuggestionsByStatus: (status) => api.get(`/dean/suggestions/status/${status}`),
  respondToSuggestion: (id, data) => api.put(`/dean/suggestions/${id}/respond`, data),
};

export default api;