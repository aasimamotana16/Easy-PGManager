import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: String,
  roomId: String,
  rent: Number,
  status: { type: String, default: "Pending" }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);