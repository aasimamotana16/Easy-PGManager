const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please add a full name"],
    },
    // Adding name as a virtual or alias if your DB uses it interchangeably
    name: { type: String },

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
      required: [true, "Please add a phone number"],
    },
    // Matches "City" and "State" fields in UI
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    address: { type: String },
    role: {
      type: String,
      required: true,
      enum: ["user", "owner", "admin", "tenant"],
      default: "user",
      lowercase: true,
    },

    // Matches the "Profile Completion" UI
    profileCompletion: {
      type: Number,
      default: 20, 
    },

    // Matches the "Emergency Contact" section
    // Note: I kept these in camelCase as requested [cite: 2026-01-01]
    emergencyContact: {
      contactName: { type: String, default: "" },
      relationship: { type: String, default: "" },
      phoneNumber: { type: String, default: "" },
    },
    
    isVerified: {
      type: Boolean,
      default: false,
    },
    facebook: { type: String, default: "#" },
    instagram: { type: String, default: "#" },
    linkedin: { type: String, default: "#" },
    twitter: { type: String, default: "#" },
    profileImage: { type: String, default: "/images/profileImages/profile1.jpg" },

    // --- DOCUMENT FIELDS FOR DASHBOARD ---
    idDocument: {
      status: { type: String, enum: ["Pending", "Uploaded"], default: "Pending" },
      fileUrl: { type: String, default: "" },
    },
    aadharCard: {
      status: { type: String, enum: ["Pending", "Uploaded"], default: "Pending" },
      fileUrl: { type: String, default: "" },
    },
    rentalAgreementCopy: {
      status: { type: String, enum: ["Pending", "Uploaded"], default: "Uploaded" }, 
      fileUrl: { type: String, default: "" },
      uploadedAt: { type: Date, default: Date.now },
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);