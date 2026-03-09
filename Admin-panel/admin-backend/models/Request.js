const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requestType: {
    type: String,
    required: true,
    enum: ['pg_booking', 'complaint', 'inquiry', 'maintenance'],
    default: 'inquiry'
  },
  requesterName: {
    type: String,
    required: true,
    trim: true
  },
  requesterEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  requesterPhone: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  requestStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolution: {
    type: String,
    default: null
  },
  relatedPG: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG',
    default: null
  },
  attachments: [{
    fileName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
requestSchema.index({ requestStatus: 1 });
requestSchema.index({ createdAt: -1 });
requestSchema.index({ requesterEmail: 1 });

module.exports = mongoose.model('Request', requestSchema);
