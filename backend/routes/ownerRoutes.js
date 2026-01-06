const express = require('express');
const router = express.Router();

const { getOwnerDashboardData, createPg } = require('../controllers/ownerController');
const { protect, isOwner } = require('../middleware/authMiddleware');

// Dashboard summary
router.get('/dashboard-summary', getOwnerDashboardData);

// Add new PG
router.post('/add-pg', createPg);

module.exports = router;