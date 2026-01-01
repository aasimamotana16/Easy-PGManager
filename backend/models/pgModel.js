const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true }, // Must match the value from your dropdown
  type: { type: String, enum: ['Paying Guest', 'Hostel Stay'], required: true },
  price: { type: Number, required: true },
  address: { type: String, required: true },
  amenities: [String],
  image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PG', pgSchema);