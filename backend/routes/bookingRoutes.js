const express = require('express'); // Changed from 'import' [cite: 2026-01-06]
const Booking = require('../models/bookingModel'); // Changed from 'import' [cite: 2026-01-06]

const router = express.Router();

// 1. Create booking [cite: 2026-01-06]
router.post("/create", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Get all bookings [cite: 2026-01-06]
router.get("/my", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// THIS IS THE MOST IMPORTANT LINE:
module.exports = router; // Changed from 'export default' [cite: 2026-01-06]