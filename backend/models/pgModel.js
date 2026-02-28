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
    // Address Details [cite: 2026-02-12]
    area: { type: String }, // Area or landmark
    address: { type: String }, // Full address
    pincode: { type: String }, // 6-digit pincode
    city: { type: String }, // City name
    
    // --- ADD THE NEW SEARCH FIELDS HERE ---
    price: { 
      type: Number, 
      required: false // Make price optional for draft PGs
    },
    gender: {
      type: String,
      enum: ["Boys", "Girls", "Any"],
      default: "Any"
    },
    // Backward/admin compatibility alias for category
    type: {
      type: String,
      default: "Any"
    },
    occupancy: { 
      type: String, 
      enum: ["Single", "Double", "Triple", "Any"], 
      default: "Any" 
    },
    // Backward/admin compatibility alias for room type
    roomType: {
      type: String,
      default: "Any"
    },
    rentCycle: { 
      type: String, 
      default: "Monthly" 
    },
    // NEW: Fields for your "Available PGs" API [cite: 2026-01-11]
    mainImage: { 
      type: String, 
      default: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c" // Fallback image
    },
    // NEW: Array to store uploaded PG/room images
    images: [{
      type: String
    }],
    amenities: [String], // ["WiFi", "Laundry", "AC"] [cite: 2026-01-11]
    description: { type: String }, 
    inventory: {
      fanCount: { type: Number, default: 0 },
      lightCount: { type: Number, default: 0 },
      bedCount: { type: Number, default: 0 },
      mattressCount: { type: Number, default: 0 },
      cupboardCount: { type: Number, default: 0 },
      notes: { type: String, default: "" }
    },
    
    // Rules & Facilities [cite: 2026-02-12]
    rules: {
      smoking: { type: Boolean, default: false },
      alcohol: { type: Boolean, default: false },
      visitors: { type: Boolean, default: true },
      pets: { type: Boolean, default: false },
      curfew: { type: String } // Gate closing time (HH:MM format)
    },
    
    // Proof Documents [cite: 2026-02-12]
    proofDocuments: {
      aadhaar: { type: String }, // File path
      electricityBill: { type: String },
      propertyTax: { type: String }
    },
    proofDocumentMeta: {
      aadhaar: {
        status: { type: String, enum: ["Pending", "Uploaded", "Verified", "Rejected"], default: "Pending" },
        reviewedAt: { type: Date },
        reviewNote: { type: String, default: "" }
      },
      electricityBill: {
        status: { type: String, enum: ["Pending", "Uploaded", "Verified", "Rejected"], default: "Pending" },
        reviewedAt: { type: Date },
        reviewNote: { type: String, default: "" }
      },
      propertyTax: {
        status: { type: String, enum: ["Pending", "Uploaded", "Verified", "Rejected"], default: "Pending" },
        reviewedAt: { type: Date },
        reviewNote: { type: String, default: "" }
      }
    },
    agreementTemplate: {
      agreementFileUrl: { type: String },
      ownerSignatureUrl: { type: String },
      uploadedAt: { type: Date }
    },
    agreementTemplateMeta: {
      agreementFileUrl: {
        status: { type: String, enum: ["Pending", "Uploaded", "Verified", "Rejected"], default: "Pending" },
        reviewedAt: { type: Date },
        reviewNote: { type: String, default: "" }
      },
      ownerSignatureUrl: {
        status: { type: String, enum: ["Pending", "Uploaded", "Verified", "Rejected"], default: "Pending" },
        reviewedAt: { type: Date },
        reviewNote: { type: String, default: "" }
      }
    },
    facilities: [String], // ["WiFi", "Food", "Laundry", "Parking", "Power Backup", "AC"]
    
    totalRooms: { type: Number, default: 0 },
    liveListings: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["live", "pending", "closed", "draft", "rejected"],
      default: "draft"
    },
    // Admin-facing approval state (separate from listing status)
    approvalStatus: {
      type: String,
      enum: ["draft", "pending", "confirmed", "rejected"],
      default: "draft"
    },
    // Optional admin-facing operational status
    operationalStatus: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active"
    },
    securityDeposit: { type: Number, default: 0 },
    rooms: [{
      roomType: String,
      totalRooms: Number,
      bedsPerRoom: Number,
      occupiedBeds: {
        type: Number,
        default: 0
      },
      status: {
        type: String,
        enum: ["Active", "Full", "Maintenance"],
        default: "Active"
      },
      description: String
    }],
    roomPrices: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.PG || mongoose.model("PG", pgSchema);
