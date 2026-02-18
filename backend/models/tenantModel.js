const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Matching your frontend object keys exactly
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  pgName: { type: String, default: "" },
  room: { type: String, required: true }, // frontend uses 'room' not 'roomNumber'
  joiningDate: { type: String, required: true }, 
  status: { type: String, default: 'Active' },

  // Move-out inspection flow
  securityDeposit: { type: Number, default: 0 },
  hasMoveOutNotice: { type: Boolean, default: false },
  moveOutRequested: { type: Boolean, default: false },
  moveOutRequestedAt: { type: Date, default: null },
  moveOutCompletedAt: { type: Date, default: null },
  damageCharges: { type: Number, default: 0 },
  pendingFine: { type: Number, default: 0 },
  finalRefund: { type: Number, default: 0 },
  deductionReason: { type: String, default: "" },

  // Extension and late-fine handling
  hasDeferralRequest: { type: Boolean, default: false },
  extensionRequested: { type: Boolean, default: false },
  extensionRequestedAt: { type: Date, default: null },
  extensionUntil: { type: Date, default: null },
  extensionReason: { type: String, default: "" },
  deferredDays: { type: Number, default: 0 },
  deferredReason: { type: String, default: "" },
  lastDeferredDate: { type: String, default: "" },
  rentDeferred: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);
