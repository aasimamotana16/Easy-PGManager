const Review = require("../models/reviewModel");

const ensureAdmin = (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ success: false, message: "Access denied. Admin only." });
    return false;
  }
  return true;
};

// 1. GET ALL (For About Page - only shows visible ones)
exports.getPublicReviews = async (req, res) => {
  try {
    // allow optional ?limit= to control number returned from frontend
    const limit = Number(req.query.limit) || 3;
    const reviews = await Review.find({ isVisible: true }).sort({ createdAt: -1 }).limit(limit);
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Return count of public (visible) reviews
exports.getPublicReviewsCount = async (req, res) => {
  try {
    const count = await Review.countDocuments({ isVisible: true });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. CREATE/UPDATE (For Admin Flow)
exports.upsertReview = async (req, res) => {
  try {
    const { id, userName, userRole, comment, isVisible } = req.body;
    
    if (id) {
      // Update existing review [cite: 2026-01-01]
      const updated = await Review.findByIdAndUpdate(id, { userName, userRole, comment, isVisible }, { new: true });
      return res.status(200).json({ success: true, data: updated });
    }
    
    // Create new review [cite: 2026-01-01]
    const newReview = await Review.create({ userName, userRole, comment });
    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Create a review (owner or user). Admin approval required before it is public.
exports.createReview = async (req, res) => {
  try {
    const { pgId, ownerId, userId, userName, userEmail, userRole, comment, rating } = req.body;
    const payload = { pgId, ownerId, userId, userName, userEmail, userRole, comment, rating };
    // Reviews are hidden by default and should be explicitly approved by admin.
    payload.isVisible = false;

    const created = await Review.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: list all pending reviews
exports.getPendingReviews = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const reviews = await Review.find({ isVisible: false }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: approve a review so it appears publicly
exports.approveReview = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { id } = req.params;
    const updated = await Review.findByIdAndUpdate(
      id,
      { isVisible: true },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: reject review (delete from queue)
exports.rejectReview = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.status(200).json({ success: true, message: "Review rejected and removed" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get visible reviews for a specific PG (property)
exports.getReviewsByPg = async (req, res) => {
  try {
    const { pgId } = req.params;
    if (!pgId) return res.status(400).json({ success: false, message: 'pgId required' });
    const reviews = await Review.find({ pgId, isVisible: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
