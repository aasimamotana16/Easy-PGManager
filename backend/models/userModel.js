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
    // CHANGED: Use 'phone' to match your ownerController
    phone: {
      type: String,
    },
    // ADDED: Your controller needs this to save "Surat"
    address: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "owner", "admin"],
      default: "user",
      lowercase: true,
    },
    // Added for profile UI consistency
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

// SAFE EXPORT: Checks if model exists before compiling to prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model("User", userSchema);