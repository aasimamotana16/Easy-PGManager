const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['boys', 'girls', 'co-living'],
    required: true
  },
  totalRooms: {
    type: Number,
    required: true
  },
  availableRooms: {
    type: Number,
    required: true
  },
  rentPerMonth: {
    type: Number,
    required: true
  },
  deposit: {
    type: Number,
    required: true
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PG', pgSchema);
