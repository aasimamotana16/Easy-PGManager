import express from "express";
import Payment from "../models/paymentModel.js";

const router = express.Router();

// Create payment
router.post("/pay-rent", async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all payments
router.get("/all", async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;