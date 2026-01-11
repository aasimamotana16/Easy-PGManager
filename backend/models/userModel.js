const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please add a full name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    phone: {
      type: String,
      required: [true, "Please add a phone number"], // Updated to be required for Signup
    },
    // Matches "City" and "State" fields in UI
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    address: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "owner", "admin", "tenant"],
      default: "user",
      lowercase: true,
    },

    // NEW: Matches the "Profile Completion" 80% circle
    profileCompletion: {
      type: Number,
      default: 20, // Starts low after signup
    },

    // NEW: Matches the "Emergency Contact" section
    emergencyContact: {
      contactName: { type: String, default: "" },
      relationship: { type: String, default: "" },
      phoneNumber: { type: String, default: "" },
    },
    
    // ADDED: Logic to track if OTP was successful
    isVerified: {
      type: Boolean,
      default: false,
    },
    facebook: { type: String, default: "#" },
    instagram: { type: String, default: "#" },
    linkedin: { type: String, default: "#" },
    twitter: { type: String, default: "#" },
    profileImage: { type: String, default: "/images/profileImages/profile1.jpg" }
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);