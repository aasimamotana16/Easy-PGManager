const express = require('express');
const router = express.Router();
const pgController = require('../controllers/pgController');

// Existing Search: Matches frontend API.get("/pgs/search")
router.get('/search', pgController.searchPGs);

// NEW: All-in-One API for Available PGs (images + 2nd page details) [cite: 2026-01-11]
// This is what you will show your guide tomorrow
router.get('/all', pgController.getAllPgs);

module.exports = router;