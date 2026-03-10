const express = require('express');
const router = express.Router();
const {
  getPublicReviews,
  upsertReview,
  getPublicReviewsCount,
  createReview,
  getReviewsByPg,
  getPendingReviews,
  approveReview,
  rejectReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/public', getPublicReviews);
router.get('/count', getPublicReviewsCount);
router.post('/manage', upsertReview);

// Create review (owner or user)
router.post('/create', createReview);

// Get reviews by property
router.get('/pg/:pgId', getReviewsByPg);

// Admin moderation
router.get('/pending', protect, getPendingReviews);
router.put('/approve/:id', protect, approveReview);
router.delete('/reject/:id', protect, rejectReview);

module.exports = router;
