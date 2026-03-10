const express = require("express");
const { getPrivacyPolicy } = require("../controllers/privacyPolicyController");

const router = express.Router();

router.get("/", getPrivacyPolicy);

module.exports = router;
