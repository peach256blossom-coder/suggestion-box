const express = require('express');
const {
  getAllSuggestions,
  updateSuggestionStatus,
  getDashboardStats,
  getDepartmentStats,
} = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/suggestions', auth, adminAuth, getAllSuggestions);
router.put('/suggestions/:suggestionId', auth, adminAuth, updateSuggestionStatus);
router.get('/stats', auth, adminAuth, getDashboardStats);
router.get('/department-stats/:departmentId', auth, adminAuth, getDepartmentStats);

module.exports = router;