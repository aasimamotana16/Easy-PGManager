import express from "express";
import Agreement from "../models/agreementModel.js";

const router = express.Router();

// Create agreement
router.post("/create", async (req, res) => {
  try {
    const agreement = await Agreement.create(req.body);
    res.json({ success: true, agreement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get agreement by bookingId
router.get("/:bookingId", async (req, res) => {
  try {
    const agreement = await Agreement.findOne({ bookingId: req.params.bookingId });
    res.json({ success: true, agreement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;