const express = require('express');
const router = express.Router();
const pgController = require('../controllers/pgController');

// 1. FIXED: Changed from '/create' to '/add-pg' to match your frontend Axios call
router.post('/add-pg', pgController.createPG);

// 2. FIXED: Search and All routes for your tenant flow [cite: 2026-01-06]
router.get('/search', pgController.searchPGs);
router.get('/all', pgController.getAllPgs);

// 3. NEW: Added a features route to stop the 404 "Failed to load resource" error
router.get('/features', (req, res) => {
  // Sending an empty array for now so the frontend doesn't crash
  res.json({ success: true, data: [] }); 
});

router.get('/:id', pgController.getPgById);

module.exports = router;