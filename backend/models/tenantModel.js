const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Matching your frontend object keys exactly
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  pgId: { type: Number, required: true }, // Using Number to match your PG_LIST ids
  room: { type: String, required: true }, // frontend uses 'room' not 'roomNumber'
  joiningDate: { type: String, required: true }, 
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);