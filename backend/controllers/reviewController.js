const Review = require("../models/reviewModel");

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

// Create a review (owner or user). Owner-submitted reviews should be visible immediately.
exports.createReview = async (req, res) => {
  try {
    const { pgId, ownerId, userId, userName, userEmail, userRole, comment, rating, isOwnerCreated } = req.body;
    const payload = { pgId, ownerId, userId, userName, userEmail, userRole, comment, rating };
    // Owner-created reviews become visible immediately
    payload.isVisible = !!isOwnerCreated;

    const created = await Review.create(payload);
    res.status(201).json({ success: true, data: created });
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