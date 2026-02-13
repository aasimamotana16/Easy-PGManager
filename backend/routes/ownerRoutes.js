const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

// 1. Double-check that these names MATCH the bottom of ownerController.js exactly
const { 
  getOwnerDashboardData, 
  createPg, 
  getMyPgs, 
  deletePg,
  getPgById,
  updatePg,
  addTenant, 
  getMyTenants, 
  getMyBookings, 
  addBooking, 
  updateBookingStatus, 
  updateRoomPrices,
  updateOwnerProfile,
  getOwnerProfile,
  addRoom,
  uploadPgImages,
  getMyAgreements,
  updateTenant,
  createSupportTicket,
  getMySupportTickets,
  updateSupportTicketStatus,
  submitForApproval
} = require('../controllers/ownerController');

const { protect, isOwner } = require('../middleware/authMiddleware');

// --- DASHBOARD ---
router.get('/dashboard-summary', protect, isOwner, getOwnerDashboardData);

// --- PG MANAGEMENT ---
router.post('/add-pg', protect, isOwner, createPg);
router.get('/my-pgs', protect, isOwner, getMyPgs);
router.delete('/pg/:id', protect, isOwner, deletePg);
router.get('/pg/:id', protect, isOwner, getPgById);
router.put('/pg/:id', protect, isOwner, updatePg);
router.post('/submit-for-approval/:pgId', protect, isOwner, submitForApproval);

// --- ROOM FLOW ---
router.post('/add-room', protect, isOwner, addRoom);
router.post('/upload-images/:pgId', protect, isOwner, upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'images', maxCount: 10 }]), uploadPgImages);
router.post('/update-room-prices', protect, isOwner, updateRoomPrices);

// --- TENANT MANAGEMENT ---
router.post('/add-tenant', protect, isOwner, addTenant);
router.get('/my-tenants', protect, isOwner, getMyTenants);
router.put('/update-tenant/:id', protect, isOwner, updateTenant);

// --- BOOKING MANAGEMENT ---
router.get('/my-bookings', protect, isOwner, getMyBookings);
router.post('/add-booking', protect, isOwner, addBooking);
router.put('/update-booking/:id', protect, isOwner, updateBookingStatus);

// --- AGREEMENT MANAGEMENT ---
router.get('/my-agreements', protect, isOwner, getMyAgreements);

// --- SUPPORT TICKET MANAGEMENT ---
router.post('/create-support-ticket', protect, isOwner, createSupportTicket);
router.get('/my-support-tickets', protect, isOwner, getMySupportTickets);
router.put('/update-support-ticket/:id', protect, isOwner, updateSupportTicketStatus);

// Route for Save Profile button
router.get('/profile', protect, isOwner, getOwnerProfile);
router.put('/update-profile', protect, isOwner, updateOwnerProfile);

module.exports = router;
