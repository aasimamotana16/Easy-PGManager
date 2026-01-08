const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  pgName: { 
    type: String, 
    required: true 
  },
  // Added these two fields to support your dashboard stats
  totalRooms: { 
    type: Number, 
    default: 0 
  },
  liveListings: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['live', 'pending', 'closed'], 
    default: 'pending' 
  },
  location: { 
    type: String 
  },
 
roomPrices: [
    {
      roomType: { type: String },
      pricePerMonth: { type: String },
      pricePerYear: { type: String },
      advancePayment: { type: String },
      optional2Beds: { type: String },
      optional3Beds: { type: String }
    }
  ], // Line 45: Array is closed correctly

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}); // T

module.exports = mongoose.model('PgListing', pgSchema);