const mongoose = require('mongoose');
const Pg = require('../models/pgModel');
const User = require('../models/userModel');
const Tenant = require('../models/tenantModel');
const Booking = require('../models/bookingModel');

const getOwnerProfile = async (req, res) => {
  try {
    const owner = await User.findById(req.user._id).select('-password');

    res.status(200).json({
      success: true,
      data: {
        name: owner.name,
        email: owner.email,
        phone: owner.phone || "Not provided",
        address: owner.address || "Add your address",
        role: "Owner",
        profileImage: owner.profileImage || "/images/profileImages/profile1.jpg",
        memberId: owner._id.toString().slice(-6).toUpperCase(),
        // Add this to fix the 'facebook' undefined error
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
// GET Dashboard Data
// Restructured to connect perfectly with your frontend state
const getOwnerDashboardData = async (req, res) => {
  try {
    // Use the ID from your 'protect' middleware
    const ownerId = req.user._id; 

    const query = { ownerId: new mongoose.Types.ObjectId(ownerId) };

    const totalPgs = await Pg.countDocuments(query);
    
    const roomStats = await Pg.aggregate([
      { $match: query },
      { $group: { 
          _id: null, 
          totalRooms: { $sum: "$totalRooms" }, 
          liveListings: { $sum: "$liveListings" } 
        } 
      }
    ]);

    // This structure ensures no changes are needed in your React code
    res.status(200).json({
      success: true,
      data: {
        // Formatted as an array so stats?.map() works
        stats: [
          { label: "Total PGs", value: totalPgs },
          { label: "Total Rooms", value: roomStats[0]?.totalRooms || 0 },
          { label: "Live Listings", value: roomStats[0]?.liveListings || 0 },
          { label: "Recent Status", value: "Live" }
        ],
        recentActivity: [
          { 
            id: "1", 
            action: "Database Connected", 
            detail: `You have ${totalPgs} active properties`, 
            date: "Just Now" 
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST Create New PG
const createPg = async (req, res) => {
  try {
    const { pgName, location, totalRooms, liveListings } = req.body;
    const ownerId = req.user._id; 

    const newPg = await Pg.create({
      ownerId,
      pgName, // Using camelCase as requested
      location,
      totalRooms: totalRooms || 0,
      liveListings: liveListings || 0,
      status: "live"
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

// GET All PGs for the logged-in owner
const getMyPgs = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const pgs = await Pg.find({ ownerId });

    res.status(200).json({
      success: true,
      count: pgs.length,
      data: pgs 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// POST Update Room Prices for a PG
const updateRoomPrices = async (req, res) => {
  try {
    const { roomPrices } = req.body;
    const ownerId = req.user._id;

    // Find the latest PG created by this owner to attach prices to
    const latestPg = await Pg.findOne({ ownerId }).sort({ createdAt: -1 });

    if (!latestPg) {
      return res.status(404).json({ 
        success: false, 
        message: "No property found to update prices for." 
      });
    }

    // Update the roomPrices field (Ensure your Schema has this field as an Array)
    latestPg.roomPrices = roomPrices; 
    await latestPg.save();

    res.status(200).json({
      success: true,
      message: "Room prices updated successfully",
      data: latestPg
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addTenant = async (req, res) => {
  try {
    const { name, phone, email, pgId, room, joiningDate } = req.body;
    const ownerId = req.user._id;

    const newTenant = await Tenant.create({
      ownerId,
      name,
      phone,
      email,
      pgId,
      room,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: "Tenant added successfully",
      data: newTenant
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMyTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({ ownerId: req.user._id });
    res.status(200).json({
      success: true,
      data: tenants // This will now replace your hardcoded 'tenants' array
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET: Get all bookings for the owner
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST: Add a new booking (for later use)
const addBooking = async (req, res) => {
  try {
    const { bookingId, pgName, roomType, tenantName, checkInDate, checkOutDate, seatsBooked, status } = req.body;
    const newBooking = await Booking.create({
      ownerId: req.user._id,
      bookingId,
      pgName,
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
    const { status } = req.body; // 'Confirmed' or 'Cancelled'

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = { getOwnerProfile, getOwnerDashboardData, createPg, getMyPgs, updateRoomPrices, addTenant, getMyTenants, getMyBookings, addBooking, updateBookingStatus };