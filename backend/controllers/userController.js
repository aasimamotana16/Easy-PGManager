const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper function to create Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Get current logged-in user data
// @route   GET /api/users/me
const getMe = async (req, res) => {
  try {
    // req.user is populated by the 'protect' middleware
    // Use camelCase for internal variables [cite: 2026-01-01]
    const userProfile = await User.findById(req.user._id).select("-password");

    if (userProfile) {
      // Structure matches res.data.data used in your React component [cite: 2026-01-06]
      res.status(200).json({
        success: true,
        data: userProfile
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data" });
  }
};

// @desc    Register new user
const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
};

// @desc    Authenticate a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Get user profile (Legacy/Alternative)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.status(200).json({ success: true, data: user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// @desc    Get dashboard stats
const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const dashboardData = {
      user: {
        fullName: user.fullName,
        email: user.email,
      },
      stats: {
        activeBookings: 1,
        pendingPayments: 0,
        totalStayDays: 120,
      },
      recentActivity: [
        { id: 1, action: "Monthly Rent Paid", date: "2025-12-01" },
        { id: 2, action: "Check-in Successful", date: "2025-08-15" }
      ]
    };

    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  getUserDashboard,
  getMe // Now correctly defined above
};