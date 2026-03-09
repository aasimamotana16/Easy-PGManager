const express = require('express');
const { body, validationResult } = require('express-validator');
const EasyPGAgreement = require('../models/EasyPGAgreement');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET all agreements with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', userId = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { agreementId: { $regex: search, $options: 'i' } },
        { pgName: { $regex: search, $options: 'i' } },
        { tenantName: { $regex: search, $options: 'i' } },
        { roomNo: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (userId) {
      query.userId = userId;
    }

    const agreements = await EasyPGAgreement.find(query)
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGAgreement.countDocuments(query);

    res.json({
      agreements,
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

// GET single agreement by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const agreement = await EasyPGAgreement.findById(req.params.id)
      .populate('userId', 'fullName email phone');
    
    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }
    
    res.json(agreement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET agreements by user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const agreements = await EasyPGAgreement.find({ userId })
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGAgreement.countDocuments({ userId });

    res.json({
      agreements,
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

// POST new agreement
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('agreementId').trim().notEmpty().withMessage('Agreement ID is required'),
  body('userId').isMongoId().withMessage('Valid user ID required'),
  body('pgName').trim().notEmpty().withMessage('PG name is required'),
  body('roomNo').trim().notEmpty().withMessage('Room number is required'),
  body('tenantName').trim().notEmpty().withMessage('Tenant name is required'),
  body('rentAmount').isNumeric().withMessage('Rent amount must be a number'),
  body('securityDeposit').isNumeric().withMessage('Security deposit must be a number'),
  body('startDate').trim().notEmpty().withMessage('Start date is required'),
  body('endDate').trim().notEmpty().withMessage('End date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const agreement = new EasyPGAgreement(req.body);
    await agreement.save();

    const populatedAgreement = await EasyPGAgreement.findById(agreement._id)
      .populate('userId', 'fullName email phone');

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGAgreementCreated', {
      type: 'AGREEMENT_CREATED',
      data: populatedAgreement,
      timestamp: new Date()
    });

    res.status(201).json({
      message: 'Agreement created successfully',
      agreement: populatedAgreement
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update agreement
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('signed').optional().isBoolean().withMessage('Signed must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...req.body, updatedAt: new Date() };

    const agreement = await EasyPGAgreement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email phone');

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGAgreementUpdated', {
      type: 'AGREEMENT_UPDATED',
      data: agreement,
      timestamp: new Date()
    });

    res.json({
      message: 'Agreement updated successfully',
      agreement
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE agreement
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const agreement = await EasyPGAgreement.findByIdAndDelete(req.params.id);

    if (!agreement) {
      return res.status(404).json({ message: 'Agreement not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGAgreementDeleted', {
      type: 'AGREEMENT_DELETED',
      data: { id: req.params.id },
      timestamp: new Date()
    });

    res.json({ message: 'Agreement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET agreement statistics
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await EasyPGAgreement.aggregate([
      {
        $group: {
          _id: '$signed',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$count' },
          signed: {
            $sum: {
              $cond: [{ $eq: ['$_id', true] }, '$count', 0]
            }
          },
          unsigned: {
            $sum: {
              $cond: [{ $eq: ['$_id', false] }, '$count', 0]
            }
          }
        }
      }
    ]);

    const monthlyStats = await EasyPGAgreement.aggregate([
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
      totalAgreements: stats[0]?.total || 0,
      signedBreakdown: {
        signed: stats[0]?.signed || 0,
        unsigned: stats[0]?.unsigned || 0
      },
      monthlyBreakdown: monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
