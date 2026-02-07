const express = require('express');

const router = express.Router();

// ✅ FIX 1: Import the 'protect' middleware 
const { protect } = require('../middleware/authMiddleware');

// Import the functions from authController for signup/login
const { 
    sendOtp, 
    registerUser, 
    loginUser, 
    forgotPassword,
    verifyOtpAndResetPassword,
    resetPassword 
} = require('../controllers/authController');

// Import user functions from userController
const { 
    getUserDashboard,  
    getUserProfile,    
    getMyTimeline,     
    getMyOwnerContact, 
    generateCaptcha,  
    submitSupportTicket 
} = require('../controllers/userController');

// --- 1. SEND OTP ROUTE ---

// NEW: Call this when the user clicks "Send OTP" in the signup form

router.post('/send-otp', sendOtp);



// --- 2. SIGNUP/REGISTER ROUTE ---

// Points to exports.registerUser which now verifies OTP and saves 'phone' [cite: 2026-01-01]

router.post('/signup', registerUser);



// --- 3. LOGIN ROUTE ---

router.post('/login', loginUser);
router.get('/timeline', protect, getMyTimeline);       // Now visible in Network tab
router.get('/owner-contact', protect, getMyOwnerContact); // Now pulls PG details



// --- 4. FORGOT PASSWORD ---

router.post('/forgot-password', forgotPassword);



// --- 5. VERIFY OTP AND RESET PASSWORD (NEW OTP-based) ---

router.post('/verify-otp-reset', verifyOtpAndResetPassword);

// --- 6. RESET PASSWORD (Legacy token-based) ---

router.post('/reset-password/:token', resetPassword);

// --- 7. SUPPORT TICKET --- [cite: 2026-01-07]
// 2. ADD THIS ROUTE HERE
router.post('/support/submit', submitSupportTicket);


module.exports = router;