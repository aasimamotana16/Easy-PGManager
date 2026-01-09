const mongoose = require("mongoose");

const pgSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // This string links to your User model correctly
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
    totalRooms: { 
      type: Number, 
      default: 0 
    },
    liveListings: { 
      type: Number, 
      default: 0 
    },
    status: {
      type: String,
      enum: ["live", "pending", "closed"],
      default: "live"
    },
    // Room details array
    rooms: [{
      roomType: String,
      totalRooms: Number,
      bedsPerRoom: Number,
      description: String
    }],
    // Prices object
    roomPrices: {
      single: Number,
      double: Number,
      triple: Number,
      other: Number
    }
  },
  { 
    timestamps: true 
  }
);

// SAFE EXPORT: Prevents OverwriteModelError
module.exports = mongoose.models.Pg || mongoose.model("Pg", pgSchema);