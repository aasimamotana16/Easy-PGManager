const mongoose = require("mongoose");

const pgSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pgName: { 
      type: String, 
      required: [true, "Please add a PG name"] 
    },
    location: { 
      type: String, 
      required: [true, "Please add a location"] 
    },
    // NEW: Fields for your "Available PGs" API [cite: 2026-01-11]
    mainImage: { 
      type: String, 
      default: "https://via.placeholder.com/300" // Fallback image [cite: 2026-01-06]
    },
    amenities: [String], // ["WiFi", "Laundry", "AC"] [cite: 2026-01-11]
    description: { type: String }, 
    
    totalRooms: { type: Number, default: 0 },
    liveListings: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["live", "pending", "closed"],
      default: "live"
    },
    rooms: [{
      roomType: String,
      totalRooms: Number,
      bedsPerRoom: Number,
      description: String
    }],
    roomPrices: {
      single: Number,
      double: Number,
      triple: Number,
      other: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Pg || mongoose.model("Pg", pgSchema);