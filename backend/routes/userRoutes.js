import express from "express";
import UserDashboard from "../models/userDashboardModel.js";

const router = express.Router();

// Create dashboard (mock)
router.post("/create", async (req, res) => {
  try {
    const dashboard = await UserDashboard.create(req.body);
    res.json({ success: true, dashboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get dashboard data
router.get("/dashboard", async (req, res) => {
  try {
    const data = await UserDashboard.find();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;