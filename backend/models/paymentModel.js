import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  bookingId: String,
  amount: Number,
  status: { type: String, default: "Pending" }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;