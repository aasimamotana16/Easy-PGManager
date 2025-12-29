import mongoose from "mongoose";

const pgSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    lookingFor: {
      type: String,
      enum: ["boys", "girls", "family"],
      required: true
    },

    occupancy: {
      type: String,
      enum: ["single", "double", "triple"],
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    rentCycle: {
      type: String,
      enum: ["monthly"],
      default: "monthly"
    },

    amenities: {
      type: [String],
      default: []
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("PG", pgSchema);