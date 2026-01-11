const express = require('express');
const router = express.Router();
const { getPublicReviews, upsertReview } = require('../controllers/reviewController');

router.get('/public', getPublicReviews);
router.post('/manage', upsertReview);

module.exports = router;