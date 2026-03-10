const mongoose = require('mongoose');

// Match your EasyPG Manager Agreement model exactly
const agreementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'EasyPGUser', required: true },
  agreementId: { type: String, required: true },
  pgName: { type: String, required: true },
  roomNo: { type: String, required: true },
  tenantName: { type: String, required: true },
  rentAmount: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  signed: { type: Boolean, default: false }
}, {
  timestamps: true,
  collection: 'agreements'
});

// Indexes for better performance
agreementSchema.index({ userId: 1 });
agreementSchema.index({ agreementId: 1 });

module.exports = mongoose.models.EasyPGAgreement || mongoose.model('EasyPGAgreement', agreementSchema);
