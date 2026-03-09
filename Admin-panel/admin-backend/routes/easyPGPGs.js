const express = require('express');
const { body, validationResult } = require('express-validator');
const EasyPGPG = require('../models/EasyPGPG');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const toNumberOrUndefined = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getRoomRent = (room) => toNumberOrUndefined(room?.rent ?? room?.price ?? room?.monthlyRent ?? room?.roomRent);
const getRoomDeposit = (room) =>
  toNumberOrUndefined(room?.deposit ?? room?.securityDeposit ?? room?.roomDeposit ?? room?.advanceDeposit);

const firstNonEmptyString = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const normalizeProofDocuments = (payload = {}) => {
  const proof = payload.proofDocuments && typeof payload.proofDocuments === 'object' ? payload.proofDocuments : {};
  const verification = payload.verificationDocuments && typeof payload.verificationDocuments === 'object'
    ? payload.verificationDocuments
    : {};
  const docs = payload.documents && typeof payload.documents === 'object' ? payload.documents : {};

  const aadhaar = firstNonEmptyString(
    proof.aadhaar, proof.aadhar, proof.aadhaarCard,
    verification.aadhaar, verification.aadhar, verification.aadhaarCard,
    docs.aadhaar, docs.aadhar, docs.aadhaarCard,
    payload.aadhaar, payload.aadhar, payload.aadhaarCard, payload.ownerAadhaarCard, payload.ownerAadharCard
  );

  const electricityBill = firstNonEmptyString(
    proof.electricityBill, proof.lightBill,
    verification.electricityBill, verification.lightBill,
    docs.electricityBill, docs.lightBill,
    payload.electricityBill, payload.lightBill
  );

  const propertyTax = firstNonEmptyString(
    proof.propertyTax, proof.propertyTaxReceipt,
    verification.propertyTax, verification.propertyTaxReceipt,
    docs.propertyTax, docs.propertyTaxReceipt,
    payload.propertyTax, payload.propertyTaxReceipt
  );

  const agreement = firstNonEmptyString(
    proof.agreement, proof.rentalAgreement, proof.rentAgreement, proof.agreementDocument, proof.agreementFile,
    verification.agreement, verification.rentalAgreement, verification.rentAgreement, verification.agreementDocument, verification.agreementFile,
    docs.agreement, docs.rentalAgreement, docs.rentAgreement, docs.agreementDocument, docs.agreementFile,
    payload.agreement, payload.rentalAgreement, payload.rentAgreement, payload.agreementDocument, payload.agreementFile, payload.rentalAgreementCopy,
    payload.agreementTemplate?.agreementFileUrl, payload.agreementTemplate?.fileUrl
  );

  const normalized = {};
  if (aadhaar) normalized.aadhaar = aadhaar;
  if (electricityBill) normalized.electricityBill = electricityBill;
  if (propertyTax) normalized.propertyTax = propertyTax;
  if (agreement) normalized.agreement = agreement;

  return Object.keys(normalized).length ? normalized : undefined;
};

const normalizeRooms = (rooms) => {
  if (!Array.isArray(rooms)) return undefined;

  return rooms
    .map((room) => {
      if (!room || typeof room !== 'object') return null;

      const normalizedType = (room.type || room.roomType || '').toString().trim();
      return {
        roomType: normalizedType || undefined,
        type: normalizedType || undefined,
        totalRooms: toNumberOrUndefined(room.totalRooms),
        bedsPerRoom: toNumberOrUndefined(room.bedsPerRoom),
        rent: getRoomRent(room),
        deposit: getRoomDeposit(room),
        description: room.description || room.roomDescription
      };
    })
    .filter(Boolean);
};

const normalizeRoomDeposits = (payload = {}) => {
  const direct = payload.roomDeposits && typeof payload.roomDeposits === 'object' ? payload.roomDeposits : {};
  const byRoom = payload.depositByRoom && typeof payload.depositByRoom === 'object' ? payload.depositByRoom : {};
  const securityByRoom =
    payload.securityDepositByRoom && typeof payload.securityDepositByRoom === 'object'
      ? payload.securityDepositByRoom
      : {};

  const normalized = {
    single: toNumberOrUndefined(direct.single ?? byRoom.single ?? securityByRoom.single),
    double: toNumberOrUndefined(direct.double ?? byRoom.double ?? securityByRoom.double),
    triple: toNumberOrUndefined(direct.triple ?? byRoom.triple ?? securityByRoom.triple),
    other: toNumberOrUndefined(direct.other ?? byRoom.other ?? securityByRoom.other)
  };

  Object.keys(normalized).forEach((key) => {
    if (normalized[key] === undefined) delete normalized[key];
  });

  return Object.keys(normalized).length ? normalized : undefined;
};

const normalizePGPayload = (payload = {}) => {
  const normalized = { ...payload };
  const rentCandidate =
    payload.price ??
    payload.rentPerMonth ??
    payload.monthlyRent ??
    payload.rent;

  const parsedRent = toNumberOrUndefined(rentCandidate);
  if (parsedRent !== undefined) {
    normalized.price = parsedRent;
  }

  if (payload.roomPrices && typeof payload.roomPrices === 'object') {
    normalized.roomPrices = {
      single: toNumberOrUndefined(payload.roomPrices.single),
      double: toNumberOrUndefined(payload.roomPrices.double),
      triple: toNumberOrUndefined(payload.roomPrices.triple),
      other: toNumberOrUndefined(payload.roomPrices.other)
    };
  }

  const normalizedRooms = normalizeRooms(payload.rooms);
  if (normalizedRooms) {
    normalized.rooms = normalizedRooms;
  }

  const normalizedRoomDeposits = normalizeRoomDeposits(payload);
  if (normalizedRoomDeposits) {
    normalized.roomDeposits = normalizedRoomDeposits;

    if (Array.isArray(normalized.rooms)) {
      normalized.rooms = normalized.rooms.map((room) => {
        if (!room) return room;
        const typeKey = (room.type || room.roomType || '').toString().trim().toLowerCase();
        if (!typeKey || room.deposit !== undefined) return room;
        const mappedDeposit = normalizedRoomDeposits[typeKey];
        if (mappedDeposit === undefined) return room;
        return { ...room, deposit: mappedDeposit };
      });
    }
  }

  const normalizedProofDocuments = normalizeProofDocuments(payload);
  if (normalizedProofDocuments) {
    normalized.proofDocuments = {
      ...(payload.proofDocuments && typeof payload.proofDocuments === 'object' ? payload.proofDocuments : {}),
      ...normalizedProofDocuments
    };
  }

  // Backward-compatible base price derivation when only room-wise rent exists.
  if (normalized.price === undefined && Array.isArray(normalized.rooms)) {
    const roomRents = normalized.rooms
      .map((room) => toNumberOrUndefined(room.rent))
      .filter((rent) => rent !== undefined && rent > 0);
    if (roomRents.length) {
      normalized.price = Math.min(...roomRents);
    }
  }

  return normalized;
};

// GET all PGs with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', city = '', type = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { pgName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (city) {
      query.city = city;
    }
    
    if (type) {
      query.type = type;
    }

    const pgs = await EasyPGPG.find(query)
      .populate('ownerId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGPG.countDocuments(query);

    res.json({
      pgs,
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

// GET single PG by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const pg = await EasyPGPG.findById(req.params.id)
      .populate('ownerId', 'fullName email phone');
    
    if (!pg) {
      return res.status(404).json({ message: 'PG not found' });
    }
    
    res.json(pg);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET PGs by owner
router.get('/owner/:ownerId', authenticateToken, async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const pgs = await EasyPGPG.find({ ownerId })
      .populate('ownerId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGPG.countDocuments({ ownerId });

    res.json({
      pgs,
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

// POST new PG
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('pgName').trim().notEmpty().withMessage('PG name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('ownerId').isMongoId().withMessage('Valid owner ID required'),
  body('type').isIn(['Boys', 'Girls', 'Any']).withMessage('Invalid PG type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const pg = new EasyPGPG({
      ...normalizePGPayload(req.body),
      status: 'pending'
    });
    await pg.save();

    const populatedPG = await EasyPGPG.findById(pg._id)
      .populate('ownerId', 'fullName email phone');

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGPGCreated', {
      type: 'PG_CREATED',
      data: populatedPG,
      timestamp: new Date()
    });

    res.status(201).json({
      message: 'PG created successfully',
      pg: populatedPG
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update PG
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('pgName').optional().trim().notEmpty().withMessage('PG name is required'),
  body('location').optional().trim().notEmpty().withMessage('Location is required'),
  body('type').optional().isIn(['Boys', 'Girls', 'Any']).withMessage('Invalid PG type'),
  body('status').optional().isIn(['live', 'pending', 'closed', 'draft']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...normalizePGPayload(req.body), updatedAt: new Date() };

    const pg = await EasyPGPG.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('ownerId', 'fullName email phone');

    if (!pg) {
      return res.status(404).json({ message: 'PG not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGPGUpdated', {
      type: 'PG_UPDATED',
      data: pg,
      timestamp: new Date()
    });

    res.json({
      message: 'PG updated successfully',
      pg
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE PG (soft delete)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pg = await EasyPGPG.findByIdAndUpdate(
      req.params.id,
      { status: 'closed', updatedAt: new Date() },
      { new: true }
    );

    if (!pg) {
      return res.status(404).json({ message: 'PG not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGPGDeleted', {
      type: 'PG_DELETED',
      data: { id: req.params.id },
      timestamp: new Date()
    });

    res.json({ message: 'PG deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET PG statistics
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const dashboardSampleStages = [
      { $sort: { updatedAt: -1, createdAt: -1 } },
      { $limit: 10 }
    ];

    const stats = await EasyPGPG.aggregate([
      ...dashboardSampleStages,
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
          live: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'live'] }, '$count', 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'pending'] }, '$count', 0]
            }
          },
          closed: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'closed'] }, '$count', 0]
            }
          },
          draft: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'draft'] }, '$count', 0]
            }
          }
        }
      }
    ]);

    const typeStats = await EasyPGPG.aggregate([
      ...dashboardSampleStages,
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const cityStats = await EasyPGPG.aggregate([
      ...dashboardSampleStages,
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalPGs: stats[0]?.total || 0,
      statusBreakdown: {
        live: stats[0]?.live || 0,
        pending: stats[0]?.pending || 0,
        closed: stats[0]?.closed || 0,
        draft: stats[0]?.draft || 0
      },
      typeBreakdown: typeStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topCities: cityStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
