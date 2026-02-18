const express = require('express'); // Changed from 'import' [cite: 2026-01-06]
const Booking = require('../models/bookingModel'); // Changed from 'import' [cite: 2026-01-06]
const Agreement = require('../models/agreementModel');
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
    const tenantEmail = (members && members.length > 0) ? String(members[0].email || '').trim().toLowerCase() : '';
    const checkInDate = stayDetails?.checkIn || new Date().toISOString().split('T')[0];
    const checkOutDate = stayDetails?.checkOut || 'Long Term';
    const isLongTerm = !Boolean(stayDetails?.checkOut);

    const newBooking = await Booking.create({
      ownerId: owner ? owner._id : null,
      pgId: pg._id,
      bookingId,
      pgName: pg.pgName,
      roomType: roomType || pg.occupancy || 'Single Sharing',
      tenantName,
      checkInDate,
      checkOutDate,
      seatsBooked: Number(persons) || 1,
      status: 'Pending',
      bookingSource: 'tenant_request'
    });

    const linkedUser = tenantEmail
      ? await User.findOne({ email: tenantEmail }).select('_id')
      : null;
    const agreementUserId = linkedUser?._id || (owner ? owner._id : null);

    if (agreementUserId) {
      const monthlyRent = Number(pg?.price || 0);
      const agreementPayload = {
        userId: agreementUserId,
        ownerId: owner ? owner._id : undefined,
        pgId: pg._id,
        bookingId: bookingId,
        agreementId: `AGR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        pgName: pg.pgName || 'Unknown PG',
        roomNo: roomType || pg.occupancy || 'N/A',
        tenantName,
        rentAmount: monthlyRent,
        securityDeposit: monthlyRent > 0 ? monthlyRent * 2 : 0,
        startDate: checkInDate,
        endDate: checkOutDate,
        checkInDate,
        checkOutDate,
        isLongTerm,
        fileUrl: pg.agreementTemplate?.agreementFileUrl || '',
        ownerSignatureUrl: pg.agreementTemplate?.ownerSignatureUrl || '',
        signed: Boolean(pg.agreementTemplate?.ownerSignatureUrl)
      };

      await Agreement.create(agreementPayload);
    }

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

    const bookingAgreement = await Agreement.findOne({ bookingId }).sort({ createdAt: -1 });
    res.status(201).json({ success: true, booking: newBooking, agreement: bookingAgreement });
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

router.get("/:bookingId/agreement", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).select('bookingId pgName checkInDate checkOutDate');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const agreement = await Agreement.findOne({ bookingId: booking.bookingId }).sort({ createdAt: -1 });
    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found for this booking' });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...agreement.toObject(),
        checkInDate: agreement.checkInDate || booking.checkInDate,
        checkOutDate: agreement.checkOutDate || booking.checkOutDate || 'Long Term',
        isLongTerm: agreement.isLongTerm || String(agreement.checkOutDate || booking.checkOutDate || '').toLowerCase() === 'long term'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// THIS IS THE MOST IMPORTANT LINE:
module.exports = router; // Changed from 'export default' [cite: 2026-01-06]
