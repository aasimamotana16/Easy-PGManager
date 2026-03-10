const express = require('express');
const { body, validationResult } = require('express-validator');
const EasyPGSupportTicket = require('../models/EasyPGSupportTicket');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const mapStatusToLegacy = (status) => {
  if (status === 'Open') return 'pending';
  if (status === 'In Progress') return 'in-progress';
  if (status === 'Closed') return 'resolved';
  return 'pending';
};

const mapStatusToEasyPG = (status) => {
  if (status === 'pending') return 'Open';
  if (status === 'in-progress') return 'In Progress';
  return 'Closed';
};

const toLegacyComplaint = (ticket) => ({
  _id: ticket._id,
  title: ticket.subject,
  description: ticket.description,
  complainantName: ticket.yourName,
  complainantEmail: ticket.emailAddress,
  complainantPhone: ticket.phone,
  pgId: null,
  type: 'other',
  priority: 'medium',
  status: mapStatusToLegacy(ticket.status),
  assignedTo: null,
  resolution: '',
  resolvedAt: ticket.status === 'Closed' ? ticket.updatedAt : null,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { yourName: { $regex: search, $options: 'i' } },
        { emailAddress: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = mapStatusToEasyPG(status);

    const tickets = await EasyPGSupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGSupportTicket.countDocuments(query);
    res.json({
      complaints: tickets.map(toLegacyComplaint),
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
    const ticket = await EasyPGSupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Complaint not found' });
    res.json(toLegacyComplaint(ticket));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/',
  [
    authenticateToken,
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('complainantName').trim().notEmpty().withMessage('Name is required'),
    body('complainantEmail').isEmail().withMessage('Valid email required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const {
        title,
        description,
        complainantName,
        complainantEmail,
        complainantPhone = ''
      } = req.body;

      const ticket = await EasyPGSupportTicket.create({
        ownerId: req.user._id,
        ticketId: `TKT-${Date.now()}`,
        subject: title,
        description,
        status: 'Open',
        date: new Date().toISOString().slice(0, 10),
        yourName: complainantName,
        emailAddress: complainantEmail,
        phone: complainantPhone
      });

      res.status(201).json({ message: 'Complaint created successfully', complaint: toLegacyComplaint(ticket) });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updateData = {};
    if (req.body.status) updateData.status = mapStatusToEasyPG(req.body.status);
    if (req.body.title) updateData.subject = req.body.title;
    if (req.body.description) updateData.description = req.body.description;

    const ticket = await EasyPGSupportTicket.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!ticket) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ message: 'Complaint updated successfully', complaint: toLegacyComplaint(ticket) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const ticket = await EasyPGSupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
