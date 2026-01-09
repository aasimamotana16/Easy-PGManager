const express = require('express');
const router = express.Router();

// 1. Double-check that these names MATCH the bottom of ownerController.js exactly
const { 
  getOwnerDashboardData, 
  createPg, 
  getMyPgs, 
  addTenant, 
  getMyTenants, 
  getMyBookings, 
  addBooking, 
  updateBookingStatus, 
  updateRoomPrices,
  updateOwnerProfile,
  getOwnerProfile,
  addRoom 
} = require('../controllers/ownerController');

const { protect, isOwner } = require('../middleware/authMiddleware');

// --- DASHBOARD ---
router.get('/dashboard-summary', protect, isOwner, getOwnerDashboardData);

// --- PG MANAGEMENT ---
router.post('/add-pg', protect, isOwner, createPg);
router.get('/my-pgs', protect, isOwner, getMyPgs);

// --- ROOM FLOW ---
router.post('/add-room', protect, isOwner, addRoom);
router.post('/update-room-prices', protect, isOwner, updateRoomPrices);

// --- TENANT MANAGEMENT ---
router.post('/add-tenant', protect, isOwner, addTenant);
router.get('/my-tenants', protect, isOwner, getMyTenants);

// --- BOOKING MANAGEMENT ---
router.get('/my-bookings', protect, isOwner, getMyBookings);
router.post('/add-booking', protect, isOwner, addBooking);
router.put('/update-booking/:id', protect, isOwner, updateBookingStatus);


// Route for Save Profile button
router.get('/profile', protect, isOwner, getOwnerProfile);
router.put('/update-profile', protect, isOwner, updateOwnerProfile);

module.exports = router;