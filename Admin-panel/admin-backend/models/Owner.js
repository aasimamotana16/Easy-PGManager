const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  ownerEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  ownerPhone: {
    type: String,
    required: true
  },
  ownerAddress: {
    type: String,
    required: true
  },
  idProofType: {
    type: String,
    required: true
  },
  idProofNumber: {
    type: String,
    required: true
  },
  ownerStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  totalPGs: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
ownerSchema.index({ ownerEmail: 1 });
ownerSchema.index({ ownerStatus: 1 });

module.exports = mongoose.model('Owner', ownerSchema);
