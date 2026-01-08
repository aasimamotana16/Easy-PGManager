const express = require('express');
const router = express.Router();

const { getOwnerDashboardData, createPg, getMyPgs, addTenant, getMyTenants, getMyBookings, addBooking, updateBookingStatus, updateRoomPrices} = require('../controllers/ownerController');
const { protect, isOwner } = require('../middleware/authMiddleware');

// Dashboard summary - Added protect and isOwner to ensure req.user exists
router.get('/dashboard-summary', protect, isOwner, getOwnerDashboardData);

// Add new PG - Added protect and isOwner so the PG is linked to the logged-in owner
router.post('/add-pg', protect, isOwner, createPg);

// List all PGs - This is the missing piece for your "My PGs" table
router.get('/my-pgs', protect, isOwner, getMyPgs);

router.post('/add-tenant', protect, isOwner, addTenant); // For the Save button
router.get('/my-tenants', protect, isOwner, getMyTenants);

router.get('/my-bookings', protect, isOwner, getMyBookings);
router.post('/add-booking', protect, isOwner, addBooking);

router.post('/update-room-prices', protect, isOwner, updateRoomPrices);

router.put('/update-booking/:id', protect, isOwner, updateBookingStatus);
module.exports = router;