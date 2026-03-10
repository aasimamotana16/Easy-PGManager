const mongoose = require('mongoose');

// Match your EasyPG Manager Tenant model exactly
const tenantSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'EasyPGUser', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'EasyPGUser', default: null },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'EasyPGBooking', default: null },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  pgId: { type: Number, default: 0 },
  pgRefId: { type: mongoose.Schema.Types.ObjectId, ref: 'EasyPGPG', default: null },
  pgName: { type: String, default: null },
  room: { type: String, required: true },
  joiningDate: { type: String, required: true },
  status: { type: String, default: 'Active' },
  lastPaymentDate: { type: Date, default: null },
  nextPaymentDate: { type: Date, default: null },
  paymentStatus: { type: String, enum: ['NotInitiated', 'Pending', 'Success', 'Failed'], default: 'NotInitiated' }
}, {
  timestamps: true,
  collection: 'tenants'
});

// Indexes for better performance
tenantSchema.index({ ownerId: 1 });
tenantSchema.index({ userId: 1 });
tenantSchema.index({ bookingId: 1 });
tenantSchema.index({ status: 1 });
tenantSchema.index({ pgId: 1 });
tenantSchema.index({ pgRefId: 1 });
tenantSchema.index({ nextPaymentDate: 1 });

module.exports = mongoose.models.EasyPGTenant || mongoose.model('EasyPGTenant', tenantSchema);
