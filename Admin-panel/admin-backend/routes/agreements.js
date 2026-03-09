const express = require('express');
const { body, validationResult } = require('express-validator');
const EasyPGAgreement = require('../models/EasyPGAgreement');
const EasyPGPG = require('../models/EasyPGPG');
const EasyPGUser = require('../models/EasyPGUser');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const statusFromAgreement = (agreement) => {
  if (agreement.signed) return 'active';
  return 'expired';
};

const toLegacyAgreement = (agreement, pg = null, owner = null) => ({
  _id: agreement._id,
  agreementNumber: agreement.agreementId,
  owner: owner ? { _id: owner._id, name: owner.fullName || owner.name || '', email: owner.email } : null,
  pg: { _id: pg?._id || null, name: agreement.pgName || pg?.pgName || 'N/A' },
  tenantName: agreement.tenantName,
  tenantEmail: agreement.userId?.email || '',
  tenantPhone: agreement.userId?.phone || '',
  tenantIdProof: 'aadhaar',
  tenantIdProofNumber: '',
  roomNumber: agreement.roomNo,
  startDate: agreement.startDate,
  endDate: agreement.endDate,
  monthlyRent: agreement.rentAmount,
  deposit: agreement.securityDeposit,
  terms: '',
  status: statusFromAgreement(agreement),
  documentUrl: '',
  signedByOwner: agreement.signed,
  signedByTenant: agreement.signed,
  createdAt: agreement.createdAt,
  updatedAt: agreement.updatedAt
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (search) {
      query.$or = [
        { agreementId: { $regex: search, $options: 'i' } },
        { tenantName: { $regex: search, $options: 'i' } },
        { pgName: { $regex: search, $options: 'i' } }
      ];
    }

    const agreements = await EasyPGAgreement.find(query)
      .populate('userId', 'fullName name email phone ownerId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const mapped = await Promise.all(
      agreements.map(async (a) => {
        const pg = await EasyPGPG.findOne({ pgName: a.pgName }).select('pgName');
        const owner = a.userId?.ownerId ? await EasyPGUser.findById(a.userId.ownerId).select('fullName name email') : null;
        return toLegacyAgreement(a, pg, owner);
      })
    );

    const total = await EasyPGAgreement.countDocuments(query);
    res.json({
      agreements: mapped,
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
    const agreement = await EasyPGAgreement.findById(req.params.id).populate('userId', 'fullName name email phone ownerId');
    if (!agreement) return res.status(404).json({ message: 'Agreement not found' });
    const pg = await EasyPGPG.findOne({ pgName: agreement.pgName }).select('pgName');
    const owner = agreement.userId?.ownerId ? await EasyPGUser.findById(agreement.userId.ownerId).select('fullName name email') : null;
    res.json(toLegacyAgreement(agreement, pg, owner));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/',
  [
    authenticateToken,
    requireAdmin,
    body('agreementNumber').trim().notEmpty().withMessage('Agreement number is required'),
    body('tenantName').trim().notEmpty().withMessage('Tenant name is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const {
        agreementNumber,
        pg,
        tenantName,
        tenantEmail,
        roomNumber,
        monthlyRent,
        deposit,
        startDate,
        endDate,
        signedByOwner,
        signedByTenant
      } = req.body;

      const pgDoc = pg ? await EasyPGPG.findById(pg).select('pgName') : null;
      const tenantUser =
        (tenantEmail ? await EasyPGUser.findOne({ email: tenantEmail.toLowerCase() }).select('_id') : null) ||
        (await EasyPGUser.findOne({ role: 'user' }).select('_id'));

      if (!tenantUser) {
        return res.status(400).json({ message: 'No user found in EasyPG Manager to attach agreement' });
      }

      const agreement = await EasyPGAgreement.create({
        userId: tenantUser._id,
        agreementId: agreementNumber,
        pgName: pgDoc?.pgName || req.body.pgName || 'N/A',
        roomNo: roomNumber || '',
        tenantName,
        rentAmount: Number(monthlyRent) || 0,
        securityDeposit: Number(deposit) || 0,
        startDate: startDate || '',
        endDate: endDate || '',
        signed: Boolean(signedByOwner && signedByTenant)
      });

      const populated = await EasyPGAgreement.findById(agreement._id).populate('userId', 'fullName name email phone ownerId');
      res.status(201).json({ message: 'Agreement created successfully', agreement: toLegacyAgreement(populated, pgDoc, null) });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updateData = {};
    if (req.body.agreementNumber) updateData.agreementId = req.body.agreementNumber;
    if (req.body.roomNumber !== undefined) updateData.roomNo = req.body.roomNumber;
    if (req.body.tenantName !== undefined) updateData.tenantName = req.body.tenantName;
    if (req.body.monthlyRent !== undefined) updateData.rentAmount = Number(req.body.monthlyRent) || 0;
    if (req.body.deposit !== undefined) updateData.securityDeposit = Number(req.body.deposit) || 0;
    if (req.body.startDate !== undefined) updateData.startDate = req.body.startDate;
    if (req.body.endDate !== undefined) updateData.endDate = req.body.endDate;
    if (req.body.signedByOwner !== undefined || req.body.signedByTenant !== undefined) {
      updateData.signed = Boolean(req.body.signedByOwner && req.body.signedByTenant);
    }

    const agreement = await EasyPGAgreement.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('userId', 'fullName name email phone ownerId');

    if (!agreement) return res.status(404).json({ message: 'Agreement not found' });
    const pg = await EasyPGPG.findOne({ pgName: agreement.pgName }).select('pgName');
    const owner = agreement.userId?.ownerId ? await EasyPGUser.findById(agreement.userId.ownerId).select('fullName name email') : null;
    res.json({ message: 'Agreement updated successfully', agreement: toLegacyAgreement(agreement, pg, owner) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const agreement = await EasyPGAgreement.findByIdAndDelete(req.params.id);
    if (!agreement) return res.status(404).json({ message: 'Agreement not found' });
    res.json({ message: 'Agreement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
