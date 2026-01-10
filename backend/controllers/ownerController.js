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
    
    // TEMPORARY: Hardcoded numbers for your guide's presentation
    const mockTotalPgs = 5;
    const mockTotalRooms = 30;
    const mockLiveListings = 18;

    res.status(200).json({
      success: true,
      data: {
        stats: [
          { label: "Total PGs", value: mockTotalPgs },
          { label: "Total Rooms", value: mockTotalRooms },
          { label: "Live Listings", value: mockLiveListings },
          { label: "Recent Status", value: "Active" }
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
    const { pgName, location, totalRooms, liveListings } = req.body;
    const ownerId = req.user._id; 

    const newPg = await Pg.create({
      ownerId,
      pgName,
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

// --- ADD ROOM DETAILS (Step 1 of your flow) ---
const addRoom = async (req, res) => {
  try {
    const { roomType, totalRooms, bedsPerRoom, description } = req.body;
    const ownerId = req.user._id;

    const latestPg = await Pg.findOne({ ownerId }).sort({ createdAt: -1 });

    if (!latestPg) return res.status(404).json({ success: false, message: "PG not found" });

    latestPg.rooms.push({ roomType, totalRooms, bedsPerRoom, description });
    
    // CRITICAL: Update the main totalRooms count so the dashboard sees it
    latestPg.totalRooms += Number(totalRooms); 
    
    await latestPg.save();

    res.status(201).json({ success: true, message: "Room added", data: latestPg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPDATE ROOM PRICES (Step 2 of your flow) ---
const updateRoomPrices = async (req, res) => {
  try {
    const { roomPrices } = req.body;
    const ownerId = req.user._id;

    const latestPg = await Pg.findOne({ ownerId }).sort({ createdAt: -1 });

    if (!latestPg) {
      return res.status(404).json({ 
        success: false, 
        message: "No property found to update prices for." 
      });
    }

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
      data: tenants 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
    const { status } = req.body; 

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

module.exports = { 
  getOwnerProfile, 
  getOwnerDashboardData, 
  createPg, 
  getMyPgs, 
  addRoom,
  updateRoomPrices, 
  addTenant, 
  getMyTenants, 
  getMyBookings, 
  addBooking, 
  updateBookingStatus,
  updateOwnerProfile 
};