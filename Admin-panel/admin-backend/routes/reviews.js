const express = require('express');
const Review = require('../models/Review');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

const normalizeModerationStatus = (review) => {
  if (typeof review.isVisible === 'boolean') {
    return review.isVisible ? 'accepted' : 'rejected';
  }
  if (typeof review.isActive === 'boolean') {
    return review.isActive ? 'accepted' : 'rejected';
  }
  const normalizedStatus = (review.status || '').toString().trim().toLowerCase();
  if (normalizedStatus === 'accepted' || normalizedStatus === 'approved' || normalizedStatus === 'visible') {
    return 'accepted';
  }
  if (normalizedStatus === 'rejected' || normalizedStatus === 'hidden') {
    return 'rejected';
  }
  return 'accepted';
};

const mapReview = (r) => ({
  _id: String(r._id),
  id: r.externalId || String(r._id),
  comment: r.quote || r.comment || '',
  userRole: r.reviewerRole || r.userRole || '',
  reviewerName: r.reviewerName || r.userName || '',
  reviewerRole: r.reviewerRole || r.userRole || '',
  userTypeLabel: r.userTypeLabel,
  quote: r.quote || r.comment || '',
  rating: r.rating,
  avatarInitial: r.avatarInitial,
  displayOrder: r.displayOrder,
  isActive: typeof r.isActive === 'boolean' ? r.isActive : Boolean(r.isVisible),
  isVisible: typeof r.isVisible === 'boolean' ? r.isVisible : Boolean(r.isActive),
  moderationStatus: normalizeModerationStatus(r),
  createdAt: r.createdAt,
  updatedAt: r.updatedAt
});

const findReviewByIdentifier = async (id) => {
  const byExternalId = await Review.findOne({ externalId: id });
  if (byExternalId) return byExternalId;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Review.findById(id);
};

router.get('/', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const lim = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));

    const reviews = await Review.find({
      $or: [{ isActive: true }, { isVisible: true }]
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(lim);

    const normalized = reviews.map(mapReview);

    res.json({ reviews: normalized });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ displayOrder: 1, createdAt: -1 });
    const normalized = reviews.map(mapReview);
    res.json({ reviews: normalized });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'accepted' or 'rejected'" });
    }

    const review = await findReviewByIdentifier(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const isAccepted = status === 'accepted';
    review.isActive = isAccepted;
    review.isVisible = isAccepted;
    if ('status' in review) {
      review.status = isAccepted ? 'accepted' : 'rejected';
    }
    await review.save();

    return res.json({ message: 'Review status updated successfully', review: mapReview(review) });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
