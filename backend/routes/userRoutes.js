const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  updateProfilePicture, // Added for Upload Picture button [cite: 2026-01-07]
  removeProfilePicture, // Added for Remove Picture button [cite: 2026-01-07]
  getUserDashboard, 
  getMe,
  getMyAgreement,
  getMyDocuments,
  uploadUserDocument,
  getMyOwnerContact,
  getMyTimeline,
  sendOtp,              // <--- ADD THIS
  verifyOtpAndRegister // <--- ADD THIS HERE [cite: 2026-01-07]
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // Your Multer config [cite: 2026-01-06]

// --- Public Routes (No token needed) ---
router.post("/register", registerUser);
router.post("/login", loginUser);
// In userRoutes.js
router.post("/send-otp", sendOtp);
router.post("/verify-otp-register", verifyOtpAndRegister);

// --- Protected Routes (Token required) ---
// Route for the main dashboard data
router.get("/dashboard-stats", protect, getUserDashboard);

// Route for the profile page
router.get("/profile", protect, getUserProfile);

// PUT: Handles the "Edit Info" button clicks to save to DB [cite: 2026-01-07]
router.put("/profile/update", protect, updateUserProfile);

// Routes for Profile Picture management [cite: 2026-01-07]
// Matches the "Upload Picture" button - uses Multer for the 'image' field
router.post("/profile/picture", protect, upload.single("image"), updateProfilePicture);

// Matches the "Remove Picture" button
router.delete("/profile/picture", protect, removeProfilePicture);

// This allows ANY logged-in user (Owner, Tenant, or Admin) to get their own data 
router.get("/me", protect, getMe);

router.get("/agreement", protect, getMe); // Fixed: ensure this matches your intent

router.get("/agreement", protect, getMyAgreement);

// In backend/routes/userRoutes.js
router.get("/documents", protect, getMyDocuments);

// In userRoutes.js
router.post("/upload-doc", protect, upload.single("document"), uploadUserDocument);

// 3. New Route for Owner Contact Page [cite: 2026-01-07]
router.get("/my-owner-contact", protect, getMyOwnerContact);

// routes/userRoutes.js
router.get("/timeline", protect, getMyTimeline);
module.exports = router;