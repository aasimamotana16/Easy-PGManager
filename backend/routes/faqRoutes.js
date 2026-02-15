const express = require("express");
const { getFaqs, addFaq } = require("../controllers/faqController");

const router = express.Router();

router.get("/", getFaqs);      // GET all FAQs
router.post("/", addFaq);      // Add new FAQ

module.exports = router;
