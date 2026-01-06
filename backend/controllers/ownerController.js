const mongoose = require('mongoose');
const Pg = require('../models/pgModel');

// GET Dashboard Data
const getOwnerDashboardData = async (req, res) => {
  try {
    const testId = "695cadaa3dc3671162608700"; // Your Atlas Test ID
    const ownerId = req.user ? req.user.id : testId;

    const query = { owner: new mongoose.Types.ObjectId(ownerId) };

    const totalPgs = await Pg.countDocuments(query);
    
    const roomStats = await Pg.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$numberOfRooms" } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalPgs: totalPgs,
        totalRooms: roomStats[0]?.total || 0,
        recentStatus: "Live from Database"
      },
      recentActivity: [
        { id: "1", action: "System Check", detail: `Found ${totalPgs} properties`, date: new Date().toLocaleDateString() }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST Create New PG
const createPg = async (req, res) => {
  try {
    const { name, location, numberOfRooms, rent } = req.body;
    const testId = "695cadaa3dc3671162608700";
    const ownerId = req.user ? req.user.id : testId;

    const newPg = await Pg.create({
      owner: ownerId,
      name,
      location,
      numberOfRooms,
      rent
    });

    res.status(201).json({
      success: true,
      message: "Property added successfully",
      data: newPg
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getOwnerDashboardData, createPg };