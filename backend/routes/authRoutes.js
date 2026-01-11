const express = require('express');
const router = express.Router();
// Import the functions from your controller [cite: 2026-01-06]
const { 
    sendOtp, // ADDED: For the OTP email logic
    registerUser, 
    loginUser, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/authController');

// --- 1. SEND OTP ROUTE ---
// NEW: Call this when the user clicks "Send OTP" in the signup form
router.post('/send-otp', sendOtp);

// --- 2. SIGNUP/REGISTER ROUTE ---
// Points to exports.registerUser which now verifies OTP and saves 'phone' [cite: 2026-01-01]
router.post('/signup', registerUser);

// --- 3. LOGIN ROUTE ---
router.post('/login', loginUser);

// --- 4. FORGOT PASSWORD ---
router.post('/forgot-password', forgotPassword);

// --- 5. RESET PASSWORD ---
router.post('/reset-password/:token', resetPassword);

module.exports = router;