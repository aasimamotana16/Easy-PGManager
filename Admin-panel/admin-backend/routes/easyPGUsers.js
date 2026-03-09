const express = require('express');
const { body, validationResult } = require('express-validator');
const EasyPGUser = require('../models/EasyPGUser');
const EasyPGPG = require('../models/EasyPGPG');
const EasyPGTenant = require('../models/EasyPGTenant');
const EasyPGBooking = require('../models/EasyPGBooking');
const EasyPGAgreement = require('../models/EasyPGAgreement');
const EasyPGPayment = require('../models/EasyPGPayment');
const EasyPGSupportTicket = require('../models/EasyPGSupportTicket');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const PINNED_TENANT_NAME = 'khan saman';
const PINNED_TENANT_EMAIL = 's61429609@gmail.com';

// GET all users with pagination and filtering
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role === 'tenant' ? { $nin: ['owner', 'admin'] } : role;
    }

    const users = await EasyPGUser.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGUser.countDocuments(query);

    res.json({
      users,
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

// GET single user by ID
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await EasyPGUser.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET users by role (tenants, owners, admins)
router.get('/role/:role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10, search = '' } = req.query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    let query = {
      role: role === 'tenant' ? { $nin: ['owner', 'admin'] } : role
    };
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    let users;

    if (role === 'tenant') {
      users = await EasyPGUser.aggregate([
        { $match: query },
        {
          $addFields: {
            pinnedTenantSort: {
              $cond: [
                {
                  $or: [
                    { $eq: [{ $toLower: { $ifNull: ['$email', ''] } }, PINNED_TENANT_EMAIL] },
                    { $eq: [{ $toLower: { $ifNull: ['$fullName', ''] } }, PINNED_TENANT_NAME] },
                    { $eq: [{ $toLower: { $ifNull: ['$name', ''] } }, PINNED_TENANT_NAME] }
                  ]
                },
                1,
                0
              ]
            }
          }
        },
        { $sort: { pinnedTenantSort: -1, createdAt: -1 } },
        { $project: { password: 0, pinnedTenantSort: 0 } },
        { $skip: skip },
        { $limit: parsedLimit }
      ]);
    } else {
      users = await EasyPGUser.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit);
    }

    const total = await EasyPGUser.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parsedPage,
        total: Math.ceil(total / parsedLimit),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST new user
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['user', 'owner', 'admin', 'tenant']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await EasyPGUser.findOne({ 
      $or: [{ email }, { fullName }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new EasyPGUser({
      fullName,
      email,
      password,
      role,
      phone
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGUserCreated', {
      type: 'USER_CREATED',
      data: userResponse,
      timestamp: new Date()
    });

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update user
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('fullName').optional().trim().notEmpty().withMessage('Full name is required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['user', 'owner', 'admin', 'tenant']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, role, phone, isVerified } = req.body;
    
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (phone) updateData.phone = phone;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    updateData.updatedAt = new Date();

    const user = await EasyPGUser.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGUserUpdated', {
      type: 'USER_UPDATED',
      data: user,
      timestamp: new Date()
    });

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE user (hard delete)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await EasyPGUser.findById(userId).select('_id role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ownedPgs = await EasyPGPG.find({ ownerId: userId }).select('_id').lean();
    const ownedPgIds = ownedPgs.map((pg) => pg._id);

    const [
      tenantsResult,
      bookingsResult,
      agreementsResult,
      paymentsResult,
      supportTicketsResult,
      pgsResult,
      linkedUsersResult,
      assignedPgCleanupResult
    ] = await Promise.all([
      EasyPGTenant.deleteMany({
        $or: [{ userId }, { ownerId: userId }]
      }),
      EasyPGBooking.deleteMany({
        $or: [{ tenantUserId: userId }, { ownerId: userId }]
      }),
      EasyPGAgreement.deleteMany({ userId }),
      EasyPGPayment.deleteMany({
        $or: [{ user: userId }, { ownerId: userId }]
      }),
      EasyPGSupportTicket.deleteMany({ ownerId: userId }),
      EasyPGPG.deleteMany({ ownerId: userId }),
      EasyPGUser.updateMany(
        { ownerId: userId },
        { $set: { ownerId: null, updatedAt: new Date() } }
      ),
      ownedPgIds.length > 0
        ? EasyPGUser.updateMany(
            { assignedPg: { $in: ownedPgIds } },
            { $set: { assignedPg: null, updatedAt: new Date() } }
          )
        : Promise.resolve({ modifiedCount: 0 })
    ]);

    await EasyPGUser.findByIdAndDelete(userId);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGUserDeleted', {
      type: 'USER_DELETED',
      data: { id: userId },
      timestamp: new Date()
    });

    res.json({
      message: 'User and related account data deleted successfully',
      deleted: {
        userId,
        tenants: tenantsResult.deletedCount || 0,
        bookings: bookingsResult.deletedCount || 0,
        agreements: agreementsResult.deletedCount || 0,
        payments: paymentsResult.deletedCount || 0,
        supportTickets: supportTicketsResult.deletedCount || 0,
        pgs: pgsResult.deletedCount || 0,
        linkedUsersUnassignedFromOwner: linkedUsersResult.modifiedCount || 0,
        usersUnassignedFromPg: assignedPgCleanupResult.modifiedCount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET user statistics
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await EasyPGUser.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$count' },
          users: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'user'] }, '$count', 0]
            }
          },
          owners: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'owner'] }, '$count', 0]
            }
          },
          admins: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'admin'] }, '$count', 0]
            }
          },
          tenants: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'tenant'] }, '$count', 0]
            }
          }
        }
      }
    ]);

    const verifiedStats = await EasyPGUser.aggregate([
      {
        $group: {
          _id: '$isVerified',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalUsers: stats[0]?.total || 0,
      roleBreakdown: {
        users: stats[0]?.users || 0,
        owners: stats[0]?.owners || 0,
        admins: stats[0]?.admins || 0,
        tenants: stats[0]?.tenants || 0
      },
      verificationBreakdown: verifiedStats.reduce((acc, item) => {
        acc[item._id ? 'verified' : 'unverified'] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
