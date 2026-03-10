const express = require('express');
const { body, validationResult } = require('express-validator');
const EasyPGPG = require('../models/EasyPGPG');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const mapTypeToLegacy = (type) => {
  if (type === 'Boys') return 'boys';
  if (type === 'Girls') return 'girls';
  return 'co-living';
};

const mapTypeToEasyPG = (type) => {
  if (type === 'boys') return 'Boys';
  if (type === 'girls') return 'Girls';
  return 'Any';
};

const mapStatusToLegacy = (status) => {
  if (status === 'live') return 'active';
  if (status === 'closed') return 'inactive';
  return 'maintenance';
};

const mapStatusToEasyPG = (status) => {
  if (status === 'active') return 'live';
  if (status === 'inactive') return 'closed';
  return 'pending';
};

const mapRoomTypeToEasyPG = (roomType) => {
  if (roomType === 'single') return 'Single';
  if (roomType === 'double') return 'Double';
  if (roomType === 'triple') return 'Triple';
  return 'Any';
};

const mapRoomTypeToLegacy = (occupancy) => {
  if (occupancy === 'Single') return 'single';
  if (occupancy === 'Double') return 'double';
  if (occupancy === 'Triple') return 'triple';
  return 'any';
};

const buildAddress = (pg) => {
  const explicit = (pg.address || '').trim();
  if (explicit) return explicit;

  const parts = [pg.area, pg.city, pg.pincode].filter((v) => typeof v === 'string' && v.trim());
  if (parts.length) return parts.join(', ');

  const location = (pg.location || '').trim();
  if (location) return location;

  return 'N/A';
};

const buildRent = (pg) => {
  if (Number.isFinite(pg.price)) return pg.price;

  const roomPrices = pg.roomPrices ? Object.values(pg.roomPrices) : [];
  const roomPriceNumeric = roomPrices
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v > 0);

  const roomRentNumeric = Array.isArray(pg.rooms)
    ? pg.rooms
        .map((room) => Number(room?.rent ?? room?.price))
        .filter((v) => Number.isFinite(v) && v > 0)
    : [];

  const numeric = [...roomPriceNumeric, ...roomRentNumeric];
  if (numeric.length) return Math.min(...numeric);
  return 0;
};

const getRoomRent = (room) => Number(room?.rent ?? room?.price ?? room?.monthlyRent ?? room?.roomRent);
const getRoomDeposit = (room) =>
  Number(room?.deposit ?? room?.securityDeposit ?? room?.roomDeposit ?? room?.advanceDeposit);
const getRoomTypeKey = (value) => (value || '').toString().trim().toLowerCase();

const buildRoomPricing = (pg) => {
  const baseDeposit = Number(pg?.deposit ?? pg?.securityDeposit);
  const resolvedBaseDeposit = Number.isFinite(baseDeposit) && baseDeposit > 0 ? baseDeposit : null;
  const roomDeposits = pg.roomDeposits && typeof pg.roomDeposits === 'object' ? pg.roomDeposits : {};
  const resolveDepositByType = (type) => {
    const key = getRoomTypeKey(type);
    const mapped = Number(roomDeposits[key]);
    return Number.isFinite(mapped) && mapped > 0 ? mapped : null;
  };

  const roomsFromArray = Array.isArray(pg.rooms)
    ? pg.rooms
    .map((room) => {
      const type = (room?.type || room?.roomType || '').toString().trim();
      const rent = getRoomRent(room);
      const directDeposit = getRoomDeposit(room);
      const depositFromType = resolveDepositByType(type);
      const deposit = Number.isFinite(directDeposit) && directDeposit > 0 ? directDeposit : depositFromType;

      return {
        type: type || 'N/A',
        rent: Number.isFinite(rent) ? rent : null,
        deposit: Number.isFinite(deposit) ? deposit : null,
        description: room?.description || room?.roomDescription || ''
      };
    })
    .filter((room) => room.type || room.rent !== null || room.deposit !== null)
    : [];

  const roomPrices = pg.roomPrices && typeof pg.roomPrices === 'object' ? pg.roomPrices : {};
  const roomsFromRoomPrices = [
    { key: 'single', label: 'Single' },
    { key: 'double', label: 'Double' },
    { key: 'triple', label: 'Triple' },
    { key: 'other', label: 'Other' }
  ]
    .map((entry) => {
      const rent = Number(roomPrices[entry.key]);
      if (!Number.isFinite(rent) || rent <= 0) return null;
      const roomTypeDeposit = resolveDepositByType(entry.key);
      return {
        type: entry.label,
        rent,
        deposit: roomTypeDeposit !== null ? roomTypeDeposit : resolvedBaseDeposit,
        description: ''
      };
    })
    .filter(Boolean);

  // Prefer detailed rooms[] pricing; fallback to roomPrices object when needed.
  let resolved = roomsFromArray.length ? roomsFromArray : roomsFromRoomPrices;

  // Last-resort compatibility fallback: if rooms exist but rent is absent,
  // expose base PG price so admin table doesn't show N/A.
  const baseRent = Number(pg.price);
  if (resolved.length && resolved.every((room) => room.rent === null) && Number.isFinite(baseRent) && baseRent > 0) {
    resolved = resolved.map((room) => ({ ...room, rent: baseRent }));
  }

  // Final fallback for very old records that only have PG-level price.
  if (!resolved.length && Number.isFinite(baseRent) && baseRent > 0) {
    resolved = [
      {
        type: 'Standard',
        rent: baseRent,
        deposit: resolvedBaseDeposit,
        description: ''
      }
    ];
  }

  return resolved;
};

const buildDeposit = (pg) => {
  const roomDeposits = Array.isArray(pg.rooms)
    ? pg.rooms
        .map((room) => getRoomDeposit(room))
        .filter((value) => Number.isFinite(value) && value > 0)
    : [];

  if (roomDeposits.length) return Math.min(...roomDeposits);

  const mappedRoomDeposits = pg.roomDeposits && typeof pg.roomDeposits === 'object'
    ? Object.values(pg.roomDeposits)
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
    : [];

  if (mappedRoomDeposits.length) return Math.min(...mappedRoomDeposits);

  const directDeposit = Number(pg?.deposit ?? pg?.securityDeposit);
  if (Number.isFinite(directDeposit) && directDeposit > 0) return directDeposit;

  return 0;
};

const toLegacyPG = (pg) => ({
  _id: pg._id,
  name: pg.pgName || '',
  owner: pg.ownerId
    ? {
        _id: pg.ownerId._id,
        name: pg.ownerId.fullName || pg.ownerId.name || '',
        email: pg.ownerId.email
      }
    : null,
  address: buildAddress(pg),
  city: pg.city || '',
  state: '',
  pincode: pg.pincode || '',
  type: mapTypeToLegacy(pg.type),
  roomType: mapRoomTypeToLegacy(pg.occupancy),
  totalRooms: pg.totalRooms || 0,
  availableRooms: pg.liveListings || 0,
  rentPerMonth: buildRent(pg),
  deposit: buildDeposit(pg),
  roomPricing: buildRoomPricing(pg),
  amenities: pg.amenities || [],
  images: pg.mainImage ? [pg.mainImage] : [],
  description: pg.description || '',
  status: mapStatusToLegacy(pg.status),
  approvalStatus: pg.status === 'live' ? 'confirmed' : pg.status === 'closed' ? 'cancelled' : 'pending',
  documentVerificationStatus: pg.documentVerification?.status || 'pending',
  createdAt: pg.createdAt,
  updatedAt: pg.updatedAt
});

const hasValidRent = (legacyPG) => {
  const baseRent = Number(legacyPG.rentPerMonth);
  if (Number.isFinite(baseRent) && baseRent > 0) return true;

  if (!Array.isArray(legacyPG.roomPricing)) return false;
  return legacyPG.roomPricing.some((room) => {
    const rent = Number(room?.rent);
    return Number.isFinite(rent) && rent > 0;
  });
};

const isBrokenLegacyPG = (legacyPG) => {
  const ownerName = (legacyPG?.owner?.name || '').trim();
  const address = (legacyPG?.address || '').trim();
  const city = (legacyPG?.city || '').trim();
  const hasRent = hasValidRent(legacyPG);

  return !ownerName && (!address || address === 'N/A') && !city && !hasRent;
};

const normalizeRoomPrices = (roomPrices) => {
  if (!roomPrices || typeof roomPrices !== 'object') return null;

  const normalized = {};
  const single = Number(roomPrices.single);
  const double = Number(roomPrices.double);
  const triple = Number(roomPrices.triple);
  const other = Number(roomPrices.other);

  if (Number.isFinite(single) && single > 0) normalized.single = single;
  if (Number.isFinite(double) && double > 0) normalized.double = double;
  if (Number.isFinite(triple) && triple > 0) normalized.triple = triple;
  if (Number.isFinite(other) && other > 0) normalized.other = other;

  return Object.keys(normalized).length ? normalized : null;
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search = '', status = '', type = '' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { pgName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = mapStatusToEasyPG(status);
    if (type) query.type = mapTypeToEasyPG(type);

    const pgs = await EasyPGPG.find(query)
      .populate('ownerId', 'fullName name email isVerified')
      .lean()
      .sort({ createdAt: -1 })
      .limit(300);

    let legacyPGs = pgs.map(toLegacyPG).filter((pg) => !isBrokenLegacyPG(pg));

    if (search) {
      const s = search.toLowerCase();
      legacyPGs = legacyPGs.filter((pg) => {
        const ownerName = (pg.owner?.name || '').toLowerCase();
        return (
          (pg.name || '').toLowerCase().includes(s) ||
          (pg.address || '').toLowerCase().includes(s) ||
          (pg.city || '').toLowerCase().includes(s) ||
          ownerName.includes(s)
        );
      });
    }

    // Dashboard and list should stay aligned to the same latest 10 visible PGs.
    legacyPGs = legacyPGs.slice(0, 10);
    const total = legacyPGs.length;

    res.json({
      pgs: legacyPGs,
      pagination: {
        current: 1,
        total: 1,
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const pg = await EasyPGPG.findById(req.params.id).populate('ownerId', 'fullName name email').lean();
    if (!pg) return res.status(404).json({ message: 'PG not found' });
    res.json(toLegacyPG(pg));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put(
  '/:id/approval',
  [
    authenticateToken,
    requireAdmin,
    body('action').isIn(['confirm', 'cancel']).withMessage('Action must be confirm or cancel')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { action } = req.body;
      const nextStatus = action === 'confirm' ? 'live' : 'closed';

      if (action === 'confirm') {
        const existingPG = await EasyPGPG.findById(req.params.id).select('documentVerification');
        if (!existingPG) return res.status(404).json({ message: 'PG not found' });

        if (existingPG.documentVerification?.status !== 'approved') {
          return res.status(400).json({
            message: 'Cannot confirm PG. Documents must be approved first from Documents section.'
          });
        }
      }

      const pg = await EasyPGPG.findByIdAndUpdate(
        req.params.id,
        { status: nextStatus, updatedAt: new Date() },
        { new: true }
      ).populate('ownerId', 'fullName name email');

      if (!pg) return res.status(404).json({ message: 'PG not found' });

      res.json({
        message: action === 'confirm' ? 'PG confirmed successfully' : 'PG cancelled successfully',
        pg: toLegacyPG(pg)
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.post(
  '/',
  [
    authenticateToken,
    requireAdmin,
    body('name').trim().notEmpty().withMessage('PG name is required'),
    body('owner').isMongoId().withMessage('Valid owner ID required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const {
        name,
        owner,
        address = '',
        city = '',
        pincode = '',
        type = 'co-living',
        roomType = 'any',
        totalRooms = 0,
        availableRooms = 0,
        rentPerMonth = 0,
        deposit = 0,
      rooms = [],
      roomPrices = {},
      amenities = [],
        images = [],
        description = '',
        status = 'active'
      } = req.body;

      const normalizedRooms = Array.isArray(rooms)
        ? rooms
            .map((room) => {
              if (!room || typeof room !== 'object') return null;
              const type = (room.type || room.roomType || '').toString().trim();
              const rent = getRoomRent(room);
              const deposit = getRoomDeposit(room);
              return {
                roomType: type || undefined,
                type: type || undefined,
                totalRooms: Number.isFinite(Number(room.totalRooms)) ? Number(room.totalRooms) : undefined,
                bedsPerRoom: Number.isFinite(Number(room.bedsPerRoom)) ? Number(room.bedsPerRoom) : undefined,
                rent: Number.isFinite(rent) ? rent : undefined,
                deposit: Number.isFinite(deposit) ? deposit : undefined,
                description: room.description || room.roomDescription
              };
            })
            .filter(Boolean)
        : [];

      const fallbackRentFromRooms = normalizedRooms
        .map((room) => Number(room.rent))
        .filter((value) => Number.isFinite(value) && value > 0);

      const normalizedRoomPrices = normalizeRoomPrices(roomPrices);
      const fallbackRentFromRoomPrices = normalizedRoomPrices
        ? Object.values(normalizedRoomPrices).filter((value) => Number.isFinite(value) && value > 0)
        : [];

      const pg = await EasyPGPG.create({
        ownerId: owner,
        pgName: name,
        location: address || city || 'N/A',
        address,
        city,
        pincode,
        type: mapTypeToEasyPG(type),
        occupancy: mapRoomTypeToEasyPG(roomType),
        totalRooms: Number(totalRooms) || 0,
        liveListings: Number(availableRooms) || 0,
        price:
          Number(rentPerMonth) ||
          (
            [...fallbackRentFromRooms, ...fallbackRentFromRoomPrices].length
              ? Math.min(...[...fallbackRentFromRooms, ...fallbackRentFromRoomPrices])
              : 0
          ),
        deposit: Number(deposit) || 0,
        rooms: normalizedRooms,
        roomPrices: normalizedRoomPrices || undefined,
        amenities,
        mainImage: images[0] || undefined,
        description,
        status: mapStatusToEasyPG(status)
      });

      const populated = await EasyPGPG.findById(pg._id).populate('ownerId', 'fullName name email');
      res.status(201).json({ message: 'PG created successfully', pg: toLegacyPG(populated) });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      owner,
      address,
      city,
      pincode,
      type,
      roomType,
      totalRooms,
      availableRooms,
      rentPerMonth,
      deposit,
      rooms,
      roomPrices,
      amenities,
      images,
      description,
      status
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.pgName = name;
    if (owner !== undefined) updateData.ownerId = owner;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (type !== undefined) updateData.type = mapTypeToEasyPG(type);
    if (roomType !== undefined) updateData.occupancy = mapRoomTypeToEasyPG(roomType);
    if (totalRooms !== undefined) updateData.totalRooms = Number(totalRooms) || 0;
    if (availableRooms !== undefined) updateData.liveListings = Number(availableRooms) || 0;
    if (rentPerMonth !== undefined) updateData.price = Number(rentPerMonth) || 0;
    if (deposit !== undefined) updateData.deposit = Number(deposit) || 0;
    if (rooms !== undefined && Array.isArray(rooms)) {
      const normalizedRooms = rooms
        .map((room) => {
          if (!room || typeof room !== 'object') return null;
          const type = (room.type || room.roomType || '').toString().trim();
          const rent = getRoomRent(room);
          const deposit = getRoomDeposit(room);
          return {
            roomType: type || undefined,
            type: type || undefined,
            totalRooms: Number.isFinite(Number(room.totalRooms)) ? Number(room.totalRooms) : undefined,
            bedsPerRoom: Number.isFinite(Number(room.bedsPerRoom)) ? Number(room.bedsPerRoom) : undefined,
            rent: Number.isFinite(rent) ? rent : undefined,
            deposit: Number.isFinite(deposit) ? deposit : undefined,
            description: room.description || room.roomDescription
          };
        })
        .filter(Boolean);

      updateData.rooms = normalizedRooms;

      if (rentPerMonth === undefined) {
        const roomRents = normalizedRooms
          .map((room) => Number(room.rent))
          .filter((value) => Number.isFinite(value) && value > 0);
        if (roomRents.length) {
          updateData.price = Math.min(...roomRents);
        }
      }
    }
    if (roomPrices !== undefined) {
      const normalizedRoomPrices = normalizeRoomPrices(roomPrices);
      updateData.roomPrices = normalizedRoomPrices || {};

      if (rentPerMonth === undefined && updateData.price === undefined && normalizedRoomPrices) {
        const roomPriceValues = Object.values(normalizedRoomPrices).filter(
          (value) => Number.isFinite(value) && value > 0
        );
        if (roomPriceValues.length) {
          updateData.price = Math.min(...roomPriceValues);
        }
      }
    }
    if (amenities !== undefined) updateData.amenities = amenities;
    if (images && images[0]) updateData.mainImage = images[0];
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = mapStatusToEasyPG(status);

    const pg = await EasyPGPG.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('ownerId', 'fullName name email');

    if (!pg) return res.status(404).json({ message: 'PG not found' });
    res.json({ message: 'PG updated successfully', pg: toLegacyPG(pg) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pg = await EasyPGPG.findByIdAndDelete(req.params.id);
    if (!pg) return res.status(404).json({ message: 'PG not found' });
    res.json({ message: 'PG deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
