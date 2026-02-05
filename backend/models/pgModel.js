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

    // --- ADD THE NEW SEARCH FIELDS HERE ---
    price: { 
      type: Number, 
      required: false // Make price optional for draft PGs
    },
    type: { 
      type: String, 
      enum: ["Boys", "Girls", "Any"], 
      default: "Any" 
    },
    occupancy: { 
      type: String, 
      enum: ["Single", "Double", "Triple", "Any"], 
      default: "Any" 
    },
    rentCycle: { 
      type: String, 
      default: "Monthly" 
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
      enum: ["live", "pending", "closed", "draft"],
      default: "draft"
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

module.exports = mongoose.models.PG || mongoose.model("PG", pgSchema);