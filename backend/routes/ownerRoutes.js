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
  generateBookingAgreementPdf,
  sendPaymentLink,
  updateRoomPrices,
  updateOwnerProfile,
  getOwnerProfile,
  addRoom,
  uploadPgImages,
  confirmArrival,
  getMyAgreements,
  updateTenant,
  deleteTenant,
  approveExtensionRequest,
  rejectExtensionRequest,
  completeTenantMoveOut,
  submitDamageReport,
  processRefund,
  syncTenantLinkedData,
  createSupportTicket,
  getMySupportTickets,
  updateSupportTicketStatus,
  submitForApproval,
  uploadPropertyDocuments,
  uploadAgreementTemplate,
  deleteOwnerAccount,
  getOwnerEarnings,
  downloadOwnerEarningsPDF
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
router.post('/upload-property-docs/:pgId', protect, isOwner, upload.fields([{ name: 'aadhaar', maxCount: 1 }, { name: 'electricityBill', maxCount: 1 }, { name: 'propertyTax', maxCount: 1 }]), uploadPropertyDocuments);
router.post('/upload-agreement-template/:pgId', protect, isOwner, upload.fields([{ name: 'agreementPdf', maxCount: 1 }, { name: 'ownerSignature', maxCount: 1 }]), uploadAgreementTemplate);
router.post('/update-room-prices', protect, isOwner, updateRoomPrices);

// --- TENANT MANAGEMENT ---
router.post('/add-tenant', protect, isOwner, addTenant);
router.get('/my-tenants', protect, isOwner, getMyTenants);
router.delete('/tenant/:id', protect, isOwner, deleteTenant);
router.put('/confirm-arrival/:id', protect, isOwner, confirmArrival);
router.put('/update-tenant/:id', protect, isOwner, updateTenant);
router.put('/approve-extension/:id', protect, isOwner, approveExtensionRequest);
router.put('/reject-extension/:id', protect, isOwner, rejectExtensionRequest);
router.put('/complete-move-out/:id', protect, isOwner, completeTenantMoveOut);
router.post('/submit-damage-report/:id', protect, isOwner, submitDamageReport);
router.post('/process-refund/:id', protect, isOwner, processRefund);
router.post('/sync-tenant-linked-data', protect, isOwner, syncTenantLinkedData);

// --- BOOKING MANAGEMENT ---
router.get('/my-bookings', protect, isOwner, getMyBookings);
router.post('/add-booking', protect, isOwner, addBooking);
router.put('/update-booking/:id', protect, isOwner, updateBookingStatus);
router.post('/booking/:id/generate-agreement-pdf', protect, isOwner, generateBookingAgreementPdf);
router.post('/send-payment-link/:id', protect, isOwner, sendPaymentLink);

// --- AGREEMENT MANAGEMENT ---
router.get('/my-agreements', protect, isOwner, getMyAgreements);
router.get('/earnings', protect, isOwner, getOwnerEarnings);
router.get('/earnings/pdf', protect, isOwner, downloadOwnerEarningsPDF);

// --- SUPPORT TICKET MANAGEMENT ---
router.post('/create-support-ticket', protect, isOwner, createSupportTicket);
router.get('/my-support-tickets', protect, isOwner, getMySupportTickets);
router.put('/update-support-ticket/:id', protect, isOwner, updateSupportTicketStatus);

// Route for Save Profile button
router.get('/profile', protect, isOwner, getOwnerProfile);
router.put('/update-profile', protect, isOwner, upload.single('image'), updateOwnerProfile);
router.delete('/delete-account', protect, isOwner, deleteOwnerAccount);

module.exports = router;
