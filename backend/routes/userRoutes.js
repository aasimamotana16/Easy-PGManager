const express = require("express");
const router = express.Router();

// Import controllers from userController
const { 
  registerUser, 
  loginUser,
  logoutUser, 
  updateProfilePicture, 
  removeProfilePicture, 
  getUserDashboard, 
  getMe,
  getUserProfile,
  getMyAgreement,
  getMyDocuments,
  uploadUserDocument,
  deleteUserDocument,
  getMyOwnerContact,
  getMyTimeline,
  downloadTenantReport,
  sendOtp,
  verifyOtpAndRegister,
  getMyCheckIns,
  createCheckIn,
  verifySecurityAction 
} = require("../controllers/userController");

// Import the new profile controller functions
const { 
  getProfile,
  updateProfile,
  getPersonalProfile,
  getAcademicProfile, 
  getEmergencyProfile, 
  getPaymentProfile 
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

/* =========================
    PUBLIC ROUTES
========================= */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp-register", verifyOtpAndRegister);

/* =========================
    PROTECTED ROUTES (Token Required)
========================= */
// Dashboard & Core User Data
router.get("/dashboard-stats", protect, getUserDashboard);
// Use getUserProfile so frontend /users/me receives profilePicture & completion
router.get("/me", protect, getUserProfile);
router.post("/send-otp", protect, sendOtp);
router.post("/logout", protect, logoutUser);

/* =========================
    PROFILE ROUTES (Order is Critical)
========================= */
// 1. Static Section Routes FIRST (Prevents "academic" being treated as a userId) [cite: 2026-01-01]
router.get("/profile/personal", protect, getPersonalProfile);
router.get("/profile/academic", protect, getAcademicProfile);
router.get("/profile/emergency", protect, getEmergencyProfile);
router.get("/profile/payment", protect, getPaymentProfile);

// 2. Dynamic ID Path SECOND
// Static "me" route so frontend can call /users/profile/me without treating "me" as a userId
router.get("/profile/me", protect, getProfile);
router.get("/profile/:userId", protect, getProfile); 

// 3. Profile Updates & Images
router.put("/profile/update", protect, updateProfile); // Changed to .put to align with standard API practices [cite: 2026-01-01]
router.post("/profile/picture", protect, upload.single("image"), updateProfilePicture);
router.delete("/profile/picture", protect, removeProfilePicture);

/* =========================
    DOCUMENTS & AGREEMENTS
========================= */
router.get("/agreement", protect, getMyAgreement);
router.get("/documents", protect, getMyDocuments);
router.post("/upload-doc", protect, upload.single("document"), uploadUserDocument);
router.post("/delete-doc", protect, deleteUserDocument);
router.get("/download-report", protect, downloadTenantReport);

/* =========================
    ACTIVITY & CONTACTS
========================= */
router.get("/my-owner-contact", protect, getMyOwnerContact);
router.get("/timeline", protect, getMyTimeline);
router.get("/my-checkins", protect, getMyCheckIns);
router.post("/checkin-action", protect, createCheckIn);

/* =========================
    SECURITY
========================= */
router.post("/verify-security", protect, verifySecurityAction);

module.exports = router;