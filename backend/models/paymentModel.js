const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  pgId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "PG", 
    required: true 
  },
  amountPaid: { 
    type: Number, 
    required: true 
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