const express = require("express");
const router = express.Router();
const { getHomeFeatures } = require("../controllers/featuresController");

// This matches the API.get("/features") call in your api.js
// Since it's mounted under /api/features, this creates /api/features
router.get("/", getHomeFeatures);

module.exports = router;
