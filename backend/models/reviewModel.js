const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userRole: { type: String, required: true }, // e.g., "PG Owner" or "Tenant"
  comment: { type: String, required: true },
  isVisible: { type: Boolean, default: true } // Admin can "hide" a review without deleting it
}, { timestamps: true }); // Automatically adds createdAt and updatedAt [cite: 2026-01-01]

module.exports = mongoose.model("Review", reviewSchema);