import express from "express";
import Booking from "../models/bookingModel.js";

const router = express.Router();

// Create booking
router.post("/create", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all bookings
router.get("/my", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;