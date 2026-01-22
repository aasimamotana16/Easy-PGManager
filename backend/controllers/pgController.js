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

    // 1. City Check
    if (city && city !== "Any") {
      query.city = city; 
    }

    // 2. Fix the field name! Is it 'gender' or 'type' in your Atlas? [cite: 2026-01-06]
    if (lookingFor && lookingFor !== "Any") {
      query.gender = lookingFor; // Changed from query.type to query.gender
    }

    if (occupancy && occupancy !== "Any") query.occupancy = occupancy;
    if (rentCycle && rentCycle !== "Any") query.rentCycle = rentCycle;

    // 3. Price Check
    if (minBudget || maxBudget) {
      query.price = {};
      if (minBudget) query.price.$gte = Number(minBudget);
      if (maxBudget) query.price.$lte = Number(maxBudget);
    }

    // 4. Amenities Check
    if (amenities && amenities.length > 0) {
      const amenitiesList = amenities.split(",").map(item => item.trim());
      query.amenities = { $all: amenitiesList };
    }

    const results = await PG.find(query);

    // 5. CamelCase Mapping for frontend consistency [cite: 2026-01-01]
    const mappedResults = results.map(pg => ({
      ...pg._doc,
      name: pg.pgName,
      rent: pg.price
    }));

    res.status(200).json({ 
      success: true, 
      count: results.length, 
      data: mappedResults
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// backend/controllers/pgController.js

// backend/controllers/pgController.js

exports.getAllPgs = async (req, res) => {
  try {
    const { city } = req.query; 
    let query = { status: 'live' }; // This matches your Atlas data

    if (city && city.trim() !== "" && city !== "-- Select --" && city !== "Any") {
      // 👈 Update this line to use 'location' instead of 'city'
     // query.location = { $regex: city.trim(), $options: 'i' }; 
     query.city = city.trim();    }

    const allPgs = await PG.find(query);

    const mappedPgs = allPgs.map(pg => ({
      ...pg._doc,
      name: pg.pgName, // CamelCase mapping [cite: 2026-01-01]
      rent: pg.price   // Correctly maps 5000 from Atlas
    }));

    res.status(200).json({
      success: true,
      data: mappedPgs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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