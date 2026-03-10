const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  pgId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "PG"
  },
  bookingRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    default: null
  },
  bookingCode: {
    type: String,
    default: null
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
  grossAmount: {
    type: Number,
    default: 0
  },
  commissionRatePercent: {
    type: Number,
    default: 0
  },
  platformCommissionAmount: {
    type: Number,
    default: 0
  },
  ownerPayoutAmount: {
    type: Number,
    default: 0
  },
  refundStatus: {
    type: String,
    enum: ["None", "Pending", "Processed", "Rejected"],
    default: "None"
  },
  refundedAmount: {
    type: Number,
    default: 0
  },
  refundedAt: {
    type: Date,
    default: null
  },
  // ADDED THIS: Crucial for your Payment History table
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
   // enum: ["UPI", "Card", "Cash", "Net Banking"], 
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
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
