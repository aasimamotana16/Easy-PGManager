const PG = require('../models/pgModel');

// 1. Existing Search Logic
exports.searchPGs = async (req, res) => {
  try {
    const { city, type } = req.query; 
    const results = await PG.find({ city, type });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Error searching listings", error });
  }
};

// 2. NEW: All-in-One API for "Available PGs" [cite: 2026-01-11]
// This sends images, price, and 2nd-page details in one go
exports.getAllPgs = async (req, res) => {
  try {
    // We only fetch 'live' PGs to show on the home page [cite: 2026-01-06]
    const allPgs = await PG.find({ status: 'live' });
    
    res.status(200).json({
      success: true,
      data: allPgs // Frontend uses this for both Page 1 and Page 2 [cite: 2026-01-11]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching PGs" });
  }
};