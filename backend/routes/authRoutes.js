const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Forgot Password Routes (Public)
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOTP);
router.post('/reset-password', authController.resetPassword);

// Protected routes (require authentication)
router.get('/profile', authenticate, authController.getProfile);
router.post('/request-otp', authenticate, authController.requestOTP);
router.post('/verify-otp', authenticate, authController.verifyOTP);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
