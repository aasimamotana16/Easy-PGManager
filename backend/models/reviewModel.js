const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: false },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  userName: { type: String, required: false },
  userEmail: { type: String, required: false },
  userRole: { type: String, required: false }, // e.g., "owner" or "tenant"
  rating: { type: Number, required: false, min: 0, max: 5 },
  comment: { type: String, required: true },
  isVisible: { type: Boolean, default: false } // New reviews are hidden by default until approved
}, { timestamps: true }); // Automatically adds createdAt and updatedAt [cite: 2026-01-01]

module.exports = mongoose.model("Review", reviewSchema);