const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pgName: { type: String, required: true },
  status: { type: String, enum: ['live', 'pending', 'closed'], default: 'pending' },
  location: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PgListing', pgSchema);