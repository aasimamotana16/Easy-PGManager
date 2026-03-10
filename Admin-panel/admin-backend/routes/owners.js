const express = require('express');
const { body, validationResult } = require('express-validator');
const EasyPGUser = require('../models/EasyPGUser');
const EasyPGPG = require('../models/EasyPGPG');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const MANUAL_OWNER_PG_OVERRIDES = {
  'saman2106@gmail.com': 1
};

const mapOwner = async (ownerDoc) => {
  const ownerEmail = (ownerDoc.email || '').toLowerCase();
  const totalPGs = Object.prototype.hasOwnProperty.call(MANUAL_OWNER_PG_OVERRIDES, ownerEmail)
    ? MANUAL_OWNER_PG_OVERRIDES[ownerEmail]
    : await EasyPGPG.countDocuments({ ownerId: ownerDoc._id });
  return {
    _id: ownerDoc._id,
    name: ownerDoc.fullName || ownerDoc.name || '',
    email: ownerDoc.email,
    phone: ownerDoc.phone || '',
    address: ownerDoc.address || '',
    idProof: 'aadhaar',
    idProofNumber: '',
    status: ownerDoc.isVerified ? 'active' : 'inactive',
    totalPGs
  };
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { role: { $in: ['owner', 'OWNER'] } };
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.isVerified = status === 'active';
    }

    const ownerDocs = await EasyPGUser.find(query)
      .select('+address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const owners = await Promise.all(ownerDocs.map(mapOwner));
    const total = await EasyPGUser.countDocuments(query);

    res.json({
      owners,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ownerDoc = await EasyPGUser.findOne({ _id: req.params.id, role: { $in: ['owner', 'OWNER'] } }).select('+address');
    if (!ownerDoc) return res.status(404).json({ message: 'Owner not found' });
    res.json(await mapOwner(ownerDoc));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/',
  [
    authenticateToken,
    requireAdmin,
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, phone = '', address = '', status = 'active' } = req.body;
      const exists = await EasyPGUser.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(400).json({ message: 'Owner already exists with this email' });

      const owner = await EasyPGUser.create({
        fullName: name,
        email: email.toLowerCase(),
        phone,
        address,
        role: 'owner',
        isVerified: status === 'active',
        password: 'Owner@123456'
      });

      res.status(201).json({ message: 'Owner created successfully', owner: await mapOwner(owner) });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;
    const updateData = {};
    if (name) updateData.fullName = name;
    if (email) updateData.email = email.toLowerCase();
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (status) updateData.isVerified = status === 'active';

    const owner = await EasyPGUser.findOneAndUpdate(
      { _id: req.params.id, role: { $in: ['owner', 'OWNER'] } },
      updateData,
      { new: true, runValidators: true }
    ).select('+address');

    if (!owner) return res.status(404).json({ message: 'Owner not found' });
    res.json({ message: 'Owner updated successfully', owner: await mapOwner(owner) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const owner = await EasyPGUser.findOneAndDelete(
      { _id: req.params.id, role: { $in: ['owner', 'OWNER'] } },
    );
    if (!owner) return res.status(404).json({ message: 'Owner not found' });
    res.json({ message: 'Owner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
