const mongoose = require('mongoose');
const Pg = require('../models/pgModel'); // Ensure this points to your PgListing model file

// GET Dashboard Data
const getOwnerDashboardData = async (req, res) => {
  try {
    const testId = "695cadaa3dc3671162608700"; 
    const ownerId = req.user ? req.user.id : testId;

    // Updated to use 'ownerId' to match your model
    const query = { ownerId: new mongoose.Types.ObjectId(ownerId) };

    const totalPgs = await Pg.countDocuments(query);
    
    const roomStats = await Pg.aggregate([
      { $match: query },
      { $group: { 
          _id: null, 
          totalRooms: { $sum: "$totalRooms" }, // Updated to match model field
          liveListings: { $sum: "$liveListings" } // Adding live listings sum
        } 
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalPgs: totalPgs,
        totalRooms: roomStats[0]?.totalRooms || 0,
        liveListings: roomStats[0]?.liveListings || 0, // Now sending this to dashboard
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
    // Destructure using names that match your model
    const { pgName, location, totalRooms, liveListings } = req.body;
    const testId = "695cadaa3dc3671162608700";
    const ownerId = req.user ? req.user.id : testId;

    const newPg = await Pg.create({
      ownerId: ownerId, // Matches model
      pgName,           // Matches model
      location,
      totalRooms: totalRooms || 0,
      liveListings: liveListings || 0,
      status: "live"    // Defaulting to live for testing
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