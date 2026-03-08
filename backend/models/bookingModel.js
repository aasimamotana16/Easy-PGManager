const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'PG' },
  tenantUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tenantEmail: { type: String, default: "" },
  bookingId: { type: String, required: true }, // e.g., "101"
  pgName: { type: String, required: true },
  roomType: { type: String, required: true }, // e.g., "Single" or "Double"
  tenantName: { type: String, required: true },
  checkInDate: { type: String, required: true },
  checkOutDate: { type: String, required: true },
  seatsBooked: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
  ownerApproved: { type: Boolean, default: false },
  ownerApprovalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isPaid: { type: Boolean, default: false },
  initialRentPaid: { type: Boolean, default: false },
  securityDepositPaid: { type: Boolean, default: false },
  paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  bookingAmount: { type: Number, default: 0 },
  rentAmount: { type: Number, default: 0 },
  securityDeposit: { type: Number, default: 0 },
  variantLabel: { type: String, default: "" },
  agreementPdfUrl: { type: String, default: "" },
  pricingSnapshot: {
    billingCycle: { type: String, default: "Monthly" },
    acType: { type: String, default: "Non-AC" },
    features: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  bookingSource: {
    type: String,
    enum: ['tenant_request', 'owner_manual', 'tenant_sync'],
    default: 'tenant_request'
  },
  cancelRequest: {
    requested: { type: Boolean, default: false },
    requestedAt: { type: Date, default: null },
    requestedBy: { type: String, enum: ['tenant', 'owner', 'system', ''], default: '' },
    reason: { type: String, default: '' },
    otherReason: { type: String, default: '' },
    status: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' },
    reviewedAt: { type: Date, default: null }
  },
  cancellationRefund: {
    cancelledBy: { type: String, enum: ['tenant', 'owner'], default: 'tenant' },
    hasMovedIn: { type: Boolean, default: false },
    grossPaidAmount: { type: Number, default: 0 },
    nonRefundableCommissionAmount: { type: Number, default: 0 },
    noShowDeductionAmount: { type: Number, default: 0 },
    refundableAmount: { type: Number, default: 0 },
    refundRule: { type: String, default: '' },
    note: { type: String, default: '' },
    refundStatus: { type: String, enum: ['None', 'Pending', 'Processed', 'Rejected'], default: 'None' },
    calculatedAt: { type: Date, default: null }
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
