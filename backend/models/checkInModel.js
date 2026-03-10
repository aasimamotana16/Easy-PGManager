const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date }, // Null if currently checked in
  status: { type: String, enum: ['Present', 'Out', 'Pending'], default: 'Present' }
}, { timestamps: true });

module.exports = mongoose.model("CheckIn", checkInSchema);