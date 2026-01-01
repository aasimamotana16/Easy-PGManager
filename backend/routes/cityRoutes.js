const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');

// Keep only this line to use the controller
router.get('/', cityController.getGujaratCities);

module.exports = router;