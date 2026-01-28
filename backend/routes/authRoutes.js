const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/profile', authenticate, authController.getProfile);
router.post('/request-otp', authenticate, authController.requestOTP);
router.post('/verify-otp', authenticate, authController.verifyOTP);

module.exports = router;
