const express = require('express');
const router = express.Router();
const { getPublicReviews, upsertReview, getPublicReviewsCount, createReview, getReviewsByPg } = require('../controllers/reviewController');

router.get('/public', getPublicReviews);
router.get('/count', getPublicReviewsCount);
router.post('/manage', upsertReview);

// Create review (owner or user)
router.post('/create', createReview);

// Get reviews by property
router.get('/pg/:pgId', getReviewsByPg);

module.exports = router;