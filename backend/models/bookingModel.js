const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: String, required: true }, // e.g., "101"
  pgName: { type: String, required: true },
  roomType: { type: String, required: true }, // e.g., "Single" or "Double"
  tenantName: { type: String, required: true },
  checkInDate: { type: String, required: true },
  checkOutDate: { type: String, required: true },
  seatsBooked: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);