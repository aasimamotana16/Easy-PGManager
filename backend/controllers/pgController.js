const PG = require('../models/pgModel');

exports.searchPGs = async (req, res) => {
  try {
    const { city, type } = req.query; // Get search filters from URL
    
    // Find listings that match BOTH city and type
    const results = await PG.find({ city, type });
    
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Error searching listings", error });
  }
};