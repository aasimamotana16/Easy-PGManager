// models/timelineModel.js
const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  events: [
    {
      title: String,      // e.g., "Booking Confirmed"
      description: String, // e.g., "Last Rent Paid: ₹6,000"
      date: { type: Date, default: Date.now },
      type: { type: String, enum: ["booking", "checkin", "payment", "agreement"] }
    }
  ],
  monthlyActivity: {
    checkins: [Number], // Data for your orange line chart
    payments: [Number]  // Data for your green line chart
  }
}, { timestamps: true });

module.exports = mongoose.model("Timeline", timelineSchema);