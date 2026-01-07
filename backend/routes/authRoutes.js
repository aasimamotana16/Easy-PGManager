const express = require('express');
const router = express.Router();
// Import the functions from your controller
const { 
    registerUser, 
    loginUser, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/authController');

// --- 1. SIGNUP ROUTE ---
// Points to exports.registerUser in authController.js
router.post('/signup', registerUser);

// --- 2. LOGIN ROUTE ---
// Points to exports.loginUser in authController.js
router.post('/login', loginUser);

// --- 3. FORGOT PASSWORD ---
// Points to exports.forgotPassword in authController.js
router.post('/forgot-password', forgotPassword);

// --- 4. RESET PASSWORD ---
// Points to exports.resetPassword in authController.js
router.post('/reset-password/:token', resetPassword);

module.exports = router;