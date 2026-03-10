const mongoose = require('mongoose');

// Match your EasyPG Manager Payment model exactly
const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EasyPGBooking",
    default: null
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EasyPGUser",
    default: null
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "EasyPGUser", 
    required: true 
  },
  pgId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "EasyPGPG"
  },
  pgName: {
    type: String,
    default: null
  },
  tenantName: {
    type: String,
    default: null
  },
  amountPaid: { 
    type: Number, 
    required: true 
  },
  month: {
    type: String,
    required: true
  },
  paymentDate: { 
    type: Date, 
    default: Date.now 
  },
  paymentMethod: { 
    type: String, 
    default: "UPI" 
  },
  paymentStatus: { 
    type: String, 
    enum: ["Success", "Pending", "Failed"], 
    default: "Success" 
  },
  transactionId: { 
    type: String, 
    unique: true, 
    required: true 
  },
  nextPaymentDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'payments'
});

// Indexes for better performance
paymentSchema.index({ user: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ ownerId: 1 });
paymentSchema.index({ paymentStatus: 1 });

module.exports = mongoose.models.EasyPGPayment || mongoose.model('EasyPGPayment', paymentSchema);
