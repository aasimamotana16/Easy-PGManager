const express = require('express');
const router = express.Router();
const Room = require('../models/roomModel');

// Create room
router.post('/create', async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get room by ID
router.get('/:roomId', async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all rooms
router.get('/all', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get rooms for a specific PG (lazy load)
router.get('/pg/:pgId', async (req, res) => {
  try {
    const pgId = req.params.pgId;
    if (!pgId) return res.status(400).json({ success: false, message: 'pgId required' });
    const rooms = await Room.find({ pgId }).lean();
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;