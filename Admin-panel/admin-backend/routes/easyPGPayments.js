const express = require('express');
const { body, validationResult } = require('express-validator');
const EasyPGPayment = require('../models/EasyPGPayment');
const EasyPGBooking = require('../models/EasyPGBooking');
const EasyPGTenant = require('../models/EasyPGTenant');
const EasyPGUser = require('../models/EasyPGUser');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const emitEvent = (req, eventName, type, data) => {
  const io = req.app.get('io');
  if (!io) return;
  io.emit(eventName, { type, data, timestamp: new Date() });
};

const getNextPaymentDate = (paymentDate = new Date()) => {
  const base = new Date(paymentDate);
  if (Number.isNaN(base.getTime())) return null;
  const next = new Date(base);
  next.setMonth(next.getMonth() + 1);
  return next;
};

const toNumericPgId = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const syncBookingAndTenantOnSuccess = async ({ booking, payment, req }) => {
  if (!booking || !payment || payment.paymentStatus !== 'Success') {
    return { booking: null, tenant: null };
  }

  const nextPaymentDate = getNextPaymentDate(payment.paymentDate || new Date());

  const updatedBooking = await EasyPGBooking.findByIdAndUpdate(
    booking._id,
    {
      status: 'Confirmed',
      paymentStatus: 'Success',
      paymentId: payment._id,
      bookingCompletedAt: new Date(),
      nextPaymentDate
    },
    { new: true, runValidators: true }
  )
    .populate('ownerId', 'fullName email phone')
    .populate('tenantUserId', 'fullName email phone')
    .populate('pgId', 'pgName location')
    .populate('paymentId', 'transactionId paymentStatus amountPaid paymentDate');

  const tenantPayload = {
    ownerId: booking.ownerId,
    userId: payment.user || booking.tenantUserId || null,
    bookingId: booking._id,
    name: booking.tenantName || payment.tenantName || 'Tenant',
    phone: booking.tenantPhone || 'N/A',
    email: booking.tenantEmail || 'na@example.com',
    pgId: toNumericPgId(booking.pgId),
    pgRefId: booking.pgId || null,
    pgName: booking.pgName || payment.pgName || null,
    room: booking.roomType || 'N/A',
    joiningDate: booking.checkInDate || new Date().toISOString().slice(0, 10),
    status: 'Active',
    lastPaymentDate: payment.paymentDate || new Date(),
    nextPaymentDate,
    paymentStatus: 'Success'
  };

  const tenant = await EasyPGTenant.findOneAndUpdate(
    { bookingId: booking._id },
    tenantPayload,
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  ).populate('ownerId', 'fullName email phone');

  if (payment.user) {
    await EasyPGUser.findByIdAndUpdate(
      payment.user,
      {
        ownerId: booking.ownerId,
        assignedPg: booking.pgId || null,
        updatedAt: new Date()
      },
      { new: false }
    );
  }

  emitEvent(req, 'easyPGBookingUpdated', 'BOOKING_UPDATED', updatedBooking);
  emitEvent(req, 'easyPGTenantUpdated', 'TENANT_UPDATED', tenant);

  return { booking: updatedBooking, tenant };
};

// GET all payments with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', userId = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { pgName: { $regex: search, $options: 'i' } },
        { tenantName: { $regex: search, $options: 'i' } },
        { paymentMethod: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.paymentStatus = status;
    }
    
    if (userId) {
      query.user = userId;
    }

    const payments = await EasyPGPayment.find(query)
      .populate('bookingId', 'bookingId status ownerApprovalStatus paymentStatus nextPaymentDate')
      .populate('ownerId', 'fullName email phone')
      .populate('user', 'fullName email phone')
      .populate('pgId', 'pgName location')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGPayment.countDocuments(query);

    res.json({
      payments,
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

// GET single payment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const payment = await EasyPGPayment.findById(req.params.id)
      .populate('bookingId', 'bookingId status ownerApprovalStatus paymentStatus nextPaymentDate')
      .populate('ownerId', 'fullName email phone')
      .populate('user', 'fullName email phone')
      .populate('pgId', 'pgName location');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET payments by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const payments = await EasyPGPayment.find({ user: userId })
      .populate('bookingId', 'bookingId status ownerApprovalStatus paymentStatus nextPaymentDate')
      .populate('ownerId', 'fullName email phone')
      .populate('user', 'fullName email phone')
      .populate('pgId', 'pgName location')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGPayment.countDocuments({ user: userId });

    res.json({
      payments,
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

// POST new payment
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('bookingId').optional().isMongoId().withMessage('Valid booking ID required'),
  body('user').optional().isMongoId().withMessage('Valid user ID required'),
  body('amountPaid').isNumeric().withMessage('Amount must be a number'),
  body('month').trim().notEmpty().withMessage('Month is required'),
  body('transactionId').trim().notEmpty().withMessage('Transaction ID is required'),
  body('paymentStatus').isIn(['Success', 'Pending', 'Failed']).withMessage('Invalid payment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let linkedBooking = null;
    const paymentPayload = { ...req.body };

    if (paymentPayload.bookingId) {
      linkedBooking = await EasyPGBooking.findById(paymentPayload.bookingId);
      if (!linkedBooking) {
        return res.status(404).json({ message: 'Booking not found for this payment' });
      }

      if (linkedBooking.ownerApprovalStatus !== 'Approved') {
        return res.status(400).json({
          message: 'Owner approval is required before payment can be processed'
        });
      }

      if (linkedBooking.status === 'Cancelled') {
        return res.status(400).json({ message: 'Cannot process payment for cancelled booking' });
      }

      paymentPayload.ownerId = linkedBooking.ownerId;
      paymentPayload.bookingId = linkedBooking._id;
      if (!paymentPayload.user && linkedBooking.tenantUserId) {
        paymentPayload.user = linkedBooking.tenantUserId;
      }
      if (!paymentPayload.pgId && linkedBooking.pgId) {
        paymentPayload.pgId = linkedBooking.pgId;
      }
      if (!paymentPayload.pgName && linkedBooking.pgName) {
        paymentPayload.pgName = linkedBooking.pgName;
      }
      if (!paymentPayload.tenantName && linkedBooking.tenantName) {
        paymentPayload.tenantName = linkedBooking.tenantName;
      }
    }

    if (!paymentPayload.user) {
      return res.status(400).json({
        message: 'Valid user ID is required (or provide bookingId linked to a tenant user)'
      });
    }

    const payment = new EasyPGPayment(paymentPayload);
    await payment.save();

    const populatedPayment = await EasyPGPayment.findById(payment._id)
      .populate('bookingId', 'bookingId status ownerApprovalStatus paymentStatus nextPaymentDate')
      .populate('ownerId', 'fullName email phone')
      .populate('user', 'fullName email phone')
      .populate('pgId', 'pgName location');

    if (populatedPayment.paymentStatus === 'Success' && linkedBooking) {
      const nextPaymentDate = getNextPaymentDate(populatedPayment.paymentDate || new Date());
      await EasyPGPayment.findByIdAndUpdate(
        populatedPayment._id,
        { nextPaymentDate },
        { new: false }
      );
      populatedPayment.nextPaymentDate = nextPaymentDate;
      await syncBookingAndTenantOnSuccess({ booking: linkedBooking, payment: populatedPayment, req });
    } else if (linkedBooking && (populatedPayment.paymentStatus === 'Pending' || populatedPayment.paymentStatus === 'Failed')) {
      await EasyPGBooking.findByIdAndUpdate(
        linkedBooking._id,
        { paymentStatus: populatedPayment.paymentStatus, updatedAt: new Date() },
        { new: false }
      );
    }

    emitEvent(req, 'easyPGPaymentCreated', 'PAYMENT_CREATED', populatedPayment);

    res.status(201).json({
      message: 'Payment created successfully',
      payment: populatedPayment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update payment
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('paymentStatus').optional().isIn(['Success', 'Pending', 'Failed']).withMessage('Invalid payment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingPayment = await EasyPGPayment.findById(req.params.id);
    if (!existingPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    let linkedBooking = null;

    if (existingPayment.bookingId) {
      linkedBooking = await EasyPGBooking.findById(existingPayment.bookingId);
    }

    if (updateData.paymentStatus === 'Success') {
      if (linkedBooking && linkedBooking.ownerApprovalStatus !== 'Approved') {
        return res.status(400).json({
          message: 'Booking owner approval is required before marking payment as Success'
        });
      }
      updateData.nextPaymentDate = getNextPaymentDate(updateData.paymentDate || existingPayment.paymentDate || new Date());
    }

    const payment = await EasyPGPayment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('bookingId', 'bookingId status ownerApprovalStatus paymentStatus nextPaymentDate')
      .populate('ownerId', 'fullName email phone')
      .populate('user', 'fullName email phone')
      .populate('pgId', 'pgName location');

    if (payment.bookingId) {
      const bookingDoc = await EasyPGBooking.findById(payment.bookingId);
      if (bookingDoc) {
        if (payment.paymentStatus === 'Success') {
          await syncBookingAndTenantOnSuccess({ booking: bookingDoc, payment, req });
        } else {
          await EasyPGBooking.findByIdAndUpdate(
            bookingDoc._id,
            { paymentStatus: payment.paymentStatus, updatedAt: new Date() },
            { new: false }
          );
        }
      }
    }

    emitEvent(req, 'easyPGPaymentUpdated', 'PAYMENT_UPDATED', payment);

    res.json({
      message: 'Payment updated successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE payment
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payment = await EasyPGPayment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGPaymentDeleted', {
      type: 'PAYMENT_DELETED',
      data: { id: req.params.id },
      timestamp: new Date()
    });

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET payment statistics
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await EasyPGPayment.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountPaid' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$count' },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'Success'] }, '$totalAmount', 0]
            }
          },
          success: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'Success'] }, '$count', 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'Pending'] }, '$count', 0]
            }
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'Failed'] }, '$count', 0]
            }
          }
        }
      }
    ]);

    const monthlyRevenue = await EasyPGPayment.aggregate([
      {
        $match: { paymentStatus: 'Success' }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$paymentDate" } },
          revenue: { $sum: '$amountPaid' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalPayments: stats[0]?.total || 0,
      totalRevenue: stats[0]?.totalRevenue || 0,
      statusBreakdown: {
        success: stats[0]?.success || 0,
        pending: stats[0]?.pending || 0,
        failed: stats[0]?.failed || 0
      },
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
