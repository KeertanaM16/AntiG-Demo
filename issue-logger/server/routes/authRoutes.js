const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshAccessToken);

// Protected routes
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;
