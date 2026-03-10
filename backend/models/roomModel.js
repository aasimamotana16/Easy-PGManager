const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  roomNumber: { type: String },
  roomType: { type: String },
  totalRooms: { type: Number, default: 0 },
  bedsPerRoom: { type: Number, default: 1 },
  description: { type: String },
  mainImage: { type: String },
  images: [{ type: String }],
  // Pricing/variant fields
  variantLabel: { type: String },
  rent: { type: Number, default: 0 },
  billingCycle: { type: String, default: 'Monthly' },
  securityDeposit: { type: Number, default: 0 },
  acType: { type: String, enum: ['AC', 'Non-AC'], default: 'Non-AC' },
  features: {
    balcony: { type: Boolean, default: false },
    attachedWashroom: { type: Boolean, default: false },
    privateBalcony: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema);