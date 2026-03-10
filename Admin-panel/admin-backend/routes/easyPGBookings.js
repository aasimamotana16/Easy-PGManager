const express = require('express');
const { body, validationResult } = require('express-validator');
const EasyPGBooking = require('../models/EasyPGBooking');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const emitEvent = (req, eventName, type, data) => {
  const io = req.app.get('io');
  if (!io) return;
  io.emit(eventName, { type, data, timestamp: new Date() });
};

const canConfirmBooking = (booking) =>
  booking?.ownerApprovalStatus === 'Approved' && booking?.paymentStatus === 'Success';

// GET all bookings with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      ownerId = '',
      ownerApprovalStatus = '',
      paymentStatus = ''
    } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { pgName: { $regex: search, $options: 'i' } },
        { tenantName: { $regex: search, $options: 'i' } },
        { roomType: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (ownerId) {
      query.ownerId = ownerId;
    }

    if (ownerApprovalStatus) {
      query.ownerApprovalStatus = ownerApprovalStatus;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const bookings = await EasyPGBooking.find(query)
      .populate('ownerId', 'fullName email phone')
      .populate('tenantUserId', 'fullName email phone')
      .populate('pgId', 'pgName location')
      .populate('paymentId', 'transactionId paymentStatus amountPaid paymentDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGBooking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await EasyPGBooking.findById(req.params.id)
      .populate('ownerId', 'fullName email phone')
      .populate('tenantUserId', 'fullName email phone')
      .populate('pgId', 'pgName location')
      .populate('paymentId', 'transactionId paymentStatus amountPaid paymentDate');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET bookings by owner
router.get('/owner/:ownerId', authenticateToken, async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const bookings = await EasyPGBooking.find({ ownerId })
      .populate('ownerId', 'fullName email phone')
      .populate('tenantUserId', 'fullName email phone')
      .populate('pgId', 'pgName location')
      .populate('paymentId', 'transactionId paymentStatus amountPaid paymentDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGBooking.countDocuments({ ownerId });

    res.json({
      bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST new booking
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('bookingId').trim().notEmpty().withMessage('Booking ID is required'),
  body('pgName').trim().notEmpty().withMessage('PG name is required'),
  body('ownerId').isMongoId().withMessage('Valid owner ID required'),
  body('tenantUserId').optional().isMongoId().withMessage('Valid tenant user ID required'),
  body('pgId').optional().isMongoId().withMessage('Valid PG ID required'),
  body('tenantName').trim().notEmpty().withMessage('Tenant name is required'),
  body('tenantEmail').optional().isEmail().withMessage('Valid tenant email required'),
  body('roomType').trim().notEmpty().withMessage('Room type is required'),
  body('checkInDate').trim().notEmpty().withMessage('Check-in date is required'),
  body('checkOutDate').trim().notEmpty().withMessage('Check-out date is required'),
  body('seatsBooked').isNumeric().withMessage('Seats booked must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bookingPayload = {
      ...req.body,
      status: 'Pending',
      ownerApprovalStatus: 'Pending',
      paymentStatus: 'NotInitiated',
      ownerApprovedAt: null,
      ownerRejectedAt: null,
      bookingCompletedAt: null,
      paymentId: null,
      nextPaymentDate: null,
      ownerNotifiedAt: new Date()
    };

    const booking = new EasyPGBooking(bookingPayload);
    await booking.save();

    const populatedBooking = await EasyPGBooking.findById(booking._id)
      .populate('ownerId', 'fullName email phone')
      .populate('tenantUserId', 'fullName email phone')
      .populate('pgId', 'pgName location')
      .populate('paymentId', 'transactionId paymentStatus amountPaid paymentDate');

    emitEvent(req, 'easyPGBookingCreated', 'BOOKING_CREATED', populatedBooking);
    emitEvent(req, 'easyPGOwnerActionRequired', 'BOOKING_OWNER_APPROVAL_REQUESTED', {
      bookingId: populatedBooking._id,
      ownerId: populatedBooking.ownerId?._id || populatedBooking.ownerId,
      ownerEmail: populatedBooking.ownerId?.email || null,
      tenantName: populatedBooking.tenantName,
      pgName: populatedBooking.pgName
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update booking
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('status').optional().isIn(['Pending', 'Confirmed', 'Cancelled']).withMessage('Invalid status'),
  body('ownerApprovalStatus').optional().isIn(['Pending', 'Approved', 'Rejected']).withMessage('Invalid owner approval status'),
  body('paymentStatus').optional().isIn(['NotInitiated', 'Pending', 'Success', 'Failed']).withMessage('Invalid payment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingBooking = await EasyPGBooking.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updateData = { ...req.body, updatedAt: new Date() };

    if (updateData.status === 'Confirmed' && !canConfirmBooking(existingBooking)) {
      return res.status(400).json({
        message: 'Booking can be confirmed only after owner approval and successful payment'
      });
    }

    if (updateData.ownerApprovalStatus === 'Approved') {
      updateData.ownerApprovedAt = new Date();
      updateData.ownerRejectedAt = null;
      if (!updateData.paymentStatus && existingBooking.paymentStatus === 'NotInitiated') {
        updateData.paymentStatus = 'Pending';
      }
      if (!updateData.status || updateData.status === 'Confirmed') {
        updateData.status = 'Pending';
      }
    }

    if (updateData.ownerApprovalStatus === 'Rejected') {
      updateData.ownerRejectedAt = new Date();
      updateData.ownerApprovedAt = null;
      updateData.status = 'Cancelled';
      if (!updateData.paymentStatus || updateData.paymentStatus === 'NotInitiated') {
        updateData.paymentStatus = 'Failed';
      }
    }

    if (updateData.paymentStatus === 'Success') {
      if ((updateData.ownerApprovalStatus || existingBooking.ownerApprovalStatus) !== 'Approved') {
        return res.status(400).json({
          message: 'Booking payment can be marked Success only after owner approval'
        });
      }
      updateData.status = 'Confirmed';
      updateData.bookingCompletedAt = new Date();
    }

    const booking = await EasyPGBooking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('ownerId', 'fullName email phone')
      .populate('tenantUserId', 'fullName email phone')
      .populate('pgId', 'pgName location')
      .populate('paymentId', 'transactionId paymentStatus amountPaid paymentDate');

    emitEvent(req, 'easyPGBookingUpdated', 'BOOKING_UPDATED', booking);

    res.json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH owner approval action
router.patch('/:id/owner-approval', [
  authenticateToken,
  requireAdmin,
  body('approval').isIn(['Approved', 'Rejected']).withMessage('Approval must be Approved or Rejected'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await EasyPGBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const now = new Date();
    booking.ownerApprovalStatus = req.body.approval;
    booking.ownerApprovalNotes = req.body.notes?.trim() || '';

    if (req.body.approval === 'Approved') {
      booking.ownerApprovedAt = now;
      booking.ownerRejectedAt = null;
      booking.status = 'Pending';
      if (booking.paymentStatus === 'NotInitiated') booking.paymentStatus = 'Pending';
    } else {
      booking.ownerRejectedAt = now;
      booking.ownerApprovedAt = null;
      booking.status = 'Cancelled';
      if (booking.paymentStatus === 'NotInitiated' || booking.paymentStatus === 'Pending') {
        booking.paymentStatus = 'Failed';
      }
    }

    booking.updatedAt = now;
    await booking.save();

    const populatedBooking = await EasyPGBooking.findById(booking._id)
      .populate('ownerId', 'fullName email phone')
      .populate('tenantUserId', 'fullName email phone')
      .populate('pgId', 'pgName location')
      .populate('paymentId', 'transactionId paymentStatus amountPaid paymentDate');

    emitEvent(req, 'easyPGBookingUpdated', 'BOOKING_UPDATED', populatedBooking);
    emitEvent(req, 'easyPGBookingOwnerDecision', 'BOOKING_OWNER_DECISION', {
      bookingId: populatedBooking._id,
      decision: populatedBooking.ownerApprovalStatus,
      ownerApprovalNotes: populatedBooking.ownerApprovalNotes,
      tenantUserId: populatedBooking.tenantUserId?._id || populatedBooking.tenantUserId || null
    });

    res.json({
      message: `Booking ${req.body.approval.toLowerCase()} successfully`,
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE booking
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const booking = await EasyPGBooking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGBookingDeleted', {
      type: 'BOOKING_DELETED',
      data: { id: req.params.id },
      timestamp: new Date()
    });

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET booking statistics
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await EasyPGBooking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$count' },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'Pending'] }, '$count', 0]
            }
          },
          confirmed: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'Confirmed'] }, '$count', 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'Cancelled'] }, '$count', 0]
            }
          }
        }
      }
    ]);

    const monthlyStats = await EasyPGBooking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalBookings: stats[0]?.total || 0,
      statusBreakdown: {
        pending: stats[0]?.pending || 0,
        confirmed: stats[0]?.confirmed || 0,
        cancelled: stats[0]?.cancelled || 0
      },
      monthlyBreakdown: monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
