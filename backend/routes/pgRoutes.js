const express = require('express');
const router = express.Router();
const pgController = require('../controllers/pgController');

// This matches the frontend call: API.get("/pgs/search")
router.get('/search', pgController.searchPGs);

module.exports = router;