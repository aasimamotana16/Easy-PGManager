const express = require('express');
const { body, validationResult } = require('express-validator');
const EasyPGTenant = require('../models/EasyPGTenant');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET all tenants with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', ownerId = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { room: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (ownerId) {
      query.ownerId = ownerId;
    }

    const tenants = await EasyPGTenant.find(query)
      .populate('ownerId', 'fullName email phone')
      .populate('userId', 'fullName email phone')
      .populate('bookingId', 'bookingId status nextPaymentDate')
      .populate('pgRefId', 'pgName location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGTenant.countDocuments(query);

    res.json({
      tenants,
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

// GET single tenant by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const tenant = await EasyPGTenant.findById(req.params.id)
      .populate('ownerId', 'fullName email phone')
      .populate('userId', 'fullName email phone')
      .populate('bookingId', 'bookingId status nextPaymentDate')
      .populate('pgRefId', 'pgName location');
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET tenants by owner
router.get('/owner/:ownerId', authenticateToken, async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const tenants = await EasyPGTenant.find({ ownerId })
      .populate('ownerId', 'fullName email phone')
      .populate('userId', 'fullName email phone')
      .populate('bookingId', 'bookingId status nextPaymentDate')
      .populate('pgRefId', 'pgName location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGTenant.countDocuments({ ownerId });

    res.json({
      tenants,
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

// GET tenants by PG
router.get('/pg/:pgId', authenticateToken, async (req, res) => {
  try {
    const { pgId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const tenants = await EasyPGTenant.find({ pgId: parseInt(pgId) })
      .populate('ownerId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGTenant.countDocuments({ pgId: parseInt(pgId) });

    res.json({
      tenants,
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

// POST new tenant
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('name').trim().notEmpty().withMessage('Tenant name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('ownerId').isMongoId().withMessage('Valid owner ID required'),
  body('userId').optional().isMongoId().withMessage('Valid user ID required'),
  body('bookingId').optional().isMongoId().withMessage('Valid booking ID required'),
  body('pgRefId').optional().isMongoId().withMessage('Valid PG reference ID required'),
  body('pgId').optional().isNumeric().withMessage('PG ID must be a number'),
  body('room').trim().notEmpty().withMessage('Room number is required'),
  body('joiningDate').trim().notEmpty().withMessage('Joining date is required'),
  body('status').optional().isIn(['Active', 'Inactive', 'Pending']).withMessage('Invalid status'),
  body('paymentStatus').optional().isIn(['NotInitiated', 'Pending', 'Success', 'Failed']).withMessage('Invalid payment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tenantPayload = { ...req.body };
    if (tenantPayload.pgId === undefined || tenantPayload.pgId === null || tenantPayload.pgId === '') {
      tenantPayload.pgId = 0;
    }
    const tenant = new EasyPGTenant(tenantPayload);
    await tenant.save();

    const populatedTenant = await EasyPGTenant.findById(tenant._id)
      .populate('ownerId', 'fullName email phone')
      .populate('userId', 'fullName email phone')
      .populate('bookingId', 'bookingId status nextPaymentDate')
      .populate('pgRefId', 'pgName location');

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGTenantCreated', {
      type: 'TENANT_CREATED',
      data: populatedTenant,
      timestamp: new Date()
    });

    res.status(201).json({
      message: 'Tenant created successfully',
      tenant: populatedTenant
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update tenant
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('name').optional().trim().notEmpty().withMessage('Tenant name is required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().trim().notEmpty().withMessage('Phone number is required'),
  body('status').optional().isIn(['Active', 'Inactive', 'Pending']).withMessage('Invalid status'),
  body('paymentStatus').optional().isIn(['NotInitiated', 'Pending', 'Success', 'Failed']).withMessage('Invalid payment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...req.body, updatedAt: new Date() };

    const tenant = await EasyPGTenant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('ownerId', 'fullName email phone')
      .populate('userId', 'fullName email phone')
      .populate('bookingId', 'bookingId status nextPaymentDate')
      .populate('pgRefId', 'pgName location');

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGTenantUpdated', {
      type: 'TENANT_UPDATED',
      data: tenant,
      timestamp: new Date()
    });

    res.json({
      message: 'Tenant updated successfully',
      tenant
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE tenant
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tenant = await EasyPGTenant.findByIdAndDelete(req.params.id);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGTenantDeleted', {
      type: 'TENANT_DELETED',
      data: { id: req.params.id },
      timestamp: new Date()
    });

    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET tenant statistics
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await EasyPGTenant.aggregate([
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
          active: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'Active'] }, '$count', 0]
            }
          },
          inactive: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'Inactive'] }, '$count', 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'Pending'] }, '$count', 0]
            }
          }
        }
      }
    ]);

    const monthlyStats = await EasyPGTenant.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    const pgDistribution = await EasyPGTenant.aggregate([
      {
        $group: {
          _id: '$pgId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalTenants: stats[0]?.total || 0,
      statusBreakdown: {
        active: stats[0]?.active || 0,
        inactive: stats[0]?.inactive || 0,
        pending: stats[0]?.pending || 0
      },
      monthlyBreakdown: monthlyStats,
      pgDistribution
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
