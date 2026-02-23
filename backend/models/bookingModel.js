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
  isPaid: { type: Boolean, default: false },
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
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
