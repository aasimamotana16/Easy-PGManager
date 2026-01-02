const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  getUserDashboard 
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// --- Public Routes (No token needed) ---
router.post("/register", registerUser);
router.post("/login", loginUser);

// --- Protected Routes (Token required) ---
// Route for the main dashboard data
router.get("/dashboard-stats", protect, getUserDashboard);

// Route for the profile page
router.get("/profile", protect, getUserProfile);

module.exports = router;