const PG = require('../models/pgModel');
const Booking = require('../models/bookingModel');
const Tenant = require('../models/tenantModel');
const { buildAgreementPreviewDataByPgId, writePdfToStream } = require('../utils/agreementPdf');

const CITY_ALIASES = {
  ahmedabad: ["ahmedabad", "ahemdabad", "amdavad"],
};

const buildCityMatchers = (cityRaw) => {
  const city = String(cityRaw || "").trim();
  if (!city || city === "-- Select --" || city === "Any") return null;
  const key = city.toLowerCase();
  return CITY_ALIASES[key] || [city];
};

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const buildHouseRules = (rules = {}, legacyHouseRules = []) => {
  const resolvedRules = rules && typeof rules === "object" ? rules : {};
  const hasRulesPayload =
    Object.prototype.hasOwnProperty.call(resolvedRules, "smoking") ||
    Object.prototype.hasOwnProperty.call(resolvedRules, "alcohol") ||
    Object.prototype.hasOwnProperty.call(resolvedRules, "visitors") ||
    Object.prototype.hasOwnProperty.call(resolvedRules, "pets") ||
    Object.prototype.hasOwnProperty.call(resolvedRules, "curfew");

  if (!hasRulesPayload && Array.isArray(legacyHouseRules) && legacyHouseRules.length > 0) {
    return legacyHouseRules.filter(Boolean);
  }

  const formatted = [
    `Smoking: ${resolvedRules.smoking ? "Allowed" : "Not allowed"}`,
    `Alcohol: ${resolvedRules.alcohol ? "Allowed" : "Not allowed"}`,
    `Visitors: ${resolvedRules.visitors ? "Allowed" : "Not allowed"}`,
    `Pets: ${resolvedRules.pets ? "Allowed" : "Not allowed"}`
  ];

  const curfew = String(resolvedRules.curfew || "").trim();
  if (curfew) {
    formatted.push(`Gate Closing Time: ${curfew}`);
  }

  return formatted;
};

const getTotalBeds = (pg) => {
  if (Array.isArray(pg?.rooms) && pg.rooms.length > 0) {
    const bedsFromRooms = pg.rooms.reduce((sum, room) => {
      const totalRooms = toNumber(room?.totalRooms);
      const bedsPerRoom = Math.max(1, toNumber(room?.bedsPerRoom) || 1);
      return sum + (totalRooms * bedsPerRoom);
    }, 0);
    if (bedsFromRooms > 0) return bedsFromRooms;
  }

  // Fallback when detailed room specs are not present.
  return Math.max(0, toNumber(pg?.totalRooms));
};

const getReservedBedsMap = async (pgIds) => {
  if (!Array.isArray(pgIds) || pgIds.length === 0) return new Map();

  const rows = await Booking.aggregate([
    {
      $match: {
        pgId: { $in: pgIds },
        status: "Confirmed",
        isPaid: true
      }
    },
    // Exclude bookings whose tenant has completed move-out.
    // A move-out completion sets Tenant.status="Inactive" and moveOutCompletedAt.
    {
      $lookup: {
        from: Tenant.collection.name,
        let: {
          bookingPgId: "$pgId",
          bookingOwnerId: "$ownerId",
          bookingTenantEmail: { $ifNull: ["$tenantEmail", ""] },
          bookingTenantName: { $ifNull: ["$tenantName", ""] }
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$pgId", "$$bookingPgId"] },
                  { $eq: ["$ownerId", "$$bookingOwnerId"] },
                  {
                    $or: [
                      {
                        $and: [
                          {
                            $gt: [
                              { $strLenCP: { $trim: { input: "$$bookingTenantEmail" } } },
                              0
                            ]
                          },
                          {
                            $eq: [
                              { $toLower: { $trim: { input: "$email" } } },
                              { $toLower: { $trim: { input: "$$bookingTenantEmail" } } }
                            ]
                          }
                        ]
                      },
                      {
                        $eq: [
                          { $toLower: { $trim: { input: "$name" } } },
                          { $toLower: { $trim: { input: "$$bookingTenantName" } } }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          { $project: { status: 1, moveOutCompletedAt: 1 } }
        ],
        as: "_matchedTenant"
      }
    },
    {
      $addFields: {
        _latestTenant: { $arrayElemAt: ["$_matchedTenant", 0] }
      }
    },
    {
      $addFields: {
        _tenantMovedOut: {
          $and: [
            { $ne: ["$_latestTenant", null] },
            { $eq: [{ $toLower: { $ifNull: ["$_latestTenant.status", ""] } }, "inactive"] },
            { $ne: ["$_latestTenant.moveOutCompletedAt", null] }
          ]
        }
      }
    },
    {
      $match: {
        _tenantMovedOut: { $ne: true }
      }
    },
    {
      $group: {
        _id: "$pgId",
        reservedBeds: { $sum: { $ifNull: ["$seatsBooked", 1] } }
      }
    }
  ]);

  const byPg = new Map();
  rows.forEach((row) => {
    byPg.set(String(row._id), toNumber(row.reservedBeds));
  });
  return byPg;
};

// 1. Create a New PG Listing
exports.createPG = async (req, res) => {

  try {
    const requestedCategory = String(req.body.forWhom || req.body.type || req.body.gender || "Any").trim();
    const normalizedGender = (() => {
      const key = requestedCategory.toLowerCase();
      if (key === "boys" || key === "boy") return "Boys";
      if (key === "girls" || key === "girl") return "Girls";
      return "Any";
    })();

    // DATA MAPPING: Ensuring frontend 'rent' or 'name' matches backend 'price' or 'pgName'
    const pgData = {
      ...req.body,
      // 1. FIXED: Added a valid MongoDB ID format for ownerId (Required by your Schema)
      ownerId: req.body.ownerId || "65a123456789012345678901",
      pgName: req.body.pgName || req.body.name, // Support both for now [cite: 2026-01-01]
      // 3. FIXED: Mapping 'city' to 'location' to match your pgSchema
      location: req.body.location || req.body.city,
      price: req.body.price || req.body.rent,   // Support both [cite: 2026-01-06]
      gender: normalizedGender,
      type: requestedCategory || "Any",
      roomType: req.body.roomType || req.body.occupancy || "Any",
      occupancy: req.body.occupancy || req.body.roomType || "Any",
      securityDeposit: Number(req.body.securityDeposit || req.body.deposit || 0) || 0,
      approvalStatus: req.body.approvalStatus || "pending",
      operationalStatus: req.body.operationalStatus || "active",
      status: 'draft'
    };
    const newPg = await PG.create(pgData);
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
      minPrice,
      maxPrice,
      rentCycle, 
      amenities 
    } = req.query;

    let query = { status: 'live' };

    // 1. City Check
    const cityMatchers = buildCityMatchers(city);
    if (cityMatchers) {
      query.$or = [
        ...cityMatchers.map((name) => ({ location: { $regex: name, $options: "i" } })),
        ...cityMatchers.map((name) => ({ city: { $regex: name, $options: "i" } })),
      ];
    }

    // 2. Fix the field name! Is it 'gender' or 'type' in your Atlas? [cite: 2026-01-06]
    if (lookingFor && lookingFor !== "Any") {
      query.gender = lookingFor; // Changed from query.type to query.gender
    }

    if (occupancy && occupancy !== "Any") query.occupancy = occupancy;
    if (rentCycle && rentCycle !== "Any") query.rentCycle = rentCycle;

    // 3. Budget Range Check (min/max)
    const parseBudget = (value) => {
      if (value === undefined || value === null || value === "") return null;
      const num = Number(value);
      if (!Number.isFinite(num) || num < 0) return null;
      return num;
    };

    let min = parseBudget(minBudget ?? minPrice);
    let max = parseBudget(maxBudget ?? maxPrice);

    // If user enters max lower than min, normalize to a valid range.
    if (min !== null && max !== null && min > max) {
      [min, max] = [max, min];
    }

    if (min !== null || max !== null) {
      query.price = {};
      if (min !== null) query.price.$gte = min;
      if (max !== null) query.price.$lte = max;
    }

    // 4. Amenities Check
    if (amenities && amenities !== "") {
      const amenitiesArray = amenities.split(",").filter(a => a.trim() !== "");
      if (amenitiesArray.length > 0) {
        query.amenities = { $in: amenitiesArray };
      }
    }

    // 5. EXECUTE THE DATABASE QUERY (THIS WAS MISSING!)
    const results = await PG.find(query);
    const reservedBedsByPg = await getReservedBedsMap(results.map((pg) => pg._id));

    // 5. CamelCase Mapping for frontend consistency [cite: 2026-01-01]
    const mappedResults = results.map(pg => {
      const totalBeds = getTotalBeds(pg);
      const reservedBeds = reservedBedsByPg.get(String(pg._id)) || 0;
      const availableBeds = Math.max(0, totalBeds - reservedBeds);

      return ({
      ...pg._doc,
      name: pg.pgName,
      rent: pg.price,
      rentPerMonth: pg.price,
      deposit: pg.securityDeposit || 0,
      totalBeds,
      availableBeds,
      reservedBeds,
      roomType: pg.roomType || pg.occupancy || "Any",
      type: pg.type || pg.gender || "Any",
      approval: pg.approvalStatus || (pg.status === "live" ? "confirmed" : "pending"),
      houseRules: buildHouseRules(pg.rules, pg.houseRules)
      });
    });

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

/* exports.getAllPgs = async (req, res) => {
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
*/

exports.getAllPgs = async (req, res) => {
  try {
    // 1. Destructure all possible filters from the frontend [cite: 2026-01-01]
    const { city, propertyType, occupancy, forCategory } = req.query; 
    
    // Start with a base query (showing only live PGs) [cite: 2026-01-06]
    let query = { status: 'live' };

    // 2. Filter by City (mapping to 'location' as per your createPG logic) [cite: 2026-01-06]
    const cityMatchers = buildCityMatchers(city);
    if (cityMatchers) {
      // Match against both location and city, including common spellings/aliases.
      query.$or = [
        ...cityMatchers.map((name) => ({ location: { $regex: name, $options: "i" } })),
        ...cityMatchers.map((name) => ({ city: { $regex: name, $options: "i" } })),
      ];
    }

    // 3. Filter by Property Type (Independent/Flat/etc.) [cite: 2026-01-07]
    if (propertyType && propertyType !== "Any") {
      query.propertyType = propertyType;
    }

    // 4. Filter by Category (Boys/Girls/Combined) [cite: 2026-01-06]
    if (forCategory && forCategory !== "Any") {
      query.gender = forCategory; // Ensure this matches your searchPGs 'gender' field [cite: 2026-01-06]
    }

    // 5. Filter by Occupancy (Single/Double/etc.) [cite: 2026-01-07]
    if (occupancy && occupancy !== "Any") {
      query.occupancy = occupancy;
    }

    const allPgs = await PG.find(query);
    const reservedBedsByPg = await getReservedBedsMap(allPgs.map((pg) => pg._id));

    // 6. Map results to camelCase to stay consistent with frontend [cite: 2026-01-01]
    const mappedPgs = allPgs.map(pg => {
      const totalBeds = getTotalBeds(pg);
      const reservedBeds = reservedBedsByPg.get(String(pg._id)) || 0;
      const availableBeds = Math.max(0, totalBeds - reservedBeds);

      return ({
      ...pg._doc,
      name: pg.pgName, 
      rent: pg.price,
      rentPerMonth: pg.price,
      deposit: pg.securityDeposit || 0,
      totalBeds,
      availableBeds,
      reservedBeds,
      roomType: pg.roomType || pg.occupancy || "Any",
      type: pg.type || pg.gender || "Any",
      approval: pg.approvalStatus || (pg.status === "live" ? "confirmed" : "pending"),
      houseRules: buildHouseRules(pg.rules, pg.houseRules),
      city: pg.location // Send back as 'city' for the frontend dropdowns to update [cite: 2026-01-06]
      });
    });

    res.status(200).json({
      success: true,
      count: mappedPgs.length,
      data: mappedPgs
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Back-end filter error", 
      error: error.message 
    });
  }
};
// Get single PG details for booking page [cite: 2026-01-06]
exports.getPgById = async (req, res) => {
  try {
    const pg = await PG.findOne({ _id: req.params.id, status: 'live' });
    if (!pg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }
    // Mapping fields to match frontend expectations [cite: 2026-01-06]
    // Also include Room documents for this PG so frontend can show room-specific images
    let roomDocs = [];
    try {
      const Room = require('../models/roomModel');
      roomDocs = await Room.find({ pgId: pg._id }).lean();
    } catch (e) {
      console.error('Failed to load Room docs for PG:', e.message);
    }

    const reservedBedsByPg = await getReservedBedsMap([pg._id]);
    const totalBeds = getTotalBeds(pg);
    const reservedBeds = reservedBedsByPg.get(String(pg._id)) || 0;
    const availableBeds = Math.max(0, totalBeds - reservedBeds);

    const responseData = {
      ...pg._doc,
      name: pg.pgName, // Fixes missing name on card [cite: 2026-01-01]
      rent: pg.price,  // Fixes 0 price if frontend looks for 'rent' [cite: 2026-01-06]
      rentPerMonth: pg.price,
      deposit: pg.securityDeposit || 0,
      totalBeds,
      availableBeds,
      reservedBeds,
      roomType: pg.roomType || pg.occupancy || "Any",
      type: pg.type || pg.gender || "Any",
      approval: pg.approvalStatus || (pg.status === "live" ? "confirmed" : "pending"),
      houseRules: buildHouseRules(pg.rules, pg.houseRules),
      roomDocs,
      // Include agreement template for booking page
      agreementTemplate: pg.agreementTemplate || null
    };
    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPgAgreementPreview = async (req, res) => {
  try {
    const roomType = String(req.query?.roomType || "").trim();
    const variantLabel = String(req.query?.variantLabel || "").trim();

    const built = await buildAgreementPreviewDataByPgId(req.params.id, {
      roomType,
      variantLabel
    });

    const fileToken = String(built.safePgToken || req.params.id).replace(/[^a-zA-Z0-9_-]/g, "");
    const fileName = `agreement-preview-${fileToken}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=\"${fileName}\"`);

    await writePdfToStream({ stream: res, agreementData: built.agreementData });
    return;
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
