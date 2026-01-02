const express = require("express");
const router = express.Router();
const { getHomeFeatures } = require("../controllers/featuresController");

// This matches the API.get("/features") call in your api.js
router.get("/features", getHomeFeatures);

module.exports = router;