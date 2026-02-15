const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const Pg = require('../models/pgModel');
const User = require('../models/userModel');
const Tenant = require('../models/tenantModel');
const Booking = require('../models/bookingModel');
const Agreement = require('../models/agreementModel');
const SupportTicket = require('../models/supportTicketModel');
const Payment = require('../models/paymentModel');
const PendingPayment = require('../models/pendingPaymentModel');
const { jsPDF } = require('jspdf');
const { autoTable } = require('jspdf-autotable');

const getMonthLabel = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

const addMonths = (dateInput, months) => {
  const d = new Date(dateInput);
  d.setMonth(d.getMonth() + months);
  return d;
};

const normalizeBaseUrl = (value, fallback = "http://localhost:3000") => {
  const raw = String(value || "").trim();
  const source = raw || fallback;
  const withProtocol = /^https?:\/\//i.test(source) ? source : `http://${source}`;
  return withProtocol.replace(/\/+$/, "");
};

const deriveRentAmount = (pg, roomValue) => {
  const roomKey = String(roomValue || '').toLowerCase();
  const prices = pg?.roomPrices || {};

  if (roomKey.includes('single') && Number(prices.single) > 0) return Number(prices.single);
  if (roomKey.includes('double') && Number(prices.double) > 0) return Number(prices.double);
  if (roomKey.includes('triple') && Number(prices.triple) > 0) return Number(prices.triple);
  if (Number(prices.other) > 0) return Number(prices.other);
  if (Number(pg?.price) > 0) return Number(pg.price);

  const allRoomPrices = Object.values(prices).map((v) => Number(v)).filter((v) => Number.isFinite(v) && v > 0);
  if (allRoomPrices.length > 0) return Math.min(...allRoomPrices);

  return 0;
};

const ensureTenantAgreementRecord = async ({ ownerId, tenant, pg, rentAmount }) => {
  const startDate = tenant.joiningDate || new Date().toISOString().split('T')[0];
  const endDate = addMonths(startDate, 11).toISOString().split('T')[0];
  const agreementId = `AGR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const linkedTenantUser = tenant.email
    ? await User.findOne({ email: tenant.email, role: 'tenant' }).select('_id')
    : null;
  const agreementUserId = linkedTenantUser?._id || ownerId;

  const existingAgreement = await Agreement.findOne({
    pgName: pg.pgName || "",
    tenantName: tenant.name,
    roomNo: tenant.room || "N/A",
    startDate
  });

  if (existingAgreement) {
    return { agreement: existingAgreement, agreementCreated: false };
  }

  const agreement = await Agreement.create({
    userId: agreementUserId,
    agreementId,
    pgName: pg.pgName || "",
    roomNo: tenant.room || "N/A",
    tenantName: tenant.name,
    rentAmount: Number(rentAmount) || 0,
    securityDeposit: Number(rentAmount || 0) * 2,
    startDate,
    endDate,
    signed: true
  });

  return { agreement, agreementCreated: true };
};

const ensureTenantLinkedRecords = async ({ ownerId, tenant, pg }) => {
  const effectiveJoiningDate = tenant.joiningDate || new Date().toISOString().split('T')[0];

  const existingBooking = await Booking.findOne({
    ownerId,
    pgId: pg._id,
    tenantName: tenant.name,
    checkInDate: effectiveJoiningDate
  });

  let booking = existingBooking;
  let bookingCreated = false;
  if (!existingBooking) {
    booking = await Booking.create({
      ownerId,
      pgId: pg._id,
      bookingId: `BK-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      pgName: pg.pgName || "",
      roomType: pg.occupancy || "Single",
      tenantName: tenant.name,
      checkInDate: effectiveJoiningDate,
      checkOutDate: addMonths(effectiveJoiningDate, 11).toISOString().split('T')[0],
      seatsBooked: 1,
      status: "Confirmed"
    });
    bookingCreated = true;
  }

  const rentAmount = deriveRentAmount(pg, tenant.room);
  const joinDateObj = new Date(effectiveJoiningDate);
  const currentMonthLabel = getMonthLabel(joinDateObj);
  const nextMonthDate = addMonths(joinDateObj, 1);
  const nextMonthLabel = getMonthLabel(nextMonthDate);

  const linkedTenantUser = tenant.email
    ? await User.findOne({ email: tenant.email, role: 'tenant' }).select('_id')
    : null;
  const paymentActorId = linkedTenantUser?._id || ownerId;

  let payment = null;
  let paymentCreated = false;
  let pendingCreated = false;
  let agreement = null;
  let agreementCreated = false;

  if (rentAmount > 0) {
    const existingPayment = await Payment.findOne({
      pgId: pg._id,
      tenantName: tenant.name,
      month: currentMonthLabel,
      paymentStatus: { $in: ['Success', 'PAID', 'Paid'] }
    });

    if (!existingPayment) {
      payment = await Payment.create({
        user: paymentActorId,
        pgId: pg._id,
        pgName: pg.pgName || "",
        tenantName: tenant.name,
        amountPaid: rentAmount,
        month: currentMonthLabel,
        paymentDate: new Date(),
        paymentMethod: "Cash",
        paymentStatus: "Success",
        transactionId: `AUTO-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
      });
      paymentCreated = true;
    } else {
      payment = existingPayment;
    }

    const existingPending = await PendingPayment.findOne({
      pg: pg._id,
      tenantName: tenant.name,
      month: nextMonthLabel,
      status: { $in: ['Pending', 'Overdue'] }
    });

    if (!existingPending) {
      await PendingPayment.create({
        tenant: paymentActorId,
        pg: pg._id,
        pgName: pg.pgName || "",
        tenantName: tenant.name,
        amount: rentAmount,
        dueDate: nextMonthDate,
        status: "Pending",
        month: nextMonthLabel
      });
      pendingCreated = true;
    }
  }

  const agreementResult = await ensureTenantAgreementRecord({
    ownerId,
    tenant,
    pg,
    rentAmount
  });
  agreement = agreementResult.agreement;
  agreementCreated = agreementResult.agreementCreated;

  return {
    booking,
    payment,
    agreement,
    bookingCreated,
    paymentCreated,
    pendingCreated,
    agreementCreated
  };
};

const getOwnerProfile = async (req, res) => {
  try {
    const owner = await User.findById(req.user._id).select('-password');

    res.status(200).json({
      success: true,
      data: {
        name: owner.fullName,
        email: owner.email,
        phone: owner.phone || "Not provided",
        address: owner.address || "Add your address",
        role: "Owner",
        profileImage: owner.profileImage || "/images/profileImages/profile1.jpg",
        memberId: owner._id.toString().slice(-6).toUpperCase(),
        socialLinks: {
          facebook: owner.facebook || "#",
          instagram: owner.instagram || "#",
          linkedin: owner.linkedin || "#",
          twitter: owner.twitter || "#",
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// update owner profile
const updateOwnerProfile = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { name, email, phone, address } = req.body;

    // Update the user document
    const updatedUser = await User.findByIdAndUpdate(
      ownerId,
      {
        $set: {
          fullName: name,
          email,
          phone,
          address
        }
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Returning the EXACT structure your ProfileCard.jsx uses
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: updatedUser.fullName,
        role: "Owner", // Static or from DB
        registrationDate: updatedUser.createdAt ? new Date(updatedUser.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        }) : "N/A",
        email: updatedUser.email,
        phone: updatedUser.phone || "Not provided",
        address: updatedUser.address || "Add your address",
        profileImage: updatedUser.profileImage || "/images/profileImages/profile1.jpg",
        memberId: updatedUser._id.toString().slice(-6).toUpperCase(),
        // Social links remain as they are or pulled from user model
        socialLinks: {
          facebook: updatedUser.facebook || "#",
          instagram: updatedUser.instagram || "#",
          linkedin: updatedUser.linkedin || "#",
          twitter: updatedUser.twitter || "#",
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getOwnerDashboardData = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const ownerPgs = await Pg.find({ ownerId }).select("totalRooms liveListings status createdAt").sort({ createdAt: -1 });

    const totalPgs = ownerPgs.length;
    const totalRooms = ownerPgs.reduce((sum, pg) => sum + (Number(pg.totalRooms) || 0), 0);
    const availablePgs = ownerPgs.reduce((sum, pg) => sum + (Number(pg.liveListings) || 0), 0);
    const recentStatus = ownerPgs[0]?.status
      ? ownerPgs[0].status.charAt(0).toUpperCase() + ownerPgs[0].status.slice(1)
      : "No Properties";

    res.status(200).json({
      success: true,
      data: {
        stats: [
          { label: "Total PGs", value: totalPgs },
          { label: "Total Rooms", value: totalRooms },
          { label: "Available PGs", value: availablePgs },
          { label: "Recent Status", value: recentStatus }
        ],
        recentActivity: [
          { 
            id: "1", 
            action: "Property Verified", 
            detail: "Your main property 'Girly Hostel' is now live.", 
            date: "2 hours ago" 
          },
          { 
            id: "2", 
            action: "New Booking", 
            detail: "Room 102 has been booked by a new tenant.", 
            date: "5 hours ago" 
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const createPg = async (req, res) => {
  try {
    console.log("Create PG Request Body:", req.body); // Debug log
    
    const { 
      name,        // Frontend field
      forWhom, 
      totalRooms, 
      description,
      city,        // Frontend field
      area,        // Frontend field
      address,     // Frontend field
      pincode,     // Frontend field
      facilities,  // Frontend sends as 'facilities'
      rules 
    } = req.body;
    
    const ownerId = req.user._id;

    // Validate required fields from frontend
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Property name is required" });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: "City is required" });
    }

    console.log("Creating PG with:", { 
      pgName: name, 
      location: city,
      ownerId 
    }); // Debug log

    // Map frontend fields to backend schema
    const newPg = await Pg.create({
      ownerId,
      pgName: name.trim(),  // Ensure trimmed string
      location: city.trim(),  // Ensure trimmed string
      city: city.trim(),
      area: area || "",
      address: address || "",
      pincode: pincode || "",
      price: 0,  // Will be set during room pricing
      totalRooms: parseInt(totalRooms) || 0,
      liveListings: 0,
      type: forWhom || "Any",  // Boys, Girls, Any
      amenities: facilities || [],  // Facilities like WiFi, Food, etc
      facilities: facilities || [],  // Both for compatibility
      description: description || "",
      rules: rules || {
        smoking: false,
        alcohol: false,
        visitors: true,
        pets: false,
        curfew: ""
      },
      // Keep newly-created properties visible in admin review queue.
      status: "pending"
    });

    console.log("PG Created Successfully:", newPg._id); // Debug log

    res.status(201).json({
      success: true,
      message: "Property added successfully",
      data: newPg
    });
  } catch (error) {
    console.error("Create PG Error:", error.message); // Debug log
    console.error("Full Error:", error); // Full error details
    res.status(400).json({ 
      success: false, 
      message: error.message || "Failed to create property"
    });
  }
};

const getMyPgs = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const pgs = await Pg.find({ ownerId });

    // Backward compatibility: earlier uploads could store pg image URL under /uploads/pgImages
    // while the file was actually written to /uploads/documents.
    for (const pg of pgs) {
      let mutated = false;

      if (pg.mainImage && pg.mainImage.startsWith('/uploads/pgImages/')) {
        const filename = path.basename(pg.mainImage);
        const pgImgPath = path.join(__dirname, '..', 'uploads', 'pgImages', filename);
        const docImgPath = path.join(__dirname, '..', 'uploads', 'documents', filename);

        if (!fs.existsSync(pgImgPath) && fs.existsSync(docImgPath)) {
          pg.mainImage = `/uploads/documents/${filename}`;
          mutated = true;
        }
      }

      if (Array.isArray(pg.images) && pg.images.length > 0) {
        const repaired = pg.images.map((img) => {
          if (!img || !img.startsWith('/uploads/pgImages/')) return img;
          const filename = path.basename(img);
          const pgImgPath = path.join(__dirname, '..', 'uploads', 'pgImages', filename);
          const docImgPath = path.join(__dirname, '..', 'uploads', 'documents', filename);
          if (!fs.existsSync(pgImgPath) && fs.existsSync(docImgPath)) {
            mutated = true;
            return `/uploads/documents/${filename}`;
          }
          return img;
        });
        pg.images = repaired;
      }

      if (mutated) {
        await pg.save();
      }
    }

    res.status(200).json({
      success: true,
      count: pgs.length,
      data: pgs 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePg = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    // Find and delete the PG
    const deletedPg = await Pg.findOneAndDelete({ _id: id, ownerId });

    if (!deletedPg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    res.status(200).json({
      success: true,
      message: "PG deleted successfully",
      data: deletedPg
    });
  } catch (error) {
    console.error("Delete PG Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPgById = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    const pg = await Pg.findOne({ _id: id, ownerId });

    if (!pg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    res.status(200).json({
      success: true,
      data: pg
    });
  } catch (error) {
    console.error("Get PG Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPDATE PG (For room management updates) ---
const updatePg = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;
    const { rooms, ...updateData } = req.body;

    let updatePayload = { ...updateData };

    // If rooms are being updated, handle them specially
    if (rooms) {
      updatePayload.rooms = rooms;
    }

    const updatedPg = await Pg.findOneAndUpdate(
      { _id: id, ownerId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updatedPg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: updatedPg
    });
  } catch (error) {
    console.error("Update PG Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- ADD ROOM DETAILS (Step 1 of your flow) ---
const addRoom = async (req, res) => {
  try {
    console.log("=== ADD ROOM API CALLED ===");
    console.log("Request body:", req.body);
    console.log("User ID:", req.user._id);
    
    const { roomType, totalRooms, bedsPerRoom, description, pgId } = req.body;
    const ownerId = req.user._id;

    const targetPg = pgId
      ? await Pg.findOne({ _id: pgId, ownerId })
      : await Pg.findOne({ ownerId }).sort({ createdAt: -1 });

    if (!targetPg) {
      console.log("PG not found for owner:", ownerId);
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    console.log("Found PG:", targetPg.pgName);

    // Initialize rooms array if it doesn't exist
    if (!targetPg.rooms) {
      targetPg.rooms = [];
    }

    targetPg.rooms.push({ roomType, totalRooms, bedsPerRoom, description });
    
    // CRITICAL: Update the main totalRooms count so the dashboard sees it
    targetPg.totalRooms += Number(totalRooms); 
    
    await targetPg.save();

    console.log("Room added successfully. Total rooms now:", targetPg.totalRooms);

    res.status(201).json({ success: true, message: "Room added", data: targetPg });
  } catch (error) {
    console.error("Add Room Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPLOAD PG IMAGES ---
const uploadPgImages = async (req, res) => {
  try {
    console.log("=== UPLOAD PG IMAGES API CALLED ===");
    console.log("Files:", req.files);
    console.log("Body:", req.body);
    console.log("Params:", req.params);
    
    // Get pgId from body first, then from params as fallback
    let pgId = req.body.pgId || req.params.pgId;
    const ownerId = req.user._id;

    if (!pgId) {
      return res.status(400).json({ success: false, message: "PG ID is required" });
    }

    // Find the PG
    const pg = await Pg.findOne({ _id: pgId, ownerId });

    if (!pg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    // Handle mainImage (single file) and gallery images - multer.fields returns an object
    // e.g. req.files = { mainImage: [File], images: [File, ...] }
    if (req.files) {
      // mainImage
      if (req.files.mainImage && req.files.mainImage.length > 0) {
        const mainFile = req.files.mainImage[0];
        const folder = path.basename(mainFile.destination || "pgImages");
        pg.mainImage = `/uploads/${folder}/${mainFile.filename}`;
      }

      // gallery images
      if (req.files.images && req.files.images.length > 0) {
        const imagePaths = req.files.images.map(file => {
          const folder = path.basename(file.destination || "pgImages");
          return `/uploads/${folder}/${file.filename}`;
        });
        if (!pg.images) pg.images = [];
        pg.images.push(...imagePaths);
      }
    }

    await pg.save();

    console.log("Images uploaded successfully.");
    console.log("MainImage:", pg.mainImage);
    console.log("Total images:", pg.images ? pg.images.length : 0);

    // Return the full updated PG document so frontend can refresh immediately
    const updatedPg = await Pg.findById(pg._id);

    res.status(200).json({ 
      success: true, 
      message: "Images uploaded successfully", 
      data: updatedPg
    });
  } catch (error) {
    console.error("Upload Images Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPDATE ROOM PRICES (Step 2 of your flow) ---
const updateRoomPrices = async (req, res) => {
  try {
    const { roomPrices, pgId } = req.body;
    const ownerId = req.user._id;

    const targetPg = pgId
      ? await Pg.findOne({ _id: pgId, ownerId })
      : await Pg.findOne({ ownerId }).sort({ createdAt: -1 });

    if (!targetPg) {
      return res.status(404).json({ 
        success: false, 
        message: "No property found to update prices for." 
      });
    }

    targetPg.roomPrices = roomPrices; 
    await targetPg.save();

    res.status(200).json({
      success: true,
      message: "Room prices updated successfully",
      data: targetPg
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addTenant = async (req, res) => {
  try {
    const { name, phone, email, pgId, room, joiningDate } = req.body;
    const ownerId = req.user._id;

    const pg = await Pg.findOne({ _id: pgId, ownerId }).select('pgName occupancy roomPrices price');
    if (!pg) {
      return res.status(404).json({ success: false, message: "Selected PG not found for this owner" });
    }

    const effectiveJoiningDate = joiningDate || new Date().toISOString().split('T')[0];

    const newTenant = await Tenant.create({
      ownerId,
      name,
      phone,
      email,
      pgId,
      pgName: pg.pgName || "",
      room,
      joiningDate: effectiveJoiningDate,
      status: 'Active'
    });

    const linked = await ensureTenantLinkedRecords({
      ownerId,
      tenant: { name, email, room, joiningDate: effectiveJoiningDate },
      pg
    });

    res.status(201).json({
      success: true,
      message: "Tenant added successfully",
      data: {
        tenant: newTenant,
        booking: linked.booking,
        payment: linked.payment,
        agreement: linked.agreement
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const syncTenantLinkedData = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const ownerPgs = await Pg.find({ ownerId }).select('_id pgName occupancy roomPrices price');
    const pgMap = new Map(ownerPgs.map((pg) => [String(pg._id), pg]));

    const tenants = await Tenant.find({ ownerId }).select('name email room joiningDate pgId');

    let syncedTenants = 0;
    let createdBookings = 0;
    let createdPayments = 0;
    let createdPending = 0;
    let createdAgreements = 0;

    for (const tenant of tenants) {
      const pg = pgMap.get(String(tenant.pgId));
      if (!pg) continue;

      const linked = await ensureTenantLinkedRecords({
        ownerId,
        tenant,
        pg
      });

      syncedTenants += 1;
      if (linked.bookingCreated) createdBookings += 1;
      if (linked.paymentCreated) createdPayments += 1;
      if (linked.pendingCreated) createdPending += 1;
      if (linked.agreementCreated) createdAgreements += 1;
    }

    return res.status(200).json({
      success: true,
      message: "Tenant linked data synchronized successfully",
      data: {
        syncedTenants,
        createdBookings,
        createdPayments,
        createdPending,
        createdAgreements
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({ ownerId: req.user._id })
      .populate('pgId', 'pgName location city')
      .sort({ createdAt: -1 });

    const normalized = tenants.map((t) => {
      const pgObj = t.pgId && typeof t.pgId === "object" ? t.pgId : null;
      return {
        _id: t._id,
        name: t.name,
        phone: t.phone,
        email: t.email,
        pgId: pgObj?._id || t.pgId,
        pgName: pgObj?.pgName || t.pgName || "Unknown PG",
        room: t.room,
        joiningDate: t.joiningDate,
        status: t.status,
      };
    });

    res.status(200).json({
      success: true,
      data: normalized 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const ownerPgs = await Pg.find({ ownerId }).select('_id pgName');
    const pgIds = ownerPgs.map((pg) => pg._id);
    const pgNames = ownerPgs.map((pg) => pg.pgName).filter(Boolean);

    const bookings = await Booking.find({
      $or: [
        { ownerId },
        { pgId: { $in: pgIds } },
        { pgName: { $in: pgNames } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addBooking = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { bookingId, pgId, pgName, roomType, tenantName, checkInDate, checkOutDate, seatsBooked, status } = req.body;

    let ownerPg = null;
    if (pgId && mongoose.Types.ObjectId.isValid(pgId)) {
      ownerPg = await Pg.findOne({ _id: pgId, ownerId }).select('_id pgName');
    } else if (pgName) {
      ownerPg = await Pg.findOne({ ownerId, pgName }).select('_id pgName');
    }

    if (!ownerPg) {
      return res.status(404).json({ success: false, message: "Selected PG not found for this owner" });
    }

    const generatedBookingId = bookingId || `BK-${Date.now()}`;
    const newBooking = await Booking.create({
      ownerId,
      pgId: ownerPg._id,
      bookingId: generatedBookingId,
      pgName: ownerPg.pgName,
      roomType,
      tenantName,
      checkInDate,
      checkOutDate,
      seatsBooked,
      status: status || "Pending"
    });
    res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 
    const ownerId = req.user._id;

    const ownerPgs = await Pg.find({ ownerId }).select('_id pgName');
    const pgIds = ownerPgs.map((pg) => String(pg._id));
    const pgNames = ownerPgs.map((pg) => pg.pgName).filter(Boolean);

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const belongsToOwner =
      String(booking.ownerId) === String(ownerId) ||
      (booking.pgId && pgIds.includes(String(booking.pgId))) ||
      pgNames.includes(booking.pgName);

    if (!belongsToOwner) {
      return res.status(403).json({ success: false, message: "You don't have permission to update this booking" });
    }

    booking.status = status;
    const updatedBooking = await booking.save();

    res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all agreements for the owner
const getMyAgreements = async (req, res) => {
  try {
    const ownerId = req.user._id;
    
    // Get all PGs owned by this owner
    const ownerPGs = await Pg.find({ ownerId });
    const pgIds = ownerPGs.map(pg => pg._id);
    const pgNames = ownerPGs.map(pg => pg.pgName).filter(Boolean);
    const pgById = new Map(ownerPGs.map((pg) => [String(pg._id), pg]));
    
    // Backfill missing agreements for current owner tenants.
    const ownerTenants = await Tenant.find({ ownerId, pgId: { $in: pgIds } })
      .select('name email phone room joiningDate pgId pgName')
      .sort({ createdAt: -1 });

    for (const tenant of ownerTenants) {
      const pg = pgById.get(String(tenant.pgId));
      if (!pg) continue;
      const rentAmount = deriveRentAmount(pg, tenant.room);
      await ensureTenantAgreementRecord({
        ownerId,
        tenant,
        pg,
        rentAmount
      });
    }

    const tenantUsers = await User.find({ assignedPg: { $in: pgIds } }).select('_id');
    const userIds = tenantUsers.map(user => user._id);
    const tenantDirectory = new Map();
    ownerTenants.forEach((t) => {
      const key = `${String(t.name || '').toLowerCase()}|${String(t.pgName || '').toLowerCase()}|${String(t.room || '').toLowerCase()}`;
      tenantDirectory.set(key, t);
    });
    
    // Get all agreements for these users and this owner's PG names
    const agreements = await Agreement.find({
      $or: [
        { userId: { $in: userIds } },
        { pgName: { $in: pgNames } }
      ]
    })
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 });
    
    // Format the data for the frontend
    const formattedAgreements = agreements.map((agreement) => {
      const tenant = agreement.userId || {};
      const dirKey = `${String(agreement.tenantName || '').toLowerCase()}|${String(agreement.pgName || '').toLowerCase()}|${String(agreement.roomNo || '').toLowerCase()}`;
      const tenantRecord = tenantDirectory.get(dirKey);
      return {
        id: agreement._id,
        agreementId: agreement.agreementId,
        tenant: agreement.tenantName || tenant.fullName || "Unknown Tenant",
        tenantEmail: tenantRecord?.email || tenant.email || "N/A",
        tenantPhone: tenantRecord?.phone || tenant.phone || "N/A",
        property: agreement.pgName || 'Unknown',
        room: agreement.roomNo || 'Unknown',
        startDate: agreement.startDate,
        endDate: agreement.endDate,
        rent: agreement.rentAmount,
        securityDeposit: agreement.securityDeposit,
        status: agreement.signed ? 'Active' : 'Pending Signature',
        signed: agreement.signed,
        createdAt: agreement.createdAt
      };
    });

    res.status(200).json({
      success: true,
      count: formattedAgreements.length,
      data: formattedAgreements
    });
  } catch (error) {
    console.error('Error fetching agreements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Support ticket management
const createSupportTicket = async (req, res) => {
  try {
    const { yourName, emailAddress, phone, message } = req.body;
    const ownerId = req.user._id;

    // Extract subject from message (format: "subject: description")
    const parts = message.split(':');
    const subject = parts[0] || 'Support Request';
    const description = parts.slice(1).join(':').trim() || message;

    // Generate unique ticket ID
    const ticketId = `TKT${Date.now()}`;

    const newTicket = await SupportTicket.create({
      ownerId,
      ticketId,
      subject,
      description,
      yourName,
      emailAddress,
      phone,
      date: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: newTicket
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all support tickets for the owner
const getMySupportTickets = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const tickets = await SupportTicket.find({ ownerId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update support ticket status
const updateSupportTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ownerId = req.user._id;

    const ticket = await SupportTicket.findOne({ _id: id, ownerId });
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found or you don't have permission to update this ticket" });
    }

    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: updatedTicket
    });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update tenant information
const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, room, status, pgId } = req.body;
    const ownerId = req.user._id;

    // Find the tenant and ensure it belongs to this owner
    const tenant = await Tenant.findOne({ _id: id, ownerId });
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found or you don't have permission to edit this tenant" });
    }

    // Update tenant information
    const payload = { name, phone, email, room, status };
    if (pgId) {
      const pg = await Pg.findOne({ _id: pgId, ownerId }).select('pgName');
      if (!pg) {
        return res.status(404).json({ success: false, message: "Selected PG not found for this owner" });
      }
      payload.pgId = pgId;
      payload.pgName = pg.pgName || "";
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      id,
      payload,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data: updatedTenant
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- SUBMIT PROPERTY FOR APPROVAL ---
const submitForApproval = async (req, res) => {
  try {
    const { pgId } = req.params;
    const ownerId = req.user._id;

    // Find the property
    const pg = await Pg.findOne({ _id: pgId, ownerId });
    
    if (!pg) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // If already pending, treat this as idempotent success for smoother UX.
    if (pg.status === "pending") {
      return res.status(200).json({
        success: true,
        message: "Property is already submitted for approval.",
        data: pg
      });
    }

    // Only draft properties can be newly submitted.
    if (pg.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: `Property is already ${pg.status}. Only draft properties can be submitted.`
      });
    }

    // Update status to pending
    pg.status = "pending";
    await pg.save();

    // Get owner details for email
    const owner = await User.findById(ownerId);

    // Send email to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    if (adminEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: adminEmail,
          subject: `New Property Approval Request - ${pg.pgName}`,
          html: `
            <h2>New Property Submitted for Approval</h2>
            <p><strong>Property Name:</strong> ${pg.pgName}</p>
            <p><strong>Location:</strong> ${pg.location}</p>
            <p><strong>Owner Name:</strong> ${owner.fullName}</p>
            <p><strong>Owner Email:</strong> ${owner.email}</p>
            <p><strong>Owner Phone:</strong> ${owner.phone || 'Not provided'}</p>
            <p><strong>Submitted Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p>Please login to the admin panel to review and approve this property.</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log("Approval request email sent to admin:", adminEmail);
      } catch (emailError) {
        console.error("Error sending email to admin:", emailError);
        // Continue even if email fails - the property status is already updated
      }
    } else {
      console.log("Email not configured. Skipping admin notification.");
    }

    res.status(200).json({
      success: true,
      message: "Property submitted for approval successfully! Admin will review it shortly.",
      data: pg
    });
  } catch (error) {
    console.error("Submit for approval error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOwnerEarnings = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const ownerPgs = await Pg.find({ ownerId }).select('_id pgName');
    const ownerPgIds = ownerPgs.map((pg) => pg._id);
    const ownerPgNames = ownerPgs.map((pg) => pg.pgName).filter(Boolean);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const payments = await Payment.find({
      paymentStatus: { $in: ['Success', 'PAID', 'Paid'] },
      $or: [
        { pgId: { $in: ownerPgIds } },
        { pgName: { $in: ownerPgNames } }
      ]
    }).sort({ paymentDate: -1 });

    const total = payments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    const monthly = payments
      .filter((p) => new Date(p.paymentDate) >= monthStart)
      .reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    const today = payments
      .filter((p) => new Date(p.paymentDate) >= dayStart)
      .reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);

    const monthlyMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString('en-US', { month: 'short' });
      monthlyMap.set(key, { label, amount: 0 });
    }
    payments.forEach((p) => {
      const d = new Date(p.paymentDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthlyMap.has(key)) {
        monthlyMap.get(key).amount += Number(p.amountPaid) || 0;
      }
    });

    const chartLabels = Array.from(monthlyMap.values()).map((v) => v.label);
    const chartValues = Array.from(monthlyMap.values()).map((v) => v.amount);

    const earningsHistory = payments.slice(0, 50).map((payment) => ({
      date: new Date(payment.paymentDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      source: payment.pgName || "Unknown PG",
      amount: Number(payment.amountPaid) || 0,
      status: "Paid"
    }));

    const pendingPaymentsRaw = await PendingPayment.find({
      status: { $in: ['Pending', 'Overdue'] },
      $or: [
        { pg: { $in: ownerPgIds } },
        { pgName: { $in: ownerPgNames } }
      ]
    }).sort({ dueDate: 1 });

    const pendingPayments = pendingPaymentsRaw.map((payment) => ({
      tenant: payment.tenantName || 'Unknown Tenant',
      pg: payment.pgName || 'Unknown PG',
      amount: Number(payment.amount) || 0,
      due: new Date(payment.dueDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: { total, monthly, today },
        chartData: {
          labels: chartLabels,
          datasets: [
            {
              label: "Earnings",
              data: chartValues,
              borderColor: "#f97316",
              backgroundColor: "rgba(249,115,22,0.15)",
              tension: 0.35,
            }
          ]
        },
        earningsHistory,
        pendingPayments
      }
    });
  } catch (error) {
    console.error('Owner earnings fetch error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch earnings data" });
  }
};

const sendPaymentLink = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    const ownerPgs = await Pg.find({ ownerId }).select('_id pgName');
    const pgIds = ownerPgs.map((pg) => String(pg._id));
    const pgNames = ownerPgs.map((pg) => pg.pgName).filter(Boolean);

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const belongsToOwner =
      String(booking.ownerId) === String(ownerId) ||
      (booking.pgId && pgIds.includes(String(booking.pgId))) ||
      pgNames.includes(booking.pgName);

    if (!belongsToOwner) {
      return res.status(403).json({ success: false, message: "You don't have permission to send payment link for this booking" });
    }

    const tenantQuery = {
      ownerId,
      name: booking.tenantName,
      $or: [
        booking.pgId ? { pgId: booking.pgId } : null,
        booking.pgName ? { pgName: booking.pgName } : null
      ].filter(Boolean)
    };

    const tenantRecord = await Tenant.findOne(tenantQuery).sort({ createdAt: -1 });
    const recipientEmail = tenantRecord?.email;

    if (!recipientEmail) {
      return res.status(404).json({
        success: false,
        message: "Tenant email not found. Add tenant email in tenant records first."
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email service not configured on server"
      });
    }

    const frontendUrl = normalizeBaseUrl(process.env.FRONTEND_URL || req.headers.origin || "http://localhost:3000");
    const paymentLink = `${frontendUrl}/user/dashboard/payments?bookingId=${booking._id}`;
    const loginLink = `${frontendUrl}/loginPage`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const subject = `Payment Link - ${booking.pgName}`;
    const html = `
      <h2>Rent Payment Reminder</h2>
      <p>Dear ${booking.tenantName},</p>
      <p>Your booking <strong>${booking.bookingId}</strong> for <strong>${booking.pgName}</strong> is confirmed.</p>
      <p>Please complete your rent payment using the link below:</p>
      <p><a href="${paymentLink}" target="_blank" rel="noopener noreferrer">Pay Now</a></p>
      <p>If not logged in, login first here:</p>
      <p><a href="${loginLink}" target="_blank" rel="noopener noreferrer">Login</a></p>
      <p>If the button does not work, copy this URL:</p>
      <p>${paymentLink}</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject,
      html
    });

    return res.status(200).json({
      success: true,
      message: "Payment link sent successfully",
      data: {
        bookingId: booking._id,
        email: recipientEmail
      }
    });
  } catch (error) {
    console.error("Send payment link error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const downloadOwnerEarningsPDF = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const ownerPgs = await Pg.find({ ownerId }).select('_id pgName');
    const ownerPgIds = ownerPgs.map((pg) => pg._id);
    const ownerPgNames = ownerPgs.map((pg) => pg.pgName).filter(Boolean);

    const payments = await Payment.find({
      paymentStatus: { $in: ['Success', 'PAID', 'Paid'] },
      $or: [
        { pgId: { $in: ownerPgIds } },
        { pgName: { $in: ownerPgNames } }
      ]
    }).sort({ paymentDate: -1 });

    const pendingPaymentsRaw = await PendingPayment.find({
      status: { $in: ['Pending', 'Overdue'] },
      $or: [
        { pg: { $in: ownerPgIds } },
        { pgName: { $in: ownerPgNames } }
      ]
    }).sort({ dueDate: 1 });

    const total = payments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthly = payments
      .filter((p) => new Date(p.paymentDate) >= monthStart)
      .reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    const today = payments
      .filter((p) => new Date(p.paymentDate) >= dayStart)
      .reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("EasyPG Manager - Owner Earnings Report", 14, 15);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 25);

    autoTable(doc, {
      startY: 32,
      head: [["Metric", "Amount"]],
      body: [
        ["Total Earnings", `Rs. ${total.toLocaleString()}`],
        ["This Month", `Rs. ${monthly.toLocaleString()}`],
        ["Today", `Rs. ${today.toLocaleString()}`],
      ],
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Date", "PG", "Amount", "Status"]],
      body: payments.slice(0, 50).map((p) => [
        new Date(p.paymentDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        p.pgName || 'Unknown PG',
        `Rs. ${(Number(p.amountPaid) || 0).toLocaleString()}`,
        'Paid'
      ]),
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Tenant", "PG", "Amount", "Due Date"]],
      body: pendingPaymentsRaw.map((p) => [
        p.tenantName || 'Unknown Tenant',
        p.pgName || 'Unknown PG',
        `Rs. ${(Number(p.amount) || 0).toLocaleString()}`,
        new Date(p.dueDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      ]),
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Owner_Earnings_Report.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Owner earnings PDF error:', error);
    res.status(500).json({ success: false, message: "Failed to generate PDF" });
  }
};

// --- UPLOAD PROPERTY DOCUMENTS ---
const uploadPropertyDocuments = async (req, res) => {
  try {
    const { pgId } = req.params;
    const ownerId = req.user._id;

    if (!pgId) {
      return res.status(400).json({ success: false, message: "PG ID is required" });
    }

    const pg = await Pg.findOne({ _id: pgId, ownerId });
    if (!pg) {
      return res.status(404).json({ success: false, message: "PG not found" });
    }

    if (!pg.proofDocuments) {
      pg.proofDocuments = {};
    }

    const filePath = (file) => (file ? `/uploads/documents/${file.filename}` : undefined);

    if (req.files?.aadhaar?.[0]) {
      pg.proofDocuments.aadhaar = filePath(req.files.aadhaar[0]);
    }
    if (req.files?.electricityBill?.[0]) {
      pg.proofDocuments.electricityBill = filePath(req.files.electricityBill[0]);
    }
    if (req.files?.propertyTax?.[0]) {
      pg.proofDocuments.propertyTax = filePath(req.files.propertyTax[0]);
    }

    await pg.save();

    return res.status(200).json({
      success: true,
      message: "Property documents uploaded successfully",
      data: pg,
    });
  } catch (error) {
    console.error("Upload property documents error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getOwnerProfile, 
  getOwnerDashboardData, 
  createPg, 
  getMyPgs, 
  deletePg,
  getPgById,
  updatePg,
  addRoom,
  uploadPgImages,
  updateRoomPrices, 
  addTenant, 
  getMyTenants, 
  getMyBookings, 
  addBooking, 
  updateBookingStatus,
  sendPaymentLink,
  updateOwnerProfile,
  getMyAgreements,
  updateTenant,
  syncTenantLinkedData,
  createSupportTicket,
  getMySupportTickets,
  updateSupportTicketStatus,
  submitForApproval,
  uploadPropertyDocuments,
  getOwnerEarnings,
  downloadOwnerEarningsPDF
};
