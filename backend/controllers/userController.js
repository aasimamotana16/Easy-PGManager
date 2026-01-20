const User = require("../models/userModel");
const Agreement = require("../models/agreementModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

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
      profileCompletion: 20,
      emergencyContact: {
        contactName: "",
        relationship: "",
        phoneNumber: ""
      }
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
  // Added .trim() to ensure no accidental spaces break the login [cite: 2026-01-06]
  const email = req.body.email ? req.body.email.trim().toLowerCase() : "";
  const password = req.body.password ? req.body.password.trim() : "";

  try {
    // 1. Find user by email [cite: 2026-01-06]
    //const user = await User.findOne({ email });
    const user = await User.findOne({ email: email.toLowerCase().trim() }); // Added .trim()

    if (!user) {
      console.log(`❌ Login attempt failed: User not found (${email})`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. Validate password [cite: 2026-01-06]
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`🔍 Password comparison for ${email}: ${isMatch}`);

    if (isMatch) {
      const token = generateToken(user._id);
      
      // 3. Return response with fallback for name/fullName
      res.json({
        _id: user._id,
        fullName: user.fullName || user.name || "User", 
        email: user.email,
        token: token,
      });
      console.log(`✅ Successful login for: ${email}`);
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    // Log the actual error to your terminal to debug JWT or DB issues [cite: 2026-01-06]
    console.error("🚨 Login Error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Get Dynamic Dashboard Data [cite: 2026-01-06]
const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const dashboardData = {
      fullName: user.fullName || user.name, 
      profileCompletion: user.profileCompletion || 0,
      currentBooking: {
        pgName: user.bookedPgName || "No PG Booked",
        roomNo: user.roomNo || "N/A",
        status: user.bookingStatus || "Inactive",
        monthlyRent: user.monthlyRent || 0,
      },
      nextPayment: {
        amount: user.monthlyRent || 0,
        dueDate: user.paymentDueDate || "05 Jan 2026",
      }
    };

    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard from backend" });
  }
};

// @desc    Get Full Profile Details [cite: 2026-01-06]
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ 
      success: true, 
      data: {
        fullName: user.fullName || user.name, 
        email: user.email,
        phone: user.phone || "Not Set",
        city: user.city || "Not Set",
        state: user.state || "Not Set",
        role: user.role || "user",
        profilePicture: user.profilePicture || "",
        profileCompletion: user.profileCompletion || 0,
        emergencyContact: {
          contactName: user.emergencyContact?.contactName || "Not Set",
          relationship: user.emergencyContact?.relationship || "Not Set",
          phoneNumber: user.emergencyContact?.phoneNumber || "Not Set"
        }
      } 
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// @desc    Update User Profile (Edit Info Button) [cite: 2026-01-07]
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = req.body.fullName || user.fullName;
    user.phone = req.body.phone || user.phone;
    user.city = req.body.city || user.city;
    user.state = req.body.state || user.state;

    if (req.body.emergencyContact) {
      user.emergencyContact.contactName = req.body.emergencyContact.contactName || user.emergencyContact.contactName;
      user.emergencyContact.relationship = req.body.emergencyContact.relationship || user.emergencyContact.relationship;
      user.emergencyContact.phoneNumber = req.body.emergencyContact.phoneNumber || user.emergencyContact.phoneNumber;
    }

    // Dynamic Profile Completion Logic
    const fields = [user.phone, user.city, user.state, user.emergencyContact.contactName];
    const filledCount = fields.filter(f => f && f !== "Not Set").length;
    user.profileCompletion = 20 + (filledCount * 20); 

    const updatedUser = await user.save();
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// @desc    Upload Profile Picture [cite: 2026-01-07]
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    const user = await User.findById(req.user._id);
    user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.status(200).json({ success: true, profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ message: "Error uploading picture" });
  }
};

// @desc    Remove Profile Picture [cite: 2026-01-07]
const removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.profilePicture = ""; 
    await user.save();
    res.status(200).json({ success: true, message: "Picture removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing picture" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

const getMyAgreement = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const agreement = await Agreement.findOne({ userId: userId });
    const user = await User.findById(userId);

    if (!agreement) return res.status(404).json({ success: false, message: "No agreement found" });

    res.status(200).json({
      success: true,
      data: {
        pgName: agreement.pgName || (user ? user.bookedPgName : "N/A"),
        roomNo: agreement.roomNo || (user ? user.roomNo : "N/A"),
        tenantName: user ? (user.name || user.fullName) : "N/A",
        rentAmount: agreement.rentAmount,
        securityDeposit: agreement.securityDeposit,
        agreementId: agreement.agreementId,
        startDate: agreement.startDate,
        endDate: agreement.endDate,
        status: agreement.signed ? "Active" : "Pending Signature"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching agreement data" });
  }
};

const getMyDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: {
        idDocument: user.idDocument || { status: "Pending" },
        aadharCard: user.aadharCard || { status: "Pending" },
        rentalAgreementCopy: user.rentalAgreementCopy || { status: "Uploaded" }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching documents" });
  }
};

const uploadUserDocument = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const fieldName = req.body.documentType; 

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    user[fieldName] = {
      status: "Uploaded",
      fileUrl: `/uploads/documents/${req.file.filename}`,
      uploadedAt: Date.now()
    };

    await user.save();
    res.status(200).json({ success: true, data: user[fieldName] });
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUserDashboard,
  getUserProfile, 
  updateUserProfile,
  updateProfilePicture, 
  removeProfilePicture, 
  getMe,
  getMyAgreement,
  getMyDocuments,
  uploadUserDocument,
  // Add these three specifically to fix the "Undefined" error: [cite: 2026-01-06]
  sendOtp: (req, res) => res.send("OTP sent"), // Placeholder so it doesn't crash
  forgotPassword: (req, res) => res.send("Forgot Pass"), // Placeholder
  resetPassword: (req, res) => res.send("Reset Pass"), // Placeholder
};