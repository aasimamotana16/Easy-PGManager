const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
  agreementNumber: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  pg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG',
    required: true
  },
  tenantName: {
    type: String,
    required: true
  },
  tenantEmail: {
    type: String,
    required: true
  },
  tenantPhone: {
    type: String,
    required: true
  },
  tenantIdProof: {
    type: String,
    required: true
  },
  tenantIdProofNumber: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  deposit: {
    type: Number,
    required: true
  },
  terms: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'terminated'],
    default: 'active'
  },
  documentUrl: {
    type: String
  },
  signedByOwner: {
    type: Boolean,
    default: false
  },
  signedByTenant: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Agreement', agreementSchema);
