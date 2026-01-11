const Review = require("../models/reviewModel");

// 1. GET ALL (For About Page - only shows visible ones)
exports.getPublicReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isVisible: true }).limit(2);
    res.status(200).json({ success: true, data: reviews });
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