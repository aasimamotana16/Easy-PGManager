const express = require("express");
const router = express.Router();
const { getServicesPageData } = require("../controllers/serviceController");

router.get("/", getServicesPageData);

module.exports = router;
