const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  getUserDashboard, 
  getMe,
  getMyAgreement,
  getMyDocuments,
  uploadUserDocument
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // Your Multer config [cite: 2026-01-06]

// --- Public Routes (No token needed) ---
router.post("/register", registerUser);
router.post("/login", loginUser);

// --- Protected Routes (Token required) ---
// Route for the main dashboard data
router.get("/dashboard-stats", protect, getUserDashboard);

// Route for the profile page
router.get("/profile", protect, getUserProfile);
// PUT: Handles the "Edit Info" button clicks to save to DB [cite: 2026-01-07]
router.put("/profile/update", protect, updateUserProfile);
// This allows ANY logged-in user (Owner, Tenant, or Admin) to get their own data 
router.get("/me", protect, getMe);

router.get("/agreement", protect, getMyAgreement);

// In backend/routes/userRoutes.js
router.get("/documents", protect, getMyDocuments);

// In userRoutes.js
router.post("/upload-doc", protect, upload.single("document"), uploadUserDocument);
module.exports = router;