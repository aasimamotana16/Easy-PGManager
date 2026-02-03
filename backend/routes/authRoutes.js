const express = require('express');

const router = express.Router();



// ✅ FIX 1: Import the 'protect' middleware 

// This is what was causing the "protect is not defined" crash.

const { protect } = require('../middleware/authMiddleware');

// Import the functions from your controller [cite: 2026-01-06]

const { 

    sendOtp, // ADDED: For the OTP email logic
    registerUser, 
    loginUser, 
    getUserDashboard,  // Added
    getUserProfile,    // Added
    getMyTimeline,     // ✅ Fixes the "nothing in network" issue
    getMyOwnerContact, // ✅ Fixes the "Owner Not Available" issue
    forgotPassword, 
    resetPassword,
    generateCaptcha,  // ADDED: Custom CAPTCHA generation
    submitSupportTicket // 1. ADD THIS TO THE IMPORT LIST

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



// --- 5. RESET PASSWORD ---

router.post('/reset-password/:token', resetPassword);

// --- 6. SUPPORT TICKET --- [cite: 2026-01-07]
// 2. ADD THIS ROUTE HERE
router.post('/support/submit', submitSupportTicket);


module.exports = router;