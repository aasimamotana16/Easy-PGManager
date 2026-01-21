const PG = require('../models/pgModel');

// 1. Create a New PG Listing
exports.createPG = async (req, res) => {
  try {
    const newPg = await PG.create(req.body);
    res.status(201).json({
      success: true,
      message: "PG Listing created successfully!",
      data: newPg
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create PG listing",
      error: error.message
    });
  }
};

// 2. Search Logic (Keep your existing filters)
exports.searchPGs = async (req, res) => {
  try {
    const { 
      city,
      lookingFor, 
      occupancy, 
      minBudget, 
      maxBudget, 
      rentCycle, 
      amenities 
    } = req.query;

    let query = { status: 'live' }; 

    // Professional Logic: Only filter by city if it's a valid selection [cite: 2026-01-06]
    if (city && city !== "-- Select --" && city !== "Any") {
      query.city = city; 
    }

    if (lookingFor && lookingFor !== "Any") query.type = lookingFor;
    if (occupancy && occupancy !== "Any") query.occupancy = occupancy;
    if (rentCycle && rentCycle !== "Any") query.rentCycle = rentCycle;

    if (minBudget || maxBudget) {
      query.price = {};
      if (minBudget) query.price.$gte = Number(minBudget);
      if (maxBudget) query.price.$lte = Number(maxBudget);
    }

    if (amenities) {
      const amenitiesList = amenities.split(",").map(item => item.trim());
      query.amenities = { $all: amenitiesList };
    }

    const results = await PG.find(query);
    // YOU NEED TO ADD THIS MAPPING HERE TOO [cite: 2026-01-06]
    const mappedResults = results.map(pg => ({
      ...pg._doc,
      name: pg.pgName, // Fixes name in search results [cite: 2026-01-01]
      rent: pg.price   // Fixes price in search results [cite: 2026-01-06]
    }));
    res.status(200).json({ 
      success: true, 
      count: results.length, 
      data: mappedResults
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error searching listings", 
      error: error.message 
    });
  }
};

// 3. Updated Function to handle city filtering correctly [cite: 2026-01-06]
exports.getAllPgs = async (req, res) => {
  try {
    // 1. Capture city from the request query [cite: 2026-01-06]
    const { city } = req.query; 
    
    // 2. Define the base query [cite: 2026-01-06]
    let query = { status: 'live' };

   // Professional matching: Trim spaces and ignore case [cite: 2026-01-06]
    if (city && city.trim() !== "" && city !== "-- Select --" && city !== "Any") {
      query.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') }; 
    }

    // 4. Run the query with the filters included [cite: 2026-01-06]
    const allPgs = await PG.find(query);

    const mappedPgs = allPgs.map(pg => ({
      ...pg._doc,
      name: pg.pgName, // [cite: 2026-01-01]
      rent: pg.price   // [cite: 2026-01-06]
    }));

    res.status(200).json({
      success: true,
      data: mappedPgs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching filtered PGs",
      error: error.message
    });
  }
};
// Get single PG details for booking page [cite: 2026-01-06]
exports.getPgById = async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id);
    if (!pg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }
    // Mapping fields to match frontend expectations [cite: 2026-01-06]
    const responseData = {
      ...pg._doc,
      name: pg.pgName, // Fixes missing name on card [cite: 2026-01-01]
      rent: pg.price   // Fixes 0 price if frontend looks for 'rent' [cite: 2026-01-06]
    };
    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};