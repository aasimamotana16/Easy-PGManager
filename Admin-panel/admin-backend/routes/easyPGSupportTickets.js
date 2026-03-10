const express = require('express');
const { body, validationResult } = require('express-validator');
const EasyPGSupportTicket = require('../models/EasyPGSupportTicket');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET all support tickets with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', ownerId = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { yourName: { $regex: search, $options: 'i' } },
        { emailAddress: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (ownerId) {
      query.ownerId = ownerId;
    }

    const tickets = await EasyPGSupportTicket.find(query)
      .populate('ownerId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGSupportTicket.countDocuments(query);

    res.json({
      tickets,
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

// GET single support ticket by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await EasyPGSupportTicket.findById(req.params.id)
      .populate('ownerId', 'fullName email phone');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET support tickets by owner
router.get('/owner/:ownerId', authenticateToken, async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const tickets = await EasyPGSupportTicket.find({ ownerId })
      .populate('ownerId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EasyPGSupportTicket.countDocuments({ ownerId });

    res.json({
      tickets,
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

// POST new support ticket
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('ticketId').trim().notEmpty().withMessage('Ticket ID is required'),
  body('ownerId').isMongoId().withMessage('Valid owner ID required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('yourName').trim().notEmpty().withMessage('Your name is required'),
  body('emailAddress').isEmail().withMessage('Valid email required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('date').trim().notEmpty().withMessage('Date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = new EasyPGSupportTicket(req.body);
    await ticket.save();

    const populatedTicket = await EasyPGSupportTicket.findById(ticket._id)
      .populate('ownerId', 'fullName email phone');

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGSupportTicketCreated', {
      type: 'SUPPORT_TICKET_CREATED',
      data: populatedTicket,
      timestamp: new Date()
    });

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: populatedTicket
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update support ticket
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('status').optional().isIn(['Open', 'In Progress', 'Closed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...req.body, updatedAt: new Date() };

    const ticket = await EasyPGSupportTicket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('ownerId', 'fullName email phone');

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGSupportTicketUpdated', {
      type: 'SUPPORT_TICKET_UPDATED',
      data: ticket,
      timestamp: new Date()
    });

    res.json({
      message: 'Support ticket updated successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE support ticket
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const ticket = await EasyPGSupportTicket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('easyPGSupportTicketDeleted', {
      type: 'SUPPORT_TICKET_DELETED',
      data: { id: req.params.id },
      timestamp: new Date()
    });

    res.json({ message: 'Support ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET support ticket statistics
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await EasyPGSupportTicket.aggregate([
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
          open: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'Open'] }, '$count', 0]
            }
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'In Progress'] }, '$count', 0]
            }
          },
          closed: {
            $sum: {
              $cond: [{ $eq: ['$_id', 'Closed'] }, '$count', 0]
            }
          }
        }
      }
    ]);

    const monthlyStats = await EasyPGSupportTicket.aggregate([
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
      totalTickets: stats[0]?.total || 0,
      statusBreakdown: {
        open: stats[0]?.open || 0,
        inProgress: stats[0]?.inProgress || 0,
        closed: stats[0]?.closed || 0
      },
      monthlyBreakdown: monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
