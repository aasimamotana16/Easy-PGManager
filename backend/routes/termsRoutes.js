const express = require('express');
const router = express.Router();

const { getTerms, updateTerms } = require('../controllers/termsController');
const { protect } = require('../middleware/authMiddleware');

// Public fetch
router.get('/', getTerms);

// Protected update (admin)
router.put('/', protect, updateTerms);

module.exports = router;
