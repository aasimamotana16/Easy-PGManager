const Booking = require('../models/bookingModel');
const Tenant = require('../models/tenantModel');

// Handle new booking submission [cite: 2026-01-06]
exports.createBooking = async (req, res) => {
  try {
    const normalizedEmail = String(req.body?.tenantEmail || req.body?.email || "").trim().toLowerCase();
    const existingBooking = await Booking.findOne({
      status: { $ne: "Cancelled" },
      $or: [
        req.body?.tenantUserId ? { tenantUserId: req.body.tenantUserId } : null,
        normalizedEmail ? { tenantEmail: new RegExp(`^${normalizedEmail}$`, "i") } : null
      ].filter(Boolean)
    }).sort({ createdAt: -1 });

    if (existingBooking) {
      const latestTenant = normalizedEmail
        ? await Tenant.findOne({ email: new RegExp(`^${normalizedEmail}$`, "i") })
            .sort({ createdAt: -1 })
            .select("status moveOutCompletedAt")
            .lean()
        : null;
      const tenantStatusLower = String(latestTenant?.status || "").trim().toLowerCase();
      const moveOutCompleted = tenantStatusLower === "inactive";
      if (moveOutCompleted) {
        // Allow creating a new booking after owner-approved move-out.
      } else {
      return res.status(409).json({
        success: false,
        message: "Tenant already has an active booking. Cancel/complete it before creating another."
      });
      }
    }

    // Generate a unique bookingId since it's required in your model [cite: 2026-01-01]
    const customBookingId = "BK-" + Math.floor(1000 + Math.random() * 9000);

    const newBooking = await Booking.create({
      ...req.body,
      bookingId: customBookingId,
      status: 'Pending' // Matches your enum [cite: 2026-01-06]
    });

    res.status(201).json({
      success: true,
      message: "Booking successful!",
      booking: newBooking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Booking failed",
      error: error.message
    });
  }
};

// Get booking details by ID for the confirmation page [cite: 2026-01-06]
exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
