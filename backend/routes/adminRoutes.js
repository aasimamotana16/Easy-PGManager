const express = require('express');
const router = express.Router();
const { 
  adminLogin, 
  getAdminDashboardStats, 
  addUser, 
  updateUser, 
  deleteUser,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getPendingDocuments,
  reviewUserDocument,
  getSupportTickets,
  updateSupportTicketByAdmin,
  getBookingPaymentOverview,
  getAgreementSettings,
  updateAgreementSettings,
  getPricingRules,
  updatePricingRules
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', adminLogin);
router.get('/dashboard-stats', protect, getAdminDashboardStats);
router.post('/add-user', protect, addUser); // Add Button [cite: 2026-01-06]
router.put('/update-user/:id', protect, updateUser); // Edit Button [cite: 2026-01-07]
router.delete('/delete-user/:id', protect, deleteUser); // Delete Button

// Property Approval Routes
router.get('/pending-properties', protect, getPendingProperties);
router.post('/approve-property/:id', protect, approveProperty);
router.post('/reject-property/:id', protect, rejectProperty);
router.get('/pending-documents', protect, getPendingDocuments);
router.post('/review-document', protect, reviewUserDocument);
router.get('/support-tickets', protect, getSupportTickets);
router.put('/support-ticket/:id', protect, updateSupportTicketByAdmin);
router.get('/booking-payment-overview', protect, getBookingPaymentOverview);
router.get('/agreement-settings', protect, getAgreementSettings);
router.put('/agreement-settings', protect, updateAgreementSettings);
router.get('/pricing-rules', protect, getPricingRules);
router.put('/pricing-rules', protect, updatePricingRules);

module.exports = router;
