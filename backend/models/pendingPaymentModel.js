const mongoose = require("mongoose");

const pendingPaymentSchema = mongoose.Schema({
  tenant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  pg: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "PG"
  },
  pgName: {
    type: String,
    required: true
  },
  tenantName: {
    type: String,
    required: true
  },
  amount: { 
    type: Number, 
    required: true 
  },
  dueDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["Pending", "Overdue", "Paid"], 
    default: "Pending" 
  },
  month: {
    type: String,
    required: true
  },

  // Reminder tracking (non-breaking additions)
  dueDateReminderLastSentAt: {
    type: Date,
    default: null
  },
  dueDateReminderSentCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("PendingPayment", pendingPaymentSchema);
