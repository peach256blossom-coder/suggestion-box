const express = require('express');
const { 
  register, 
  login, 
  getCurrentUser,
  deanLogin,
  registerDean,
  getCurrentDean
} = require('../controllers/authController');
const { auth, deanAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getCurrentUser);

// Dean routes
router.post('/dean/login', deanLogin);
router.post('/dean/register', registerDean); // Admin only
router.get('/dean/me', auth, getCurrentDean);

module.exports = router;