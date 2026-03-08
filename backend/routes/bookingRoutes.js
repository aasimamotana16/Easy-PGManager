const express = require('express'); // Changed from 'import' [cite: 2026-01-06]
const Booking = require('../models/bookingModel'); // Changed from 'import' [cite: 2026-01-06]
const Agreement = require('../models/agreementModel');
const Pg = require('../models/pgModel');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const { resolveVariantPricing } = require('../utils/pricingUtils');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const resolveTenantBooking = async ({ bookingIdentifier, user }) => {
  const userId = user?._id;
  const normalizedEmail = String(user?.email || '').trim().toLowerCase();

  const tenantMatcher = {
    $or: [
      { tenantUserId: userId },
      normalizedEmail ? { tenantEmail: new RegExp(`^${normalizedEmail}$`, 'i') } : null
    ].filter(Boolean)
  };

  let booking = null;

  if (bookingIdentifier && String(bookingIdentifier).match(/^[a-fA-F0-9]{24}$/)) {
    booking = await Booking.findOne({ _id: bookingIdentifier, ...tenantMatcher });
    if (!booking) {
      booking = await Booking.findOne({
        pgId: bookingIdentifier,
        status: { $in: ['Pending', 'Confirmed'] },
        ...tenantMatcher
      }).sort({ createdAt: -1 });
    }
  }

  if (!booking) {
    booking = await Booking.findOne({
      bookingId: String(bookingIdentifier || '').trim(),
      ...tenantMatcher
    });
  }

  return booking;
};

const findActiveTenantBooking = async ({ userId, emails = [] }) => {
  const emailMatchers = emails
    .map((email) => String(email || "").trim().toLowerCase())
    .filter(Boolean)
    .map((email) => ({ tenantEmail: new RegExp(`^${email}$`, "i") }));

  const identityMatchers = [
    userId ? { tenantUserId: userId } : null,
    ...emailMatchers
  ].filter(Boolean);

  if (identityMatchers.length === 0) return null;

  return Booking.findOne({
    status: { $ne: "Cancelled" },
    $or: identityMatchers
  }).sort({ createdAt: -1 });
};

// 1. Create booking (public) - associates booking with PG owner and notifies owner via email
router.post("/create", protect, async (req, res) => {
  try {
    const requesterRole = String(req.user?.role || '').toLowerCase();
    if (!['user', 'tenant'].includes(requesterRole)) {
      return res.status(403).json({ success: false, message: "Only tenant/user accounts can create booking requests" });
    }

    const { pgId, members, stayDetails, persons, roomType, variantLabel } = req.body;

    if (!pgId) return res.status(400).json({ success: false, message: 'pgId is required' });

    const pg = await Pg.findById(pgId).populate('ownerId', 'fullName email');
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });

    const owner = pg.ownerId;

    const bookingId = `BK-${Date.now()}`;
    const tenantName = (members && members.length > 0 && members[0].fullName)
      ? members[0].fullName
      : (req.user?.fullName || 'Guest');
    const tenantEmail = (members && members.length > 0 && members[0].email)
      ? String(members[0].email || '').trim().toLowerCase()
      : String(req.user?.email || '').trim().toLowerCase();

    const existingTenantBooking = await findActiveTenantBooking({
      userId: req.user?._id,
      emails: [tenantEmail, req.user?.email]
    });
    if (existingTenantBooking) {
      return res.status(409).json({
        success: false,
        message: `You already have an active booking (${existingTenantBooking.bookingId || existingTenantBooking._id}) for ${existingTenantBooking.pgName || "a PG"}. Cancel/complete it before booking another PG.`,
        data: {
          bookingId: existingTenantBooking.bookingId || null,
          pgId: existingTenantBooking.pgId || null,
          pgName: existingTenantBooking.pgName || null,
          status: existingTenantBooking.status || null
        }
      });
    }

    const checkInDate = stayDetails?.checkIn || new Date().toISOString().split('T')[0];
    const checkOutDate = stayDetails?.checkOut || 'Long Term';
    const pricing = resolveVariantPricing({
      roomPrices: pg?.roomPrices,
      roomType,
      variantLabel,
      fallbackRent: Number(pg?.price || 0),
      fallbackDeposit: Number(pg?.securityDeposit || 0)
    });
    const monthlyRent = Number(pricing.rentAmount || 0);
    const configuredDeposit = Number(pricing.securityDeposit || 0);
    const securityDeposit = configuredDeposit > 0
      ? configuredDeposit
      : Math.max(0, monthlyRent * 2);

    const newBooking = await Booking.create({
      ownerId: owner ? owner._id : null,
      pgId: pg._id,
      bookingId,
      pgName: pg.pgName,
      roomType: roomType || pg.occupancy || 'Single Sharing',
      variantLabel: pricing.variantLabel || roomType || pg.occupancy || 'Single Sharing',
      tenantName,
      checkInDate,
      checkOutDate,
      seatsBooked: Number(persons) || 1,
      rentAmount: monthlyRent,
      securityDeposit,
      pricingSnapshot: {
        billingCycle: pricing.billingCycle || "Monthly",
        acType: pricing.acType || "Non-AC",
        features: pricing.features || {}
      },
      bookingAmount: monthlyRent,
      status: 'Pending',
      ownerApproved: false,
      ownerApprovalStatus: 'pending',
      initialRentPaid: false,
      securityDepositPaid: false,
      bookingSource: 'tenant_request'
    });

    const linkedUser = req.user?._id
      ? await User.findById(req.user._id).select('_id fullName email role')
      : (tenantEmail
      ? await User.findOne({
          email: new RegExp(`^${tenantEmail}$`, 'i'),
          role: { $in: ['user', 'tenant'] }
        }).select('_id fullName email')
      : null);
    const agreementUserId = linkedUser?._id || null;

    if (agreementUserId) {
      newBooking.tenantUserId = agreementUserId;
      newBooking.tenantEmail = linkedUser?.email || tenantEmail;
      await newBooking.save();
    } else if (tenantEmail) {
      newBooking.tenantEmail = tenantEmail;
      await newBooking.save();
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

    res.status(201).json({ success: true, booking: newBooking, agreement: null });
  } catch (err) {
    console.error('Booking create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Get all bookings [cite: 2026-01-06]
router.get("/my", protect, async (req, res) => {
  try {
    const role = String(req.user?.role || '').toLowerCase();
    let query = {};
    if (role === 'owner') {
      query = { ownerId: req.user._id };
    } else {
      const email = String(req.user?.email || '').trim().toLowerCase();
      query = {
        $or: [
          { tenantUserId: req.user._id },
          email ? { tenantEmail: new RegExp(`^${email}$`, 'i') } : null
        ].filter(Boolean)
      };
    }
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Tenant raises cancellation request. Owner must approve before final cancellation.
router.put("/:bookingId/request-cancel", protect, async (req, res) => {
  try {
    const role = String(req.user?.role || '').toLowerCase();
    if (!['user', 'tenant'].includes(role)) {
      return res.status(403).json({ success: false, message: "Only tenant/user accounts can request cancellation" });
    }

    const { reason = '', otherReason = '' } = req.body || {};
    const booking = await resolveTenantBooking({ bookingIdentifier: req.params.bookingId, user: req.user });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found for this user" });
    }

    if (String(booking.status || '') === 'Cancelled') {
      return res.status(400).json({ success: false, message: "Booking is already cancelled" });
    }

    booking.cancelRequest = {
      requested: true,
      requestedAt: new Date(),
      requestedBy: 'tenant',
      reason: String(reason || '').trim(),
      otherReason: String(otherReason || '').trim(),
      status: 'Pending',
      reviewedAt: null
    };
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Cancellation request sent to owner for approval",
      data: booking
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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
