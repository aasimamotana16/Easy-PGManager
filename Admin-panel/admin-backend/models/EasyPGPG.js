const mongoose = require('mongoose');

// Match your EasyPG Manager PG model exactly
const pgSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EasyPGUser',
    required: true
  },
  pgName: { 
    type: String, 
    required: [true, "Please add a PG name"] 
  },
  location: { 
    type: String, 
    required: [true, "Please add a location"] 
  },
  area: { type: String },
  address: { type: String },
  pincode: { type: String },
  city: { type: String },
  price: { 
    type: Number, 
    required: false 
  },
  deposit: {
    type: Number,
    default: 0
  },
  type: { 
    type: String, 
    enum: ["Boys", "Girls", "Any"], 
    default: "Any" 
  },
  occupancy: { 
    type: String, 
    enum: ["Single", "Double", "Triple", "Any"], 
    default: "Any" 
  },
  rentCycle: { 
    type: String, 
    default: "Monthly" 
  },
  mainImage: { 
    type: String, 
    default: "https://via.placeholder.com/300"
  },
  amenities: [String],
  description: { type: String },
  rules: {
    smoking: { type: Boolean, default: false },
    alcohol: { type: Boolean, default: false },
    visitors: { type: Boolean, default: true },
    pets: { type: Boolean, default: false },
    curfew: { type: String }
  },
  proofDocuments: {
    aadhaar: { type: String },
    electricityBill: { type: String },
    propertyTax: { type: String },
    agreement: { type: String }
  },
  documentVerification: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    notes: { type: String, default: '' },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: { type: Date }
  },
  facilities: [String],
  totalRooms: { type: Number, default: 0 },
  liveListings: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["live", "pending", "closed", "draft"],
    default: "draft"
  },
  rooms: [{
    // Supports both legacy `roomType` and incoming `type` naming.
    roomType: String,
    type: String,
    totalRooms: Number,
    bedsPerRoom: Number,
    rent: Number,
    deposit: Number,
    description: String
  }],
  roomPrices: {
    single: Number,
    double: Number,
    triple: Number,
    other: Number
  },
  roomDeposits: {
    single: Number,
    double: Number,
    triple: Number,
    other: Number
  }
}, {
  timestamps: true,
  collection: 'pgs'
});

// Indexes for better performance
pgSchema.index({ ownerId: 1 });
pgSchema.index({ status: 1 });
pgSchema.index({ city: 1 });
pgSchema.index({ pgName: 1 });

module.exports = mongoose.models.EasyPGPG || mongoose.model('EasyPGPG', pgSchema);
