const express = require("express");
const { getAboutPageData } = require("../controllers/aboutController");

const router = express.Router();

router.get("/", getAboutPageData);

module.exports = router;
