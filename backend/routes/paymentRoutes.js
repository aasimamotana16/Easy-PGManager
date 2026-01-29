const express = require("express");
const router = express.Router();
const { 
  createOrder, 
  verifyPayment, 
  getUserPayments, 
  downloadReceipt 
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.get("/test", (req, res) => res.send("Payment routes are working!"));

// 1. Get payment history (Existing - for your table)
// URL: /api/payments/history
router.get("/history", protect, getUserPayments);

// 2. Step 1: Create Razorpay Order
// URL: /api/payments/create-order
router.post("/create-order", protect, createOrder);

// 3. Step 2: Verify Razorpay Signature and Save to DB [cite: 2026-01-01]
// URL: /api/payments/verify
router.post("/verify", protect, verifyPayment);

// 4. Download PDF Receipt [cite: 2026-01-06]
// URL: /api/payments/receipt/:id
router.get("/receipt/:id", protect, downloadReceipt);

module.exports = router;