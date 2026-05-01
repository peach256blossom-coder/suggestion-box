const express = require('express');
const {
  submitSuggestion,
  getPublicSuggestions,
  getUserSuggestions,
  getDepartmentSuggestions,
  upvoteSuggestion,
  respondToSuggestion,
  getNotifications,
  markNotificationAsRead,
  getSuggestionsByCategory,
  getSuggestionsByStatus,
  getAllSuggestions,
  getDashboardStats,
  getSuggestionById,
  deleteSuggestion,
  getTrendingSuggestions,
  getSuggestionsCount
} = require('../controllers/suggestionController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Suggestion submission and user routes
router.post('/submit', auth, submitSuggestion);
router.get('/public', auth, getPublicSuggestions);
router.get('/my-suggestions', auth, getUserSuggestions);
router.get('/department/:departmentId', auth, getDepartmentSuggestions);
router.put('/:suggestionId/upvote', auth, upvoteSuggestion);
router.put('/:suggestionId/respond', auth, respondToSuggestion);
router.get('/notifications', auth, getNotifications);
router.put('/notifications/:notificationId/read', auth, markNotificationAsRead);
router.get('/category/:category', auth, getSuggestionsByCategory);

// Admin-only suggestion routes
router.get('/status/:status', auth, adminAuth, getSuggestionsByStatus);
router.get('/', auth, adminAuth, getAllSuggestions);
router.get('/stats', auth, adminAuth, getDashboardStats);

// Public suggestion helpers
router.get('/trending', auth, getTrendingSuggestions);
router.get('/count', auth, getSuggestionsCount);
router.get('/:suggestionId', auth, getSuggestionById);
router.delete('/:suggestionId', auth, deleteSuggestion);

module.exports = router;
