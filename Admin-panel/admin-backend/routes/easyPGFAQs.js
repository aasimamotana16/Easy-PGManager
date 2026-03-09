const express = require('express');
const { body, validationResult } = require('express-validator');
const EasyPGFAQ = require('../models/EasyPGFAQ');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const emitEvent = (req, eventName, type, data) => {
  const io = req.app.get('io');
  if (!io) return;
  io.emit(eventName, { type, data, timestamp: new Date() });
};

// GET all FAQs with pagination + filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', status = '' } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const query = {};
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status) query.isActive = status === 'active';

    const [faqs, total] = await Promise.all([
      EasyPGFAQ.find(query)
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      EasyPGFAQ.countDocuments(query)
    ]);

    res.json({
      faqs,
      pagination: {
        current: parseInt(page, 10),
        total: Math.ceil(total / parseInt(limit, 10)),
        count: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET FAQ categories
router.get('/meta/categories', authenticateToken, async (_req, res) => {
  try {
    const categories = await EasyPGFAQ.distinct('category', { category: { $exists: true, $ne: '' } });
    res.json({ categories: categories.sort((a, b) => a.localeCompare(b)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET single FAQ by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const faq = await EasyPGFAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create FAQ
router.post(
  '/',
  [
    authenticateToken,
    requireAdmin,
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('answer').trim().notEmpty().withMessage('Answer is required'),
    body('category').optional().trim(),
    body('displayOrder').optional().isNumeric().withMessage('Display order must be a number'),
    body('isActive').optional().isBoolean().withMessage('isActive must be true/false')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const faq = new EasyPGFAQ(req.body);
      await faq.save();

      emitEvent(req, 'easyPGFAQCreated', 'FAQ_CREATED', faq);

      res.status(201).json({
        message: 'FAQ created successfully',
        faq
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// PUT update FAQ
router.put(
  '/:id',
  [
    authenticateToken,
    requireAdmin,
    body('question').optional().trim().notEmpty().withMessage('Question cannot be empty'),
    body('answer').optional().trim().notEmpty().withMessage('Answer cannot be empty'),
    body('category').optional().trim(),
    body('displayOrder').optional().isNumeric().withMessage('Display order must be a number'),
    body('isActive').optional().isBoolean().withMessage('isActive must be true/false')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const faq = await EasyPGFAQ.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!faq) return res.status(404).json({ message: 'FAQ not found' });

      emitEvent(req, 'easyPGFAQUpdated', 'FAQ_UPDATED', faq);

      res.json({
        message: 'FAQ updated successfully',
        faq
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// DELETE FAQ
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const faq = await EasyPGFAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });

    emitEvent(req, 'easyPGFAQDeleted', 'FAQ_DELETED', { id: req.params.id });

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
