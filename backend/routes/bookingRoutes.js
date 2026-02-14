const express = require('express'); // Changed from 'import' [cite: 2026-01-06]
const Booking = require('../models/bookingModel'); // Changed from 'import' [cite: 2026-01-06]
const Pg = require('../models/pgModel');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');

const router = express.Router();

// 1. Create booking (public) - associates booking with PG owner and notifies owner via email
router.post("/create", async (req, res) => {
  try {
    const { pgId, members, stayDetails, persons, roomType } = req.body;

    if (!pgId) return res.status(400).json({ success: false, message: 'pgId is required' });

    const pg = await Pg.findById(pgId).populate('ownerId', 'fullName email');
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });

    const owner = pg.ownerId;

    const bookingId = `BK-${Date.now()}`;
    const tenantName = (members && members.length > 0) ? members[0].fullName : 'Guest';
    const checkInDate = stayDetails?.checkIn || '';
    const checkOutDate = stayDetails?.checkOut || '';

    const newBooking = await Booking.create({
      ownerId: owner ? owner._id : null,
      bookingId,
      pgName: pg.pgName,
      roomType: roomType || pg.occupancy || 'Single Sharing',
      tenantName,
      checkInDate,
      checkOutDate,
      seatsBooked: Number(persons) || 1,
      status: 'Pending'
    });

    // Send email to owner if configured
    if (owner && owner.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: owner.email,
          subject: `New Booking Request - ${pg.pgName}`,
          html: `
            <h3>New booking request for <b>${pg.pgName}</b></h3>
            <p><strong>Tenant:</strong> ${tenantName}</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Check-in:</strong> ${checkInDate || 'N/A'}</p>
            <p><strong>Check-out:</strong> ${checkOutDate || 'N/A'}</p>
            <p><strong>Seats:</strong> ${persons || 1}</p>
            <p>Please review the booking in your owner dashboard.</p>
          `
        };

        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error('Failed to send booking email to owner:', emailErr.message);
      }
    }

    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    console.error('Booking create error:', err);
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