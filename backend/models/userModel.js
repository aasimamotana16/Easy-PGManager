const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // ✅ ADD THIS LINE AT THE TOP

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
      minlength: [6, "Password must be at least 6 characters"], // Add this line
    },
    phone: {
      type: String,
    },
    businessName: {
      type: String,
      default: "",
    },
    city: { type: String, select: false },
    state: { type: String, select: false },
    address: { type: String, select: false },
    role: {
      type: String,
      required: true,
      enum: ["user", "owner", "admin", "tenant"],
      default: "user",
      lowercase: true,
    },

    profileCompletion: {
      type: Number,
      select: false,
    },

    // Kept in camelCase as requested [cite: 2026-01-01]
    emergencyContact: {
      contactName: { type: String },
      relationship: { type: String },
      phoneNumber: { type: String },
    },
    
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Social Links
    facebook: { type: String, select: false },
    instagram: { type: String, select: false },
    linkedin: { type: String, select: false },
    twitter: { type: String, select: false },

    // FIX: Renamed to profilePicture to match Controller [cite: 2026-01-07]
    profilePicture: { type: String, select: false },
    // --- DOCUMENT FIELDS FOR DASHBOARD ---
    idDocument: {
      status: { type: String, enum: ["Pending", "Uploaded", "Verified", "Rejected"], select: false },
      fileUrl: { type: String, select: false },
      uploadedAt: { type: Date, select: false },
      reviewedAt: { type: Date, select: false },
      reviewNote: { type: String, select: false },
    },
    aadharCard: {
      status: { type: String, enum: ["Pending", "Uploaded", "Verified", "Rejected"], select: false },
      fileUrl: { type: String, select: false },
      uploadedAt: { type: Date, select: false },
      reviewedAt: { type: Date, select: false },
      reviewNote: { type: String, select: false },
    },
    rentalAgreementCopy: {
      status: { type: String, enum: ["Pending", "Uploaded", "Verified", "Rejected"], select: false },
      fileUrl: { type: String, select: false },
      uploadedAt: { type: Date, select: false },
      reviewedAt: { type: Date, select: false },
      reviewNote: { type: String, select: false },
    },
    // --- ADD THIS HERE ---
    assignedPg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PG", // Links to the property [cite: 2026-01-06]
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to the owner's User document [cite: 2026-01-07]
    }
  },
  {
    timestamps: true,
  }
);
// ✅ REMOVE the pre("save") hook. 
// ✅ KEEP only this method for the login check:
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//module.exports = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = mongoose.model("User", userSchema);
