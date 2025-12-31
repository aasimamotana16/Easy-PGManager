import express from "express";
import Room from "../models/roomModel.js";

const router = express.Router();

// Create room
router.post("/create", async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get room by ID
router.get("/:roomId", async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all rooms
router.get("/all", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;