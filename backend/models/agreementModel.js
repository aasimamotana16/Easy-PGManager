import mongoose from "mongoose";

const agreementSchema = new mongoose.Schema({
  bookingId: String,
  content: String
}, { timestamps: true });

const Agreement = mongoose.model("Agreement", agreementSchema);
export default Agreement;