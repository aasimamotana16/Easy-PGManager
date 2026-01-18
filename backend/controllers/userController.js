const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper: Generate JWT [cite: 2026-01-06]
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profileCompletion: 20, // Initial status
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

// @desc    Authenticate user
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

// @desc    Get Dynamic Dashboard Data [cite: 2026-01-06]
// This connects the Dashboard UI cards to your actual DB
const getUserDashboard = async (req, res) => {
  try {
    // Populate allows us to fetch the PG details linked to the user [cite: 2026-01-06]
    const user = await User.findById(req.user._id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    // We structure this to match your UI cards exactly
    const dashboardData = {
      fullName: user.fullName,
      profileCompletion: user.profileCompletion || 80, // Circular progress
      currentBooking: {
        pgName: user.bookedPgName || "No PG Booked", // Replace "Shree Residency" [cite: 2026-01-06]
        roomNo: user.roomNo || "N/A",
        status: user.bookingStatus || "Inactive",
        monthlyRent: user.monthlyRent || 0,
      },
      nextPayment: {
        amount: user.monthlyRent || 0,
        dueDate: user.paymentDueDate || "05 Jan 2026", // Dynamic due date
      }
    };

    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard from backend" });
  }
};

// @desc    Get Full Profile Details [cite: 2026-01-06]
// This fills in the "Not Set" fields in your Profile UI
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.status(200).json({ 
        success: true, 
        data: {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || "Not Set",
          state: user.state || "Not Set",
          emergencyContact: user.emergencyContact || "Not Set"
        } 
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// Add this function if you want a separate 'me' endpoint
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUserDashboard,
  getUserProfile, 
  getMe
};
