const mongoose = require('mongoose');

// Match your EasyPG Manager Booking model exactly
const bookingSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'EasyPGUser', required: true },
  tenantUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'EasyPGUser', default: null },
  pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'EasyPGPG', default: null },
  bookingId: { type: String, required: true },
  pgName: { type: String, required: true },
  roomType: { type: String, required: true },
  tenantName: { type: String, required: true },
  tenantEmail: { type: String, default: null },
  tenantPhone: { type: String, default: null },
  checkInDate: { type: String, required: true },
  checkOutDate: { type: String, required: true },
  seatsBooked: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
  ownerApprovalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  ownerApprovalNotes: { type: String, default: '' },
  ownerApprovedAt: { type: Date, default: null },
  ownerRejectedAt: { type: Date, default: null },
  ownerNotifiedAt: { type: Date, default: null },
  paymentStatus: { type: String, enum: ['NotInitiated', 'Pending', 'Success', 'Failed'], default: 'NotInitiated' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'EasyPGPayment', default: null },
  nextPaymentDate: { type: Date, default: null },
  bookingCompletedAt: { type: Date, default: null }
}, {
  timestamps: true,
  collection: 'bookings'
});

// Indexes for better performance
bookingSchema.index({ ownerId: 1 });
bookingSchema.index({ tenantUserId: 1 });
bookingSchema.index({ pgId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ ownerApprovalStatus: 1 });
bookingSchema.index({ bookingId: 1 });

module.exports = mongoose.models.EasyPGBooking || mongoose.model('EasyPGBooking', bookingSchema);
