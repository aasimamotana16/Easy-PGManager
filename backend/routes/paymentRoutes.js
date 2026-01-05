const express = require("express");
const router = express.Router();
const { getUserPayments, addPaymentRecord } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware"); // Ensure you have this middleware

// URL: /api/payments/history
router.get("/history", protect, getUserPayments);

// URL: /api/payments/add
router.post("/add", protect, addPaymentRecord);

module.exports = router;