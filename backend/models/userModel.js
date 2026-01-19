const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please add a full name"],
    },
    // Supporting existing Atlas data that uses "name"
    name: { type: String },

    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true, // Ensures login works regardless of case [cite: 2026-01-06]
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    phone: {
      type: String,
      // Removed "required: true" for now so existing users without phone 
      // can still login to update it
      default: "Not Set",
    },
    city: { type: String, default: "Not Set" },
    state: { type: String, default: "Not Set" },
    address: { type: String },
    role: {
      type: String,
      required: true,
      enum: ["user", "owner", "admin", "tenant"],
      default: "user",
      lowercase: true,
    },

    profileCompletion: {
      type: Number,
      default: 20, 
    },

    // Kept in camelCase as requested [cite: 2026-01-01]
    emergencyContact: {
      contactName: { type: String, default: "" },
      relationship: { type: String, default: "" },
      phoneNumber: { type: String, default: "" },
    },
    
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Social Links
    facebook: { type: String, default: "#" },
    instagram: { type: String, default: "#" },
    linkedin: { type: String, default: "#" },
    twitter: { type: String, default: "#" },

    // FIX: Renamed to profilePicture to match Controller [cite: 2026-01-07]
    profilePicture: { type: String, default: "" },

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
      status: { type: String, enum: ["Pending", "Uploaded"], default: "Pending" }, 
      fileUrl: { type: String, default: "" },
      uploadedAt: { type: Date, default: Date.now },
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);